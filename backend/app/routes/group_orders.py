from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.group import (
    CreateGroupRequest,
    JoinGroupRequest,
    ContributeRequest,
    GroupOrderOut,
    GroupMemberOut,
)
from app.utils.dependencies import get_current_user
from app.services.group_services import (
    create_group,
    join_group,
    contribute,
    get_group_with_members,
)
from app.services.group_services import get_invitations_count, get_my_groups

router = APIRouter(
    prefix="/api/group",
    tags=["GroupOrders"]
)


@router.post("/")
def api_create_group(
    payload: CreateGroupRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    user_id = int(current_user["sub"])
    group = create_group(db, user_id, payload.product_name, payload.price)
    return {
        "group_id": group.group_id,
        "invite_code": group.invite_code,
        "product_name": group.product_name,
        "price": group.price,
        "leader_user_id": group.leader_user_id,
        "status": group.status,
        "members": [],
    }


@router.post("/join")
def api_join_group(
    payload: JoinGroupRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    user_id = int(current_user["sub"])
    member = join_group(db, payload.invite_code, user_id)
    if member is None:
        raise HTTPException(status_code=404, detail="Group not found")

    return {"message": "joined", "member_id": member.member_id}


@router.post("/contribute")
def api_contribute(
    payload: ContributeRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    user_id = int(current_user["sub"])
    payment = contribute(db, payload.invite_code, user_id, payload.amount)
    if payment is None:
        raise HTTPException(status_code=404, detail="Group not found")

    return {"message": "payment recorded", "payment_id": payment.payment_id}


@router.get("/{invite_code}")
def api_get_group(invite_code: str, db: Session = Depends(get_db)):
    group = get_group_with_members(db, invite_code)
    if group is None:
        raise HTTPException(status_code=404, detail="Group not found")

    # Build members list
    members = [
        {
            "member_id": m.member_id,
            "user_id": m.user_id,
            "contributed_amount": m.contributed_amount,
            "has_paid": m.has_paid,
        }
        for m in getattr(group, "_members", [])
    ]

    resp = {
        "group_id": group.group_id,
        "invite_code": group.invite_code,
        "product_name": group.product_name,
        "price": group.price,
        "leader_user_id": group.leader_user_id,
        "status": group.status,
        "members": members,
    }

    return resp



@router.get("/invitations")
def api_invitations_count(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    user_id = int(current_user["sub"])
    count = get_invitations_count(db, user_id)
    return {"count": count}


@router.get("/my")
def api_my_groups(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    user_id = int(current_user["sub"])
    groups = get_my_groups(db, user_id)
    return {"groups": groups}
