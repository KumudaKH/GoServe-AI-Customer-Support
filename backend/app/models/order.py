from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey
from datetime import datetime
from app.database.connection import Base


class Order(Base):
    __tablename__ = "orders"

    order_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))

    product_name = Column(String(200), nullable=False)
    price = Column(Float, nullable=False)

    status = Column(String(50), nullable=False)

    carrier = Column(String(100))
    tracking_number = Column(String(100))
    current_location = Column(String(200))
    expected_delivery = Column(Date)

    delivery_slot = Column(String(100))
    delivery_address = Column(String(255))
    delivery_latitude = Column(Float)
    delivery_longitude = Column(Float)

    created_at = Column(DateTime, default=datetime.utcnow)