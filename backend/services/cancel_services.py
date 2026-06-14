from sqlalchemy.orm import Session
from app.models.order import Order


def cancel_order(db: Session, order_id: int):
    order = db.query(Order).filter(
        Order.order_id == order_id
    ).first()

    if not order:
        return None

    order.status = "Cancelled"
    db.commit()
    db.refresh(order)

    return order