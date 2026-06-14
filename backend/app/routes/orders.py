from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.database.product_images import extract_base_name, normalize_image_url
from app.models.order import Order
from app.models.product import Product
from app.schemas.order import (
    CheckoutRequest,
    CheckoutResponse,
    CheckoutSummary,
    OrderResponse,
)
from app.services.coupon_service import calculate_pricing
from app.utils.dependencies import get_current_user

router = APIRouter(
    prefix="/api/orders",
    tags=["Orders"]
)


def _product_image_for_name(db: Session, product_name: str) -> str | None:
    product = db.query(Product).filter(Product.name == product_name).first()
    if product is None:
        base_name = extract_base_name(product_name)
        product = (
            db.query(Product)
            .filter(Product.name.like(f"{base_name}%"))
            .first()
        )
    if product is None:
        return None

    return normalize_image_url(
        product.image_url,
        product.category,
        extract_base_name(product.name),
    )


@router.get("/", response_model=list[OrderResponse])
def get_all_orders(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    user_id = int(current_user["sub"])

    orders = (
        db.query(Order)
        .filter(Order.user_id == user_id)
        .order_by(Order.created_at.desc())
        .all()
    )

    return [
        {
            "order_id": order.order_id,
            "user_id": order.user_id,
            "product_name": order.product_name,
            "price": order.price,
            "status": order.status,
            "carrier": order.carrier,
            "tracking_number": order.tracking_number,
            "current_location": order.current_location,
            "expected_delivery": order.expected_delivery,
            "delivery_slot": order.delivery_slot,
            "delivery_address": order.delivery_address,
            "delivery_latitude": order.delivery_latitude,
            "delivery_longitude": order.delivery_longitude,
            "created_at": order.created_at,
            "product_image": _product_image_for_name(db, order.product_name),
        }
        for order in orders
    ]


@router.post("/checkout", response_model=CheckoutResponse)
def checkout(
    payload: CheckoutRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if not payload.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    user_id = int(current_user["sub"])
    subtotal = sum(item.price * item.quantity for item in payload.items)
    pricing = calculate_pricing(
        subtotal, payload.coupon_code, payload.points_used or 0
    )

    if payload.coupon_code and not pricing["valid"]:
        raise HTTPException(status_code=400, detail=pricing["message"] or "Invalid coupon")

    created_orders = []
    item_count = len(payload.items)
    discount_share = pricing["discount"] / item_count if item_count else 0

    for item in payload.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()

        if product is None:
            raise HTTPException(
                status_code=404,
                detail=f"Product {item.product_id} not found",
            )

        if product.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Not enough stock for {product.name}",
            )

        product.stock -= item.quantity

        line_total = round(item.price * item.quantity - discount_share, 2)

        order = Order(
            user_id=user_id,
            product_name=item.product_name,
            price=line_total,
            status="Placed",
            delivery_slot=payload.delivery_slot,
            delivery_address=payload.delivery_address,
            delivery_latitude=payload.delivery_latitude,
            delivery_longitude=payload.delivery_longitude,
            expected_delivery=date.today(),
            carrier="GoServe Express",
            tracking_number=f"GS{user_id}{product.id}{item.quantity}",
            current_location="Packing at dark store",
        )
        db.add(order)
        created_orders.append(order)

    db.commit()

    for order in created_orders:
        db.refresh(order)

    summary = CheckoutSummary(
        subtotal=pricing["subtotal"],
        delivery_fee=pricing["delivery_fee"],
        discount=pricing["discount"],
        points_discount=pricing.get("points_discount", 0),
        points_used=pricing.get("points_used", 0),
        total=pricing["total"],
        applied_coupon=pricing["applied_coupon"],
        payment_method=payload.payment_method,
        delivery_slot=payload.delivery_slot,
        delivery_address=payload.delivery_address,
        eta_minutes=8,
    )

    return CheckoutResponse(orders=created_orders, summary=summary)


@router.get("/latest", response_model=OrderResponse)
def get_latest_order(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Get the most recent order for the logged-in user."""
    user_id = int(current_user["sub"])
    order = (
        db.query(Order)
        .filter(Order.user_id == user_id)
        .order_by(Order.created_at.desc())
        .first()
    )

    if order is None:
        raise HTTPException(status_code=404, detail="No orders found")

    return {
        "order_id": order.order_id,
        "user_id": order.user_id,
        "product_name": order.product_name,
        "price": order.price,
        "status": order.status,
        "carrier": order.carrier,
        "tracking_number": order.tracking_number,
        "current_location": order.current_location,
        "expected_delivery": order.expected_delivery,
        "delivery_slot": order.delivery_slot,
        "delivery_address": order.delivery_address,
        "delivery_latitude": order.delivery_latitude,
        "delivery_longitude": order.delivery_longitude,
        "created_at": order.created_at,
        "product_image": _product_image_for_name(db, order.product_name),
    }


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    user_id = int(current_user["sub"])
    order = db.query(Order).filter(
        Order.order_id == order_id,
        Order.user_id == user_id,
    ).first()

    if order is None:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    return {
        "order_id": order.order_id,
        "user_id": order.user_id,
        "product_name": order.product_name,
        "price": order.price,
        "status": order.status,
        "carrier": order.carrier,
        "tracking_number": order.tracking_number,
        "current_location": order.current_location,
        "expected_delivery": order.expected_delivery,
        "delivery_slot": order.delivery_slot,
        "delivery_address": order.delivery_address,
        "delivery_latitude": order.delivery_latitude,
        "delivery_longitude": order.delivery_longitude,
        "created_at": order.created_at,
        "product_image": _product_image_for_name(db, order.product_name),
    }
