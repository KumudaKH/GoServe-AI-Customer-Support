from sqlalchemy import Column, Integer, String, Boolean, Text
from app.database.connection import Base


class RefundPolicy(Base):
    __tablename__ = "refund_policies"

    policy_id = Column(Integer, primary_key=True, index=True)
    condition = Column(String(255), nullable=False)
    allowed = Column(Boolean, nullable=False)
    explanation = Column(Text, nullable=False)