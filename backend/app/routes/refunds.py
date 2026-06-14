from fastapi import APIRouter

router = APIRouter(prefix="/api/refunds", tags=["Refunds"])


@router.get("/")
def refunds():
    return {"message": "Refund Route Working"}