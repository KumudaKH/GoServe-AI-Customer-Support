import uuid
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.group_order import GroupOrder
from app.models.group_member import GroupMember
from app.models.group_payment import GroupPayment
from app.models.order import Order


def _generate_invite_code() -> str:
    return uuid.uuid4().hex[:8].upper()


def create_group(db: Session, leader_user_id: int, product_name: str, price: float):
    code = _generate_invite_code()
    group = GroupOrder(
        invite_code=f"GP-{code}",
        product_name=product_name,
        price=price,
        leader_user_id=leader_user_id,
        status="open",
    )

    db.add(group)
    db.commit()
    db.refresh(group)

    # add leader as member
    member = GroupMember(
        group_id=group.group_id,
        user_id=leader_user_id,
        contributed_amount=0.0,
        has_paid=False,
    )

    db.add(member)
    db.commit()

    return group


def join_group(db: Session, invite_code: str, user_id: int):
    group = db.query(GroupOrder).filter(GroupOrder.invite_code == invite_code).first()
    if group is None:
        return None

    exists = db.query(GroupMember).filter(
        GroupMember.group_id == group.group_id,
        GroupMember.user_id == user_id,
    ).first()

    if exists:
        return exists

    member = GroupMember(
        group_id=group.group_id,
        user_id=user_id,
        contributed_amount=0.0,
        has_paid=False,
    )

    db.add(member)
    db.commit()
    db.refresh(member)

    return member


def contribute(db: Session, invite_code: str, user_id: int, amount: float, payment_ref: str = None):
    group = db.query(GroupOrder).filter(GroupOrder.invite_code == invite_code).first()
    if group is None:
        return None

    member = db.query(GroupMember).filter(
        GroupMember.group_id == group.group_id,
        GroupMember.user_id == user_id,
    ).first()

    if member is None:
        member = join_group(db, invite_code, user_id)

    payment = GroupPayment(
        group_id=group.group_id,
        member_id=member.member_id,
        amount=amount,
        payment_ref=payment_ref,
        status="completed",
    )

    db.add(payment)

    member.contributed_amount = (member.contributed_amount or 0.0) + amount
    member.has_paid = True

    db.add(member)
    db.commit()

    # check if total reached
    total = db.query(func.coalesce(func.sum(GroupMember.contributed_amount), 0.0)).filter(
        GroupMember.group_id == group.group_id
    ).scalar()

    if total >= group.price and group.status != "placed":
        # create an Order using leader's user id as payer
        order = Order(
            user_id=group.leader_user_id,
            product_name=group.product_name,
            price=group.price,
            status="confirmed",
        )

        db.add(order)
        db.commit()
        db.refresh(order)

        group.placed_order_id = order.order_id
        group.status = "placed"
        db.add(group)
        db.commit()

    return payment


def get_group_with_members(db: Session, invite_code: str):
    group = db.query(GroupOrder).filter(GroupOrder.invite_code == invite_code).first()
    if group is None:
        return None

    members = db.query(GroupMember).filter(GroupMember.group_id == group.group_id).all()
    group._members = members
    return group


def get_invitations_count(db: Session, user_id: int) -> int:
    # Count pending contributions for the user (joined but not paid) in open groups
    q = db.query(GroupMember).join(GroupOrder, GroupMember.group_id == GroupOrder.group_id).filter(
        GroupMember.user_id == user_id,
        GroupMember.has_paid == False,
        GroupOrder.status == "open",
    )

    return q.count()


def get_my_groups(db: Session, user_id: int):
    # Return groups where the user is a member
    members = db.query(GroupMember).filter(GroupMember.user_id == user_id).all()
    groups = []
    for m in members:
        group = db.query(GroupOrder).filter(GroupOrder.group_id == m.group_id).first()
        if not group:
            continue
        grp_members = db.query(GroupMember).filter(GroupMember.group_id == group.group_id).all()
        groups.append({
            "group_id": group.group_id,
            "invite_code": group.invite_code,
            "product_name": group.product_name,
            "price": group.price,
            "leader_user_id": group.leader_user_id,
            "status": group.status,
            "members": [
                {
                    "member_id": gm.member_id,
                    "user_id": gm.user_id,
                    "contributed_amount": gm.contributed_amount,
                    "has_paid": gm.has_paid,
                }
                for gm in grp_members
            ],
        })

    return groups
