from dataclasses import dataclass


@dataclass
class Coupon:
    code: str
    description: str
    discount_type: str  # "percent" | "flat"
    discount_value: float
    min_order: float = 0
    max_discount: float | None = None


COUPONS: dict[str, Coupon] = {
    "SAVE10": Coupon(
        code="SAVE10",
        description="10% off on orders above ₹299",
        discount_type="percent",
        discount_value=10,
        min_order=299,
        max_discount=500,
    ),
    "FLAT50": Coupon(
        code="FLAT50",
        description="Flat ₹50 off on orders above ₹199",
        discount_type="flat",
        discount_value=50,
        min_order=199,
    ),
    "GOSERVE20": Coupon(
        code="GOSERVE20",
        description="20% off — GoServe welcome offer",
        discount_type="percent",
        discount_value=20,
        min_order=499,
        max_discount=800,
    ),
    "QUICK8": Coupon(
        code="QUICK8",
        description="₹80 off on 8-min express delivery orders",
        discount_type="flat",
        discount_value=80,
        min_order=399,
    ),
    "FREESHIP": Coupon(
        code="FREESHIP",
        description="Free delivery on orders above ₹149",
        discount_type="flat",
        discount_value=29,
        min_order=149,
    ),
}

DELIVERY_FEE = 29
FREE_DELIVERY_MIN = 199
POINTS_TO_RUPEE = 0.25  # 100 points = ₹25
MAX_POINTS_PERCENT = 0.20  # max 20% of subtotal redeemable via points


def calculate_pricing(
    subtotal: float,
    coupon_code: str | None = None,
    points_used: int = 0,
) -> dict:
    delivery_fee = 0 if subtotal >= FREE_DELIVERY_MIN else DELIVERY_FEE
    discount = 0.0
    applied_coupon = None
    message = None

    if coupon_code:
        coupon = COUPONS.get(coupon_code.upper().strip())
        if coupon is None:
            return {
                "subtotal": round(subtotal, 2),
                "delivery_fee": delivery_fee,
                "discount": 0,
                "total": round(subtotal + delivery_fee, 2),
                "applied_coupon": None,
                "message": "Invalid coupon code",
                "valid": False,
            }

        if subtotal < coupon.min_order:
            return {
                "subtotal": round(subtotal, 2),
                "delivery_fee": delivery_fee,
                "discount": 0,
                "total": round(subtotal + delivery_fee, 2),
                "applied_coupon": None,
                "message": f"Minimum order ₹{coupon.min_order:.0f} required for {coupon.code}",
                "valid": False,
            }

        if coupon.discount_type == "percent":
            discount = subtotal * (coupon.discount_value / 100)
            if coupon.max_discount is not None:
                discount = min(discount, coupon.max_discount)
        else:
            discount = coupon.discount_value
            if coupon.code == "FREESHIP":
                delivery_fee = 0
                discount = DELIVERY_FEE if subtotal < FREE_DELIVERY_MIN else 0

        discount = min(discount, subtotal)
        applied_coupon = coupon.code
        message = f"{coupon.description} applied"

    points_discount = 0.0
    if points_used > 0:
        max_points_value = subtotal * MAX_POINTS_PERCENT
        points_discount = min(points_used * POINTS_TO_RUPEE, max_points_value)
        points_discount = min(points_discount, subtotal - discount)

    total = max(subtotal + delivery_fee - discount - points_discount, 0)

    return {
        "subtotal": round(subtotal, 2),
        "delivery_fee": round(delivery_fee, 2),
        "discount": round(discount, 2),
        "points_discount": round(points_discount, 2),
        "points_used": points_used if points_discount > 0 else 0,
        "total": round(total, 2),
        "applied_coupon": applied_coupon,
        "message": message,
        "valid": applied_coupon is not None or coupon_code is None,
    }


def list_coupons() -> list[dict]:
    return [
        {
            "code": c.code,
            "description": c.description,
            "discount_type": c.discount_type,
            "discount_value": c.discount_value,
            "min_order": c.min_order,
            "max_discount": c.max_discount,
        }
        for c in COUPONS.values()
    ]
