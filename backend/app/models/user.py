
from sqlalchemy import Column, Float, Integer, String, DateTime, Text
from sqlalchemy import Date

from app.database.connection import Base


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False)

    email = Column(String(100), unique=True, nullable=False)

    phone = Column(String(20))
    address = Column(String(255))
    latitude = Column(Float)
    longitude = Column(Float)
    dob = Column(Date)
    gender = Column(String(20))
    profile_photo = Column(Text)

    password_hash = Column(String(255), nullable=False)

    role = Column(String(20))

    created_at = Column(DateTime)
