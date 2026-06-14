from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str
    tool_used: str


class ChatHistoryResponse(BaseModel):
    chat_id: int
    message: str
    response: str
    tool_used: str | None = None

    class Config:
        from_attributes = True