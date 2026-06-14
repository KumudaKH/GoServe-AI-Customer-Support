from pydantic import BaseModel
from typing import Optional, List


class CreateGroupRequest(BaseModel):
    product_name: str
    price: float


class JoinGroupRequest(BaseModel):
    invite_code: str


class ContributeRequest(BaseModel):
    invite_code: str
    amount: float


class GroupMemberOut(BaseModel):
    member_id: int
    user_id: int
    contributed_amount: float
    has_paid: bool

    class Config:
        from_attributes = True


class GroupOrderOut(BaseModel):
    group_id: int
    invite_code: str
    product_name: str
    price: float
    leader_user_id: Optional[int]
    status: str
    members: List[GroupMemberOut] = []

    class Config:
        from_attributes = True
