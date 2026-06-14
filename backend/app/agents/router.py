"""
Intent router for GoServe-related queries.
"""

from app.tools.track_order import track_order
from app.tools.refund_check import refund_check
from app.tools.cancel_order import cancel_order
from app.tools.escalate_issue import escalate_issue


def route_goserve_intent(user_query: str, history: list[dict] | None = None) -> str:
    query = user_query.lower()
    history_text = ""
    if history:
        history_text = " ".join(
            m.get("content", "") for m in history[-6:] if m.get("content")
        ).lower()

    combined = f"{query} {history_text}"

    if any(w in query for w in ["refund", "money back", "return money"]):
        return "refund"

    if "cancel" in query:
        return "cancel"

    if any(w in query for w in ["ticket", "tickets", "complaint", "my tickets"]):
        return "tickets"

    if any(w in query for w in ["profile", "my account", "my details", "my info"]):
        return "profile"

    if any(w in query for w in ["coupon", "coupons", "discount", "offer", "promo"]):
        return "coupons"

    if any(w in query for w in ["buy together", "group buy", "group order", "invite"]):
        return "group_buy"

    if any(w in query for w in ["recommend", "suggest", "show me product", "best product"]):
        return "recommend"

    if any(w in query for w in ["loyalty", "points", "reward"]):
        return "loyalty"

    if any(w in query for w in ["bag", "cart", "basket", "my bag"]):
        return "bag"

    if "wishlist" in query:
        return "wishlist"

    if any(w in query for w in ["payment", "pay", "upi", "wallet", "payment failed", "declined"]):
        return "payment"

    if any(w in query for w in ["human", "agent", "customer care", "escalate", "talk to"]):
        return "escalate"

    if any(w in combined for w in ["track", "where", "status", "delivery", "package", "shipped", "location"]):
        return "track"

    if any(w in query for w in ["my orders", "all orders", "order list", "recent orders"]):
        return "orders"

    if any(w in combined for w in ["order", "ordered", "headphones", "package"]):
        return "track"

    return "general"


def route_query(user_query: str):
    """Legacy router — kept for backward compatibility."""
    return route_goserve_intent(user_query)


def execute_tool(intent, db=None, user_id=None, user_query=None, order_id=None):
    if intent == "track":
        return track_order(db, user_id, user_query, order_id)

    if intent == "refund":
        return refund_check(db, user_id, order_id, user_query)

    if intent == "cancel":
        return cancel_order(order_id)

    if intent == "escalate":
        return escalate_issue()

    return "I can help you with tracking, refunds, cancellations, or connecting you to support."
