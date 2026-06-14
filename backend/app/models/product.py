from sqlalchemy import Column, Integer, String, Float, Text
from app.database.connection import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    original_price = Column(Float, nullable=True)
    image_url = Column(String(500))
    category = Column(String(100))
    stock = Column(Integer, default=10)
