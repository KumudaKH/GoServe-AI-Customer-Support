from sqlalchemy.orm import Session
from app.models.order import Order


def get_order(db: Session, order_id: int):
    return db.query(Order).filter(Order.order_id == order_id).first()


def get_all_orders(db: Session):
    return db.query(Order).all()