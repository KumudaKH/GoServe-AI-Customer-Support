from pydantic import BaseModel
from datetime import datetime


class TicketCreate(BaseModel):
    subject: str
    category: str
    description: str
    priority: str
    order_id: int | None = None


class TicketResponse(BaseModel):
    ticket_id: str
    user_id: int
    order_id: int | None = None
    subject: str
    category: str
    description: str
    priority: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True