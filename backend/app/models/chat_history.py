from sqlalchemy import Column, Integer, Text, String, DateTime, ForeignKey
from datetime import datetime
from app.database.connection import Base


class ChatHistory(Base):
    __tablename__ = "chat_history"

    chat_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))

    message = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    tool_used = Column(String(100), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    