"""
GoServe internal service handler — fetches data from MySQL and returns structured results.
"""

import re
from datetime import date

from app.models.order import Order
from app.models.product import Product
from app.models.support_ticket import SupportTicket
from app.models.user import User
from app.models.group_order import GroupOrder
from app.models.group_member import GroupMember
from app.services.coupon_service import list_coupons, COUPONS
from app.services.group_services import get_my_groups
from app.tools.track_order import track_order, format_order

DEFAULT_LOYALTY_POINTS = 2450
POINTS_TO_RUPEE = 0.25


def _history_text(history: list[dict] | None) -> str:
    if not history:
        return ""
    return " ".join(
        msg.get("content", "") for msg in history[-10:] if msg.get("content")
    )


def _enrich_query(user_query: str, history: list[dict] | None) -> str:
    """Append conversation context so pronouns like 'it' resolve to products/orders."""
    if not history:
        return user_query
    context = _history_text(history)
    if not context:
        return user_query
    vague = ["where is it", "track it", "status of it", "refund it", "cancel it"]
    q_lower = user_query.lower()
    if any(v in q_lower for v in vague) or re.search(r"\b(it|that|this)\b", q_lower):
        return f"{user_query} [context: {context}]"
    return user_query


def handle_goserve_intent(
    intent: str,
    db,
    user_id: int,
    user_query: str,
    history: list[dict] | None = None,
    order_id: int | None = None,
    client_context: dict | None = None,
) -> dict:
    enriched = _enrich_query(user_query, history)
    client_context = client_context or {}

    handlers = {
        "track": _handle_track,
        "delivery": _handle_track,
        "orders": _handle_orders,
        "refund": _handle_refund,
        "cancel": _handle_cancel,
        "tickets": _handle_tickets,
        "profile": _handle_profile,
        "coupons": _handle_coupons,
        "group_buy": _handle_group_buy,
        "recommend": _handle_recommend,
        "loyalty": _handle_loyalty,
        "bag": _handle_bag,
        "wishlist": _handle_wishlist,
        "payment": _handle_payment,
        "escalate": _handle_escalate,
    }

    handler = handlers.get(intent, _handle_general_goserve)
    return handler(db, user_id, enriched, order_id, client_context, history)


def _handle_track(db, user_id, user_query, order_id, client_context, history):
    text = track_order(db, user_id, user_query, order_id)
    order = _find_order(db, user_id, user_query, order_id)
    cards = []
    if order:
        cards.append({"type": "order", "data": _order_to_dict(order)})
    return {
        "text": text,
        "cards": cards,
        "actions": [
            {"label": "📍 Live Map", "action": "track", "url": f"/track/{order.order_id}" if order else "/delivery"},
            {"label": "💰 Request Refund", "action": "refund", "url": "/refunds"},
            {"label": "🎫 Create Ticket", "action": "ticket", "url": "/chat"},
        ],
    }


def _find_order(db, user_id, user_query, order_id):
    orders = (
        db.query(Order)
        .filter(Order.user_id == user_id)
        .order_by(Order.order_id.desc())
        .all()
    )
    if not orders:
        return None

    if order_id:
        return next((o for o in orders if o.order_id == order_id), None)

    if user_query:
        id_match = re.search(r"\border\s*#?\s*(\d+)\b", user_query.lower())
        if id_match:
            oid = int(id_match.group(1))
            return next((o for o in orders if o.order_id == oid), None)

        for order in orders:
            if order.product_name and order.product_name.lower() in user_query.lower():
                return order

    return orders[0]


def _order_to_dict(order):
    return {
        "order_id": order.order_id,
        "product_name": order.product_name,
        "status": order.status,
        "carrier": order.carrier,
        "tracking_number": order.tracking_number,
        "current_location": order.current_location,
        "price": order.price,
        "expected_delivery": str(order.expected_delivery) if order.expected_delivery else None,
        "delivery_slot": order.delivery_slot,
    }


