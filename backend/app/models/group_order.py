from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from datetime import datetime
from app.database.connection import Base


class GroupOrder(Base):
    __tablename__ = "group_orders"

    group_id = Column(Integer, primary_key=True, index=True)
    invite_code = Column(String(50), unique=True, index=True)
    product_name = Column(String(200), nullable=False)
    price = Column(Float, nullable=False)
    leader_user_id = Column(Integer, ForeignKey("users.user_id"))
    status = Column(String(50), default="open")
    placed_order_id = Column(Integer, ForeignKey("orders.order_id"))

    created_at = Column(DateTime, default=datetime.utcnow)
