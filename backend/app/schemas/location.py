from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class LocationUpdate(BaseModel):
    """Schema for real-time location updates from delivery partner"""
    lat: float
    lng: float
    heading: Optional[float] = None  # Bearing/direction in degrees
    speed: Optional[float] = None  # Speed in km/h
    accuracy: Optional[float] = None  # GPS accuracy in meters

class LocationData(BaseModel):
    """Complete location data with metadata"""
    lat: float
    lng: float
    heading: Optional[float] = None
    speed: Optional[float] = None
    accuracy: Optional[float] = None
    timestamp: Optional[datetime] = None
    last_updated: Optional[datetime] = None

class LocationResponse(BaseModel):
    """Response for fetching last known location"""
    order_id: int
    lat: float
    lng: float
    heading: Optional[float] = None
    speed: Optional[float] = None
    accuracy: Optional[float] = None
    last_updated: datetime
    
    class Config:
        from_attributes = True
