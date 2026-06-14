from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.services.coupon_service import calculate_pricing, list_coupons
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/coupons", tags=["Coupons"])


class ValidateCouponRequest(BaseModel):
    code: str
    subtotal: float = Field(ge=0)


@router.get("/")
def get_coupons(current_user=Depends(get_current_user)):
    return list_coupons()


@router.post("/validate")
def validate_coupon(
    payload: ValidateCouponRequest,
    current_user=Depends(get_current_user),
):
    return calculate_pricing(payload.subtotal, payload.code)
