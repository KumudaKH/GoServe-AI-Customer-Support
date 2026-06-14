from sqlalchemy import Column, Integer, DateTime, ForeignKey
from datetime import datetime
from app.database.connection import Base


class DeliveryAssignment(Base):
    __tablename__ = "delivery_assignments"

    assignment_id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.order_id"), unique=True)
    rider_id = Column(Integer, ForeignKey("riders.rider_id"))

    assigned_time = Column(DateTime, default=datetime.utcnow)