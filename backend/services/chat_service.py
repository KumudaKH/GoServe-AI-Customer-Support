from sqlalchemy.orm import Session
from app.models.chat_history import ChatHistory


def save_chat(db: Session, chat: ChatHistory):
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return chat


def get_chat_history(db: Session, user_id: int):
    return db.query(ChatHistory).filter(
        ChatHistory.user_id == user_id
    ).all()


def get_recent_history(db: Session, user_id: int, limit: int = 10) -> list[dict]:
    """Return recent conversation as [{role, content}, ...] for LLM context."""
    rows = (
        db.query(ChatHistory)
        .filter(ChatHistory.user_id == user_id)
        .order_by(ChatHistory.created_at.desc())
        .limit(limit)
        .all()
    )
    rows.reverse()
    messages = []
    for row in rows:
        messages.append({"role": "user", "content": row.message})
        messages.append({"role": "assistant", "content": row.response})
    return messages


def save_conversation_turn(
    db: Session,
    user_id: int,
    message: str,
    response: str,
    intent: str | None = None,
    source: str | None = None,
):
    tool_used = f"{source}:{intent}" if source and intent else (intent or source)
    chat = ChatHistory(
        user_id=user_id,
        message=message,
        response=response,
        tool_used=tool_used,
    )
    return save_chat(db, chat)
