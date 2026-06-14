from pydantic import BaseModel, Field
from datetime import date, datetime


class CheckoutItem(BaseModel):
    product_id: int
    product_name: str
    price: float
    quantity: int = Field(ge=1)


class CheckoutRequest(BaseModel):
    items: list[CheckoutItem]
    coupon_code: str | None = None
    points_used: int = 0
    payment_method: str | None = None
    delivery_slot: str | None = None
    delivery_address: str | None = None
    delivery_latitude: float | None = None
    delivery_longitude: float | None = None


class CheckoutSummary(BaseModel):
    subtotal: float
    delivery_fee: float
    discount: float
    points_discount: float = 0
    points_used: int = 0
    total: float
    applied_coupon: str | None = None
    payment_method: str | None = None
    delivery_slot: str | None = None
    delivery_address: str | None = None
    eta_minutes: int = 8


class OrderResponse(BaseModel):
    order_id: int
    user_id: int
    product_name: str
    price: float
    status: str
    carrier: str | None = None
    tracking_number: str | None = None
    current_location: str | None = None
    expected_delivery: date | None = None
    delivery_slot: str | None = None
    delivery_address: str | None = None
    delivery_latitude: float | None = None
    delivery_longitude: float | None = None
    created_at: datetime | None = None
    product_image: str | None = None

    class Config:
        from_attributes = True


class CheckoutResponse(BaseModel):
    orders: list[OrderResponse]
    summary: CheckoutSummary