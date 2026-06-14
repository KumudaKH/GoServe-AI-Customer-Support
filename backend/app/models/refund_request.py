from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from datetime import datetime
from app.database.connection import Base


class RefundRequest(Base):
    __tablename__ = "refund_requests"

    refund_id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.order_id"))
    user_id = Column(Integer, ForeignKey("users.user_id"))

    reason = Column(Text, nullable=False)
    status = Column(String(50), default="Pending")

    created_at = Column(DateTime, default=datetime.utcnow)