def _handle_orders(db, user_id, user_query, order_id, client_context, history):
    orders = (
        db.query(Order)
        .filter(Order.user_id == user_id)
        .order_by(Order.created_at.desc())
        .limit(5)
        .all()
    )
    if not orders:
        return {
            "text": "You don't have any orders yet. Browse products and place your first order!",
            "cards": [],
            "actions": [{"label": "🛍 Browse Products", "action": "browse", "url": "/products"}],
        }

    lines = ["Here are your recent orders:\n"]
    cards = []
    for o in orders:
        lines.append(f"- **#{o.order_id}** — {o.product_name} — _{o.status}_ — ₹{o.price:.0f}")
        cards.append({"type": "order", "data": _order_to_dict(o)})

    return {
        "text": "\n".join(lines),
        "cards": cards[:3],
        "actions": [{"label": "📦 View All Orders", "action": "orders", "url": "/orders"}],
    }


def _handle_refund(db, user_id, user_query, order_id, client_context, history):
    order = _find_order(db, user_id, user_query, order_id)
    if not order:
        return {
            "text": "I couldn't find an order to check refund eligibility for. Please specify an order number.",
            "cards": [],
            "actions": [{"label": "📦 My Orders", "action": "orders", "url": "/orders"}],
        }

    eligible = order.status in ("Delivered", "Cancelled", "Returned", "Placed", "Shipped")
    text = (
        f"### Refund Check — Order #{order.order_id}\n\n"
        f"| Field | Value |\n|-------|-------|\n"
        f"| Product | {order.product_name} |\n"
        f"| Status | {order.status} |\n"
        f"| Amount | ₹{order.price:.0f} |\n"
        f"| Eligible | {'✅ Yes' if eligible else '❌ No'} |\n\n"
    )
    if eligible:
        text += (
            "Your order is within the **7-day refund policy**. "
            "A refund will be processed within 3–5 business days once approved."
        )
    else:
        text += "This order may not be eligible for a refund. Contact support for help."

    return {
        "text": text,
        "cards": [{"type": "order", "data": _order_to_dict(order)}],
        "actions": [
            {"label": "💰 Refund Page", "action": "refund", "url": "/refunds"},
            {"label": "🎫 Create Ticket", "action": "ticket", "url": "/chat"},
        ],
    }


def _handle_cancel(db, user_id, user_query, order_id, client_context, history):
    order = _find_order(db, user_id, user_query, order_id)
    if not order:
        return {"text": "No order found to cancel.", "cards": [], "actions": []}

    if order.status in ("Delivered", "Cancelled"):
        return {
            "text": f"Order **#{order.order_id}** ({order.product_name}) is already **{order.status}** and cannot be cancelled.",
            "cards": [{"type": "order", "data": _order_to_dict(order)}],
            "actions": [],
        }

    return {
        "text": (
            f"Order **#{order.order_id}** ({order.product_name}) can be cancelled.\n\n"
            f"Current status: **{order.status}**\n\n"
            "To proceed, visit your orders page or create a support ticket and our team will assist you."
        ),
        "cards": [{"type": "order", "data": _order_to_dict(order)}],
        "actions": [
            {"label": "📦 My Orders", "action": "orders", "url": "/orders"},
            {"label": "🎫 Create Ticket", "action": "ticket", "url": "/chat"},
        ],
    }


def _handle_tickets(db, user_id, user_query, order_id, client_context, history):
    tickets = (
        db.query(SupportTicket)
        .filter(SupportTicket.user_id == user_id)
        .order_by(SupportTicket.created_at.desc())
        .limit(5)
        .all()
    )
    if not tickets:
        return {
            "text": "You don't have any support tickets yet. I can help you create one!",
            "cards": [],
            "actions": [{"label": "🎫 Create Ticket", "action": "ticket", "url": "/chat"}],
        }

    lines = ["### Your Support Tickets\n"]
    cards = []
    for t in tickets:
        lines.append(f"- **{t.ticket_id}** — {t.subject} — _{t.status}_ ({t.priority})")
        cards.append({
            "type": "ticket",
            "data": {
                "ticket_id": t.ticket_id,
                "subject": t.subject,
                "status": t.status,
                "priority": t.priority,
                "category": t.category,
            },
        })

    return {
        "text": "\n".join(lines),
        "cards": cards[:3],
        "actions": [{"label": "🎫 All Tickets", "action": "tickets", "url": "/tickets"}],
    }


