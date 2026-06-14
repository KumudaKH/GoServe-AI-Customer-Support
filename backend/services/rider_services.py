from sqlalchemy.orm import Session
from app.models.rider import Rider


def get_rider(db: Session, rider_id: int):
    return db.query(Rider).filter(
        Rider.rider_id == rider_id
    ).first()


def get_all_riders(db: Session):
    return db.query(Rider).all()