from app.agents.classifier import classify_query
from app.agents.router import route_goserve_intent
from app.agents.goserve_handler import handle_goserve_intent
from app.agents.ollama_client import ask_llm_chat
from app.agents.general_chat_fallback import generate_fallback_response
from app.agents.prompt import GENERAL_CHAT_PROMPT
from services.chat_service import save_conversation_turn, get_recent_history


def process_query(
    user_query: str,
    db=None,
    user_id=None,
    order_id=None,
    history: list[dict] | None = None,
    client_context: dict | None = None,
):
    """
    Hybrid AI pipeline:
    1. Classify → GoServe or General
    2. GoServe → backend services + format
    3. General → LLM API (OpenAI/Ollama) with NLP fallback
    """
    history = history or []
    if db and user_id and not history:
        db_history = get_recent_history(db, user_id, limit=10)
        history = db_history

    category = classify_query(user_query, history)

    if category == "goserve":
        result = _handle_goserve(user_query, db, user_id, order_id, history, client_context)
    else:
        result = _handle_general(user_query, history)

    if db and user_id:
        save_conversation_turn(
            db, user_id, user_query,
            result["response"], result.get("intent"), result.get("source"),
        )

    return result


def _handle_goserve(user_query, db, user_id, order_id, history, client_context):
    intent = route_goserve_intent(user_query, history)

    if db and user_id:
        raw = handle_goserve_intent(
            intent, db, user_id, user_query,
            history=history, order_id=order_id,
            client_context=client_context,
        )
        response_text = raw.get("text", "")
        cards = raw.get("cards", [])
        actions = raw.get("actions", [])
    else:
        response_text = "Please log in to access your GoServe account data."
        cards, actions = [], []
        intent = "auth_required"

    return {
        "response": response_text,
        "source": "goserve",
        "intent": intent,
        "cards": cards,
        "actions": actions,
    }


def _handle_general(user_query, history):
    messages = [{"role": "system", "content": GENERAL_CHAT_PROMPT}]

    for msg in history[-10:]:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        if content and role in ("user", "assistant"):
            messages.append({"role": role, "content": content})

    messages.append({"role": "user", "content": user_query})

    response_text = ask_llm_chat(messages)

    if not response_text or not response_text.strip():
        response_text = generate_fallback_response(user_query, history)

    return {
        "response": response_text,
        "source": "general",
        "intent": "chat",
        "cards": [],
        "actions": [],
    }
