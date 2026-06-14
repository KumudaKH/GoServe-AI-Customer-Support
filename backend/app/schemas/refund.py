from pydantic import BaseModel


class RefundCheckRequest(BaseModel):
    order_id: int
    reason: str


class RefundResponse(BaseModel):
    eligible: bool
    reason: str
    next_steps: str


class RefundCreate(BaseModel):
    order_id: int
    reason: str