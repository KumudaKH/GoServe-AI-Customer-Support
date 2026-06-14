"""
Simulated live delivery tracking for GoServe Express.
Coordinates move along a route based on order status and elapsed time.
"""

import math
from datetime import datetime, timezone

# Mysore dark-store hub (GoServe Express warehouse)
DARK_STORE = {"lat": 12.2958, "lng": 76.6394, "name": "GoServe Dark Store — Vijayanagar"}

# Destination zones keyed by order_id mod — only used when ALL fallbacks fail
DESTINATIONS = [
    {"lat": 12.3088, "lng": 76.6525, "area": "Gokulam"},
    {"lat": 12.2742, "lng": 76.6412, "area": "Saraswathipuram"},
    {"lat": 12.3201, "lng": 76.6213, "area": "Hebbal"},
    {"lat": 12.2867, "lng": 76.6710, "area": "Bannimantap"},
    {"lat": 12.3034, "lng": 76.6089, "area": "Kuvempunagar"},
]

RIDERS = [
    {"rider_id": 1, "name": "Ravi Kumar", "phone": "+91 98765 43210", "vehicle": "KA-09-ME-4521", "rating": 4.9},
    {"rider_id": 2, "name": "Priya Sharma", "phone": "+91 98765 43211", "vehicle": "KA-09-ME-4522", "rating": 4.8},
    {"rider_id": 3, "name": "Arjun Reddy", "phone": "+91 98765 43212", "vehicle": "KA-09-ME-4523", "rating": 4.7},
]

STATUS_PROGRESS = {
    "Placed": 0.05,
    "Order Received": 0.10,
    "Packed": 0.25,
    "Shipped": 0.50,
    "Out for Delivery": 0.78,
    "Delivered": 1.0,
    "Cancelled": 0.0,
}

STATUS_LABELS = [
    ("Placed", "Order confirmed"),
    ("Packed", "Packed at dark store"),
    ("Shipped", "Left warehouse"),
    ("Out for Delivery", "Rider en route"),
    ("Delivered", "Delivered"),
]


def _lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * max(0.0, min(1.0, t))


def _interpolate_route(progress: float, order_id: int = 0, order=None, profile_coords: dict | None = None) -> dict:
    """Move from dark store → hub → destination along waypoints."""
    hub = {"lat": 12.3000, "lng": 76.6450}
    dest = _destination_for_order(order_id, order, profile_coords)
    if progress <= 0.33:
        t = progress / 0.33
        lat = _lerp(DARK_STORE["lat"], hub["lat"], t)
        lng = _lerp(DARK_STORE["lng"], hub["lng"], t)
    elif progress <= 0.66:
        t = (progress - 0.33) / 0.33
        mid_lat = _lerp(hub["lat"], dest["lat"], 0.35)
        mid_lng = _lerp(hub["lng"], dest["lng"], 0.35)
        lat = _lerp(hub["lat"], mid_lat, t)
        lng = _lerp(hub["lng"], mid_lng, t)
    else:
        t = (progress - 0.66) / 0.34
        mid_lat = _lerp(hub["lat"], dest["lat"], 0.35)
        mid_lng = _lerp(hub["lng"], dest["lng"], 0.35)
        lat = _lerp(mid_lat, dest["lat"], t)
        lng = _lerp(mid_lng, dest["lng"], t)
    return {"lat": round(lat, 6), "lng": round(lng, 6)}


def _destination_for_order(order_id: int, order=None, profile_coords: dict | None = None) -> dict:
    # 1. Use delivery coordinates stored on the order (from checkout pin)
    if order is not None and getattr(order, "delivery_latitude", None) is not None and getattr(order, "delivery_longitude", None) is not None:
        return {
            "lat": order.delivery_latitude,
            "lng": order.delivery_longitude,
            "area": order.delivery_address or "Delivery location",
        }
    # 2. Fall back to user's saved profile location
    if profile_coords and profile_coords.get("lat") and profile_coords.get("lng"):
        return {
            "lat": profile_coords["lat"],
            "lng": profile_coords["lng"],
            "area": profile_coords.get("address", "Saved location"),
        }
    # 3. Last resort: dummy destination
    dest = DESTINATIONS[order_id % len(DESTINATIONS)]
    return {"lat": dest["lat"], "lng": dest["lng"], "area": dest["area"]}


