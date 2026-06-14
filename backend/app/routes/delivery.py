from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.order import Order
from app.models.user import User
from app.utils.dependencies import get_current_user
from app.services.delivery_tracking import get_live_tracking, get_delivery_stats

router = APIRouter(prefix="/api/delivery", tags=["Delivery"])


def _profile_coords(db: Session, user_id: int) -> dict | None:
    user = db.query(User).filter(User.user_id == user_id).first()
    if user and user.latitude and user.longitude:
        return {"lat": float(user.latitude), "lng": float(user.longitude), "address": user.address or ""}
    return None


@router.get("/stats")
def delivery_stats(current_user=Depends(get_current_user)):
    return get_delivery_stats()


@router.get("/active")
def active_deliveries(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """All in-transit orders with live location for the logged-in user."""
    user_id = int(current_user["sub"])
    profile_coords = _profile_coords(db, user_id)
    orders = (
        db.query(Order)
        .filter(
            Order.user_id == user_id,
            Order.status.notin_(["Delivered", "Cancelled"]),
        )
        .order_by(Order.created_at.desc())
        .all()
    )

    return {
        "count": len(orders),
        "deliveries": [
            {
                "order_id": o.order_id,
                "product_name": o.product_name,
                "status": o.status,
                "tracking": get_live_tracking(o, db, profile_coords),
            }
            for o in orders
        ],
    }


@router.get("/live/{order_id}")
def live_location(
    order_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Live GPS-style tracking for a single order."""
    user_id = int(current_user["sub"])
    profile_coords = _profile_coords(db, user_id)
    order = (
        db.query(Order)
        .filter(Order.order_id == order_id, Order.user_id == user_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    tracking = get_live_tracking(order, db, profile_coords)
    return {
        "order_id": order.order_id,
        "product_name": order.product_name,
        "price": order.price,
        "status": order.status,
        "carrier": order.carrier,
        "tracking_number": order.tracking_number,
        "current_location": order.current_location,
        "delivery_slot": order.delivery_slot,
        "expected_delivery": order.expected_delivery,
        "created_at": order.created_at,
        **tracking,
    }
