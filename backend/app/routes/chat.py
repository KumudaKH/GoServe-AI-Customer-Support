import os

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from openai import OpenAI

from app.agents.support_agent import process_query
from app.database.connection import get_db
from app.utils.dependencies import get_current_user
from services.chat_service import get_recent_history
from services.chat_service import get_chat_history

router = APIRouter(
    prefix="/api/chat",
    tags=["AI Chat"]
)


class HistoryMessage(BaseModel):
    role: str
    content: str


class ClientContext(BaseModel):
    cart_items: list[dict] | None = None
    loyalty_points: int | None = None
    wishlist: list[dict] | None = None


class ChatRequest(BaseModel):
    message: str
    order_id: int | None = None
    history: list[HistoryMessage] | None = None
    client_context: ClientContext | None = None


class ChatAction(BaseModel):
    label: str
    action: str
    url: str | None = None


class ChatResponse(BaseModel):
    response: str
    source: str = "general"
    intent: str = "chat"
    cards: list[dict] = Field(default_factory=list)
    actions: list[ChatAction] = Field(default_factory=list)


@router.post("/message", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Hybrid AI endpoint:
    1. Classify intent (GoServe vs general)
    2. GoServe → backend APIs + MySQL
    3. General → LLM API
    4. Return unified response with conversation memory
    """
    user_id = int(current_user.get("sub"))

    history = None
    if request.history:
        history = [{"role": m.role, "content": m.content} for m in request.history]
    else:
        history = get_recent_history(db, user_id, limit=10)

    client_ctx = {}
    if request.client_context:
        if request.client_context.cart_items:
            client_ctx["cart_items"] = request.client_context.cart_items
        if request.client_context.loyalty_points is not None:
            client_ctx["loyalty_points"] = request.client_context.loyalty_points
        if request.client_context.wishlist:
            client_ctx["wishlist"] = request.client_context.wishlist

    result = process_query(
        user_query=request.message,
        db=db,
        user_id=user_id,
        order_id=request.order_id,
        history=history,
        client_context=client_ctx or None,
    )

    return ChatResponse(
        response=result.get("response", ""),
        source=result.get("source", "general"),
        intent=result.get("intent", "chat"),
        cards=result.get("cards", []),
        actions=result.get("actions", []),
    )


@router.post("/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured.")

    try:
        client = OpenAI(api_key=openai_api_key)
        transcription = client.audio.transcriptions.create(
            file=file.file,
            model="whisper-1",
        )
        transcript = getattr(transcription, "text", None) or transcription.get("text")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    return {"transcript": transcript}


@router.get("/history")
def chat_history(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    user_id = int(current_user.get("sub"))
    history = get_chat_history(db, user_id)
    # return recent turns as simple objects
    out = []
    for h in history:
        out.append({"message": h.message, "response": h.response, "created_at": h.created_at.isoformat() if h.created_at else None})
    return out
