from sqlalchemy.orm import Session
from app.models.support_ticket import SupportTicket


def create_ticket(db: Session, ticket: SupportTicket):
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


def get_ticket(db: Session, ticket_id: str):
    return db.query(SupportTicket).filter(
        SupportTicket.ticket_id == ticket_id
    ).first()