def _handle_profile(db, user_id, user_query, order_id, client_context, history):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        return {"text": "Profile not found.", "cards": [], "actions": []}

    text = (
        f"### Your Profile\n\n"
        f"| Field | Value |\n|-------|-------|\n"
        f"| Name | {user.name} |\n"
        f"| Email | {user.email} |\n"
        f"| Phone | {user.phone or 'Not set'} |\n"
        f"| Address | {user.address or 'Not set'} |\n"
    )
    return {
        "text": text,
        "cards": [{"type": "profile", "data": {
            "name": user.name, "email": user.email,
            "phone": user.phone, "address": user.address,
        }}],
        "actions": [{"label": "👤 Edit Profile", "action": "profile", "url": "/profile"}],
    }


def _handle_coupons(db, user_id, user_query, order_id, client_context, history):
    coupons = list_coupons()
    lines = ["### Available Coupons\n"]
    cards = []
    for c in coupons:
        lines.append(f"- **{c['code']}** — {c['description']}")
        cards.append({"type": "coupon", "data": c})

    return {
        "text": "\n".join(lines),
        "cards": cards,
        "actions": [{"label": "🎟 Apply at Checkout", "action": "checkout", "url": "/checkout"}],
    }


def _handle_group_buy(db, user_id, user_query, order_id, client_context, history):
    groups = get_my_groups(db, user_id)
    if not groups:
        return {
            "text": (
                "### Buy Together\n\n"
                "You haven't joined any group orders yet. "
                "Start a group buy to split costs with friends and family!"
            ),
            "cards": [],
            "actions": [{"label": "👥 Buy Together", "action": "group", "url": "/buy-together"}],
        }

    lines = ["### Your Group Orders\n"]
    cards = []
    for g in groups:
        lines.append(
            f"- **{g.get('invite_code', 'N/A')}** — {g.get('product_name', 'Product')} "
            f"— _{g.get('status', 'open')}_"
        )
        cards.append({"type": "group", "data": g})

    return {
        "text": "\n".join(lines),
        "cards": cards[:3],
        "actions": [{"label": "👥 Buy Together", "action": "group", "url": "/buy-together"}],
    }


def _handle_recommend(db, user_id, user_query, order_id, client_context, history):
    search_term = None
    for word in ["recommend", "suggest", "show", "find", "best"]:
        if word in user_query.lower():
            parts = user_query.lower().split(word, 1)
            if len(parts) > 1 and parts[1].strip():
                search_term = parts[1].strip().strip("?").strip()
                break

    query = db.query(Product)
    if search_term:
        query = query.filter(Product.name.ilike(f"%{search_term}%"))
    products = query.order_by(Product.id).limit(6).all()

    if not products:
        products = db.query(Product).order_by(Product.id).limit(6).all()

    lines = ["### Recommended Products\n"]
    cards = []
    for p in products:
        lines.append(f"- **{p.name}** — ₹{p.price:.0f} ({p.category})")
        cards.append({
            "type": "product",
            "data": {
                "id": p.id,
                "name": p.name,
                "price": p.price,
                "category": p.category,
                "image_url": p.image_url,
                "stock": p.stock,
            },
        })

    return {
        "text": "\n".join(lines),
        "cards": cards,
        "actions": [{"label": "🛍 Browse All", "action": "browse", "url": "/products"}],
    }


def _handle_loyalty(db, user_id, user_query, order_id, client_context, history):
    points = client_context.get("loyalty_points", DEFAULT_LOYALTY_POINTS)
    rupee_value = round(points * POINTS_TO_RUPEE, 2)
    text = (
        f"### Loyalty Points\n\n"
        f"| Metric | Value |\n|--------|-------|\n"
        f"| Available Points | **{points}** |\n"
        f"| Redeemable Value | **₹{rupee_value}** |\n"
        f"| Conversion | 100 pts = ₹25 |\n\n"
        "You can redeem up to **20%** of your order total using loyalty points at checkout."
    )
    return {
        "text": text,
        "cards": [{"type": "loyalty", "data": {"points": points, "value": rupee_value}}],
        "actions": [{"label": "🛒 Checkout", "action": "checkout", "url": "/checkout"}],
    }


