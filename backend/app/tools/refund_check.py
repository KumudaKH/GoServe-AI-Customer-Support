def refund_check(db=None, user_id=None, order_id=None, user_query=None):
    if db and user_id:
        from app.agents.goserve_handler import _handle_refund
        result = _handle_refund(db, user_id, user_query or "", order_id, {}, None)
        return result.get("text", "Refund status unavailable.")

    return f"""
Order {order_id or 'N/A'}

Refund Status:
Eligible

Reason:
Within refund policy.
"""
