from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.product import Product
from app.schemas.product import ProductResponse

router = APIRouter(
    prefix="/api/products",
    tags=["Products"],
)


@router.get("/", response_model=list[ProductResponse])
def list_products(
    category: str | None = Query(None),
    search: str | None = Query(None),
    limit: int | None = Query(None, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    query = db.query(Product)

    if category:
        query = query.filter(Product.category == category)

    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))

    query = query.order_by(Product.id)

    if offset:
        query = query.offset(offset)
    if limit:
        query = query.limit(limit)

    return query.all()


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == product_id).first()

    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    return product
