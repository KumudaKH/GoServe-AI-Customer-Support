from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from app.database.connection import get_db
from app.schemas.auth import UserRegister, UserLogin
from services.auth_services import (
    register_user,
    login_user,
)

from app.utils.dependencies import get_current_user

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


@router.post("/register")
def register(
    user: UserRegister,
    db: Session = Depends(get_db),
):
    new_user = register_user(db, user)

    if new_user is None:
        raise HTTPException(
            status_code=400,
            detail="Email already exists",
        )

    return {
        "message": "Registration successful",
        "user_id": new_user.user_id,
    }


from fastapi.security import OAuth2PasswordRequestForm

@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    result = login_user(
        db,
        form_data.username,
        form_data.password,
    )

    if result is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    return result

@router.get("/me")
def me(
    current_user=Depends(get_current_user),
):
    return current_user