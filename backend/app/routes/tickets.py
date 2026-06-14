from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.utils.dependencies import get_current_user
from app.schemas.ticket import TicketCreate, TicketResponse
from app.models.support_ticket import SupportTicket
import uuid
from datetime import datetime

router = APIRouter(prefix="/api/tickets", tags=["Tickets"])


def generate_ticket_id():
    """Generate ticket ID in format TKT-2026-XXXXXX"""
    random_num = str(uuid.uuid4().int)[:6]
    return f"TKT-2026-{random_num}"


@router.post("/", response_model=TicketResponse)
def create_ticket(
    ticket_data: TicketCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Create a new support ticket"""
    user_id = int(current_user.get("sub"))
    
    ticket_id = generate_ticket_id()
    
    # Debug prints
    print(f"DEBUG - Creating ticket for user_id: {user_id}")
    print(f"DEBUG - Ticket data: {ticket_data}")
    
    new_ticket = SupportTicket(
        ticket_id=ticket_id,
        user_id=user_id,
        order_id=ticket_data.order_id,
        subject=ticket_data.subject,
        summary=ticket_data.description,
        category=ticket_data.category,
        description=ticket_data.description,
        priority=ticket_data.priority,
        status="Open",
    )
    
    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)
    
    print(f"DEBUG - Ticket created: {ticket_id}")
    
    return new_ticket


@router.get("/", response_model=list[TicketResponse])
def get_user_tickets(
    status: str | None = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get all tickets for the logged-in user"""
    user_id = int(current_user.get("sub"))
    
    print(f"DEBUG - Fetching tickets for user_id: {user_id}, status filter: {status}")
    
    query = db.query(SupportTicket).filter(SupportTicket.user_id == user_id)
    
    if status:
        query = query.filter(SupportTicket.status == status)
    
    tickets = query.order_by(SupportTicket.created_at.desc()).all()
    
    print(f"DEBUG - Found {len(tickets) if tickets else 0} tickets")
    
    return tickets


# Alias endpoint used by some frontends
@router.get("/my-tickets", response_model=list[TicketResponse])
def get_my_tickets(
    status: str | None = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Alias for /api/tickets that returns current user's tickets"""
    return get_user_tickets(status=status, db=db, current_user=current_user)


@router.get("/{ticket_id}", response_model=TicketResponse)
def get_ticket(
    ticket_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get a specific ticket"""
    user_id = int(current_user.get("sub"))
    
    ticket = (
        db.query(SupportTicket)
        .filter(
            (SupportTicket.ticket_id == ticket_id)
            & (SupportTicket.user_id == user_id)
        )
        .first()
    )
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    return ticket