def _rider_for_order(order_id: int) -> dict:
    return RIDERS[order_id % len(RIDERS)]


def _eta_minutes(status: str, progress: float, delivery_slot: str | None) -> int:
    if status == "Delivered":
        return 0
    if status == "Cancelled":
        return -1
    if delivery_slot and "8" in delivery_slot:
        base = 8
    elif delivery_slot and "15" in delivery_slot:
        base = 15
    else:
        base = 25
    remaining = max(1, int(base * (1 - progress)))
    return remaining


def _distance_km(lat1, lng1, lat2, lng2) -> float:
    r = 6371
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng / 2) ** 2
    return round(2 * r * math.asin(math.sqrt(a)), 2)


def get_live_tracking(order, db=None, profile_coords: dict | None = None) -> dict:
    """Build live tracking payload for an order."""
    order_id = order.order_id
    status = order.status or "Placed"
    progress = STATUS_PROGRESS.get(status, 0.15)

    if status not in ("Delivered", "Cancelled") and order.created_at:
        created = order.created_at
        if created.tzinfo is None:
            created = created.replace(tzinfo=timezone.utc)
        elapsed_min = (datetime.now(timezone.utc) - created).total_seconds() / 60
        time_boost = min(0.35, elapsed_min / 120)
        progress = min(0.95, progress + time_boost) if status == "Out for Delivery" else min(0.85, progress + time_boost * 0.5)

    dest = _destination_for_order(order_id, order, profile_coords)
    rider = _rider_for_order(order_id)

    if status == "Delivered":
        location = {"lat": dest["lat"], "lng": dest["lng"]}
        location_label = f"Delivered to {order.delivery_address or dest['area']}"
    elif status in ("Packed", "Placed", "Order Received"):
        location = {"lat": DARK_STORE["lat"], "lng": DARK_STORE["lng"]}
        location_label = DARK_STORE["name"]
    elif status == "Shipped":
        location = _interpolate_route(0.4, order_id, order, profile_coords)
        location_label = "En route from warehouse"
    else:
        location = _interpolate_route(progress, order_id, order, profile_coords)
        location_label = f"Near {order.delivery_address or dest['area']} — {int(progress * 100)}% of route complete"

    dist_remaining = _distance_km(location["lat"], location["lng"], dest["lat"], dest["lng"])
    eta = _eta_minutes(status, progress, getattr(order, "delivery_slot", None))

    trail = []
    for p in [0.1, 0.25, 0.4, 0.55, 0.7, min(progress, 0.95)]:
        trail.append(_interpolate_route(p, order_id, order, profile_coords))

    return {
        "order_id": order_id,
        "status": status,
        "progress_percent": int(progress * 100),
        "live_location": {
            "lat": location["lat"],
            "lng": location["lng"],
            "label": location_label,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        },
        "destination": {
            "lat": dest["lat"],
            "lng": dest["lng"],
            "area": dest["area"],
            "address": order.delivery_address or f"{dest['area']}, Mysuru, Karnataka 570001",
        },
        "origin": DARK_STORE,
        "rider": rider if status in ("Shipped", "Out for Delivery", "Delivered") else None,
        "eta_minutes": eta,
        "distance_remaining_km": dist_remaining if status != "Delivered" else 0,
        "trail": trail,
        "delivery_otp": f"{1000 + (order_id % 9000)}" if status == "Out for Delivery" else None,
        "is_live": status not in ("Delivered", "Cancelled"),
    }


def get_delivery_stats() -> dict:
    return {
        "riders_online": 47,
        "dark_stores_active": 3,
        "avg_delivery_mins": 11,
        "orders_in_transit": 128,
        "express_zones": ["Vijayanagar", "Gokulam", "Hebbal", "Saraswathipuram"],
    }
