from pydantic import BaseModel


class RiderResponse(BaseModel):
    rider_id: int
    name: str
    phone: str
    vehicle_number: str
    rating: float

    class Config:
        from_attributes = True