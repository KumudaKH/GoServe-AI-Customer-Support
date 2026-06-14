from sqlalchemy import Column, Integer, Float, DateTime, Boolean, ForeignKey
from datetime import datetime
from app.database.connection import Base


class GroupMember(Base):
    __tablename__ = "group_members"

    member_id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("group_orders.group_id"))
    user_id = Column(Integer, ForeignKey("users.user_id"))
    contributed_amount = Column(Float, default=0.0)
    has_paid = Column(Boolean, default=False)
    joined_at = Column(DateTime, default=datetime.utcnow)
