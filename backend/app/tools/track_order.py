import re
from app.models.order import Order


def track_order(db, user_id, user_query=None, order_id=None):
    """
    Track order for the logged-in user.
    Priority:
    1. If order_id provided: search by order_id
    2. If user_query mentions specific order number (order #123): search by order_id
    3. If user_query mentions product name: search by product_name
    4. Otherwise: return latest order
    """
    # Debug prints
    print(f"DEBUG - Current user_id: {user_id}")
    print(f"Debug - user_query: {user_query}")
    
    # Validate inputs
    if db is None or user_id is None:
        print("Debug - db or user_id is None")
        return "Order not found."

    try:
        user_id = int(user_id)
    except (ValueError, TypeError):
        print(f"Debug - Failed to convert user_id to int: {user_id}")
        return "Order not found."

    # Get all orders for this user, ordered by order_id descending (latest first)
    all_user_orders = (
        db.query(Order)
        .filter(Order.user_id == user_id)
        .order_by(Order.order_id.desc())
        .all()
    )
    
    print(f"DEBUG - User {user_id} orders: {all_user_orders}")
    print(f"Debug - Total orders found for user_id {user_id}: {len(all_user_orders) if all_user_orders else 0}")

    if not all_user_orders:
        return (
            "You don't have any orders yet.\n\n"
            "Would you like to:\n"
            "- View demo orders\n"
            "- Create a support ticket\n"
            "- Talk to customer care"
        )

    orders = all_user_orders
    selected_order = None

    # Priority 1: If order_id parameter provided
    if order_id is not None:
        selected_order = next((o for o in orders if o.order_id == order_id), None)
        if selected_order:
            print(f"Debug - Found order by order_id parameter: {selected_order.order_id}")
            return format_order(selected_order)
        return f"Order #{order_id} not found."

    # Priority 2: If user_query mentions specific order number (order #123)
    if user_query:
        id_match = re.search(r"\border\s*#?\s*(\d+)\b", user_query.lower())
        if id_match:
            query_order_id = int(id_match.group(1))
            selected_order = next((o for o in orders if o.order_id == query_order_id), None)
            if selected_order:
                print(f"Debug - Found order by order number in query: {selected_order.order_id}")
                return format_order(selected_order)
            return f"Order #{query_order_id} not found."

        # Priority 3: If user_query mentions product name
        query_lower = user_query.lower()
        for order in orders:
            if order.product_name:
                product_lower = order.product_name.lower()
                if product_lower in query_lower or query_lower in product_lower:
                    print(f"Debug - Found order by product name: {order.order_id}")
                    return format_order(order)

    # Priority 4: Return latest order (default behavior)
    latest_order = orders[0]  # Already sorted by order_id desc
    print(f"Debug - Returning latest order: {latest_order.order_id}")
    return format_order(latest_order)


def format_order(order):
    """Format order details for display."""
    if not order:
        return "Order not found."

    live_note = ""
    if order.status not in ("Delivered", "Cancelled"):
        live_note = f"\nLive Map: /track/{order.order_id}"

    return (
        f"Your latest order:\n\n"
        f"Product: {order.product_name or 'Unknown'}\n"
        f"Order ID: {order.order_id}\n"
        f"Status: {order.status or 'Unknown'}\n"
        f"Carrier: {order.carrier or 'Unknown'}\n"
        f"Tracking Number: {order.tracking_number or 'Unknown'}\n"
        f"Current Location: {order.current_location or 'Unknown'}"
        f"{live_note}"
    )
