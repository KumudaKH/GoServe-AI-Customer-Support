from pydantic import BaseModel, EmailStr
from typing import Optional


class ProfileOut(BaseModel):
    user_id: int
    name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    dob: Optional[str] = None
    gender: Optional[str] = None
    profile_photo: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    class Config:
        from_attributes = True


class ProfileUpdate(BaseModel):
    name: Optional[str]
    email: Optional[EmailStr]
    phone: Optional[str]
    address: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    dob: Optional[str]
    gender: Optional[str]
    profile_image: Optional[str]
