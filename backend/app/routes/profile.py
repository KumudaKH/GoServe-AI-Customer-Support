from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import update
from app.database.connection import get_db
from app.utils.dependencies import get_current_user
from app.models.user import User
from app.schemas.profile import ProfileOut, ProfileUpdate
from datetime import datetime
import traceback

router = APIRouter(
    prefix="/api/profile",
    tags=["Profile"],
)


@router.get("", response_model=ProfileOut)
def get_profile(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = current_user.get("sub")
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    user = db.query(User).filter(User.user_id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


@router.put("", response_model=None)
@router.patch("", response_model=None)
def update_profile(payload: ProfileUpdate, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = current_user.get("sub")
    print("Decoded token payload:", current_user)
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    # fetch existing user for logging
    user = db.query(User).filter(User.user_id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Prepare update values
    update_values = {}
    if payload.name is not None:
        update_values["name"] = payload.name
    if payload.email is not None:
        update_values["email"] = payload.email
    if payload.phone is not None:
        update_values["phone"] = payload.phone
    if payload.address is not None:
        update_values["address"] = payload.address
    if payload.latitude is not None:
        update_values["latitude"] = payload.latitude
    if payload.longitude is not None:
        update_values["longitude"] = payload.longitude
    if payload.dob is not None:
        try:
            update_values["dob"] = datetime.fromisoformat(payload.dob).date()
        except Exception:
            # keep original if parsing fails
            print("DOB parse failed for", payload.dob)
    if payload.gender is not None:
        update_values["gender"] = payload.gender
    if payload.profile_image is not None:
        update_values["profile_photo"] = payload.profile_image

    if not update_values:
        return {"success": True, "message": "No changes provided", "user": {
            "user_id": user.user_id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "address": user.address,
            "latitude": user.latitude,
            "longitude": user.longitude,
            "dob": user.dob.isoformat() if user.dob else None,
            "gender": user.gender,
            "profile_photo": user.profile_photo,
        }}

    try:
        # Build and print SQL statement for debugging
        stmt = update(User).where(User.user_id == int(user_id)).values(**update_values)
        print("SQL Statement:", stmt)
        print("Update values:", update_values)

        result = db.execute(stmt)
        db.commit()

        # Refresh user
        user = db.query(User).filter(User.user_id == int(user_id)).first()

        user_obj = {
            "user_id": user.user_id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "address": user.address,
            "latitude": user.latitude,
            "longitude": user.longitude,
            "dob": user.dob.isoformat() if user.dob else None,
            "gender": user.gender,
            "profile_photo": user.profile_photo,
        }

        return {"success": True, "message": "Profile updated successfully", "user": user_obj}

    except Exception as e:
        db.rollback()
        print("Exception during profile update:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
