from fastapi import APIRouter

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/")
def admin():
    return {"message": "Admin Route Working"}