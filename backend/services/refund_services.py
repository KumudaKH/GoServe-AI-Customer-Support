from sqlalchemy.orm import Session
from app.models.refund_request import RefundRequest


def create_refund(db: Session, refund: RefundRequest):
    db.add(refund)
    db.commit()
    db.refresh(refund)
    return refund


def get_refund(db: Session, refund_id: int):
    return db.query(RefundRequest).filter(
        RefundRequest.refund_id == refund_id
    ).first()