from sqlalchemy import Column, Integer, String, Float
from app.database.connection import Base


class Rider(Base):
    __tablename__ = "riders"

    rider_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    vehicle_number = Column(String(50), nullable=False)
    rating = Column(Float)