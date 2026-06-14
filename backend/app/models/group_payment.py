from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey
from datetime import datetime
from app.database.connection import Base


class GroupPayment(Base):
    __tablename__ = "group_payments"

    payment_id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("group_orders.group_id"))
    member_id = Column(Integer, ForeignKey("group_members.member_id"))
    amount = Column(Float, nullable=False)
    payment_ref = Column(String(200))
    status = Column(String(50), default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
