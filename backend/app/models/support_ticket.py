from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from datetime import datetime
from app.database.connection import Base


class SupportTicket(Base):
    __tablename__ = "support_tickets"

    ticket_id = Column(String(20), primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    order_id = Column(Integer, ForeignKey("orders.order_id"), nullable=True)

    subject = Column(String(255), nullable=False)
    summary = Column(Text, nullable=True)
    category = Column(String(50), default="General")
    description = Column(Text, nullable=False)
    priority = Column(String(20), default="Medium")
    status = Column(String(20), default="Open")

    created_at = Column(DateTime, default=datetime.utcnow, index=True)