def _handle_bag(db, user_id, user_query, order_id, client_context, history):
    items = client_context.get("cart_items", [])
    if not items:
        return {
            "text": "Your bag is empty. Add some products to get started!",
            "cards": [],
            "actions": [{"label": "🛍 Browse Products", "action": "browse", "url": "/products"}],
        }

    lines = ["### Your Bag\n"]
    total = 0
    cards = []
    for item in items:
        qty = item.get("quantity", 1)
        price = item.get("price", 0)
        line_total = price * qty
        total += line_total
        name = item.get("name", "Item")
        lines.append(f"- **{name}** × {qty} — ₹{line_total:.0f}")
        cards.append({"type": "cart_item", "data": item})

    lines.append(f"\n**Subtotal: ₹{total:.0f}**")
    return {
        "text": "\n".join(lines),
        "cards": cards[:5],
        "actions": [
            {"label": "🛒 View Bag", "action": "bag", "url": "/bag"},
            {"label": "💳 Checkout", "action": "checkout", "url": "/checkout"},
        ],
    }


def _handle_wishlist(db, user_id, user_query, order_id, client_context, history):
    items = client_context.get("wishlist", [])
    if not items:
        return {
            "text": "Your wishlist is empty. Save products you love for later!",
            "cards": [],
            "actions": [{"label": "🛍 Browse Products", "action": "browse", "url": "/products"}],
        }

    lines = ["### Your Wishlist\n"]
    cards = []
    for item in items:
        name = item.get("name", "Product")
        price = item.get("price", 0)
        lines.append(f"- **{name}** — ₹{price}")
        cards.append({"type": "wishlist_item", "data": item})

    return {
        "text": "\n".join(lines),
        "cards": cards,
        "actions": [{"label": "❤️ View Wishlist", "action": "wishlist", "url": "/wishlist"}],
    }


def _handle_payment(db, user_id, user_query, order_id, client_context, history):
    failed = "fail" in user_query.lower() or "declined" in user_query.lower()
    if failed:
        text = (
            "### Payment Issue\n\n"
            "Sorry your payment didn't go through. Here's what you can try:\n\n"
            "- Check your UPI/bank balance\n"
            "- Try a different payment method (UPI, Wallet, COD)\n"
            "- Ensure your card/UPI limit isn't exceeded\n"
            "- Wait 2 minutes and retry\n\n"
            "If the amount was debited, it will be auto-refunded within **24–48 hours**."
        )
    else:
        text = (
            "### Payment Methods\n\n"
            "GoServe supports:\n\n"
            "- **UPI** — Google Pay, PhonePe, Paytm, BHIM\n"
            "- **Wallet** — GoServe wallet balance\n"
            "- **Cash on Delivery**\n\n"
            "Loyalty points and coupons can be applied at checkout."
        )

    return {
        "text": text,
        "cards": [],
        "actions": [
            {"label": "💳 Payments", "action": "payments", "url": "/payments"},
            {"label": "🛒 Checkout", "action": "checkout", "url": "/checkout"},
        ],
    }


def _handle_escalate(db, user_id, user_query, order_id, client_context, history):
    return {
        "text": (
            "I'll connect you with our customer care team.\n\n"
            "You can create a support ticket and an executive will reach out shortly. "
            "Average response time: **under 2 hours**."
        ),
        "cards": [],
        "actions": [{"label": "🎫 Create Ticket", "action": "ticket", "url": "/chat"}],
    }


def _handle_general_goserve(db, user_id, user_query, order_id, client_context, history):
    latest = (
        db.query(Order)
        .filter(Order.user_id == user_id)
        .order_by(Order.order_id.desc())
        .first()
    )
    if latest:
        return _handle_track(db, user_id, user_query, order_id, client_context, history)

    return {
        "text": (
            "I'm your GoServe assistant! I can help with:\n\n"
            "- 📦 Order tracking & delivery\n"
            "- 💰 Refunds & cancellations\n"
            "- 🎫 Support tickets\n"
            "- 👤 Profile & account\n"
            "- 🎟 Coupons & loyalty points\n"
            "- 👥 Buy Together group orders\n"
            "- 🛍 Product recommendations\n\n"
            "What would you like help with?"
        ),
        "cards": [],
        "actions": [
            {"label": "📦 Track Order", "action": "track", "url": "/orders"},
            {"label": "🛍 Products", "action": "browse", "url": "/products"},
        ],
    }
