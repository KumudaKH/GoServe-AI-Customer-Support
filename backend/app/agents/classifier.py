"""
Hybrid AI classifier — decides whether a query is GoServe-related or general knowledge.
"""

GOSERVE_KEYWORDS = [
    "order", "orders", "track", "tracking", "package", "parcel", "shipment",
    "refund", "return", "cancel", "cancellation", "delivery", "deliver",
    "goserve", "ticket", "tickets", "support", "complaint", "care",
    "profile", "account", "wishlist", "loyalty", "points", "reward",
    "bag", "cart", "basket", "checkout", "coupon", "coupons", "offer", "discount",
    "payment", "pay", "upi", "wallet", "buy together", "group buy", "group order",
    "invite", "contribute", "recommend", "product", "products", "purchase",
    "shipped", "dispatch", "rider", "carrier", "invoice", "receipt",
    "headphones", "earbuds", "shoes", "groceries", "grocery",
]

GOSERVE_PHRASES = [
    "where is my", "where's my", "status of my", "track my",
    "my order", "my package", "my bag", "my cart", "my wishlist",
    "my tickets", "my profile", "my coupons", "my points",
    "my loyalty", "payment failed", "refund my", "cancel my",
    "delivery status", "order status", "buy together",
]

GENERAL_KEYWORDS = [
    "what is", "what are", "explain", "difference between", "compare",
    "tell me a joke", "write an email", "summarize", "solve this",
    "how does", "why does", "define", "meaning of", "history of",
    "best places", "recipe", "diabetes", "python", "javascript",
    "tcp", "udp", "machine learning", "artificial intelligence",
    "write code", "debug", "help me understand", "teach me",
]

GENERAL_STRONG = [
    "what is ai", "explain python", "difference between tcp and udp",
    "tell me a joke", "write an email", "explain diabetes",
    "best places in", "solve this code", "summarize this",
]


def _normalize(text: str) -> str:
    return (text or "").lower().strip()


def _history_text(history: list[dict] | None) -> str:
    if not history:
        return ""
    parts = []
    for msg in history[-8:]:
        role = msg.get("role", "")
        content = msg.get("content", "")
        if content:
            parts.append(f"{role}: {content}")
    return " ".join(parts).lower()


def _has_goserve_context(history: list[dict] | None) -> bool:
    combined = _history_text(history)
    context_words = ["order", "ordered", "package", "delivery", "refund", "product", "headphones", "shipped"]
    return any(w in combined for w in context_words)


def classify_query(user_query: str, history: list[dict] | None = None) -> str:
    """
    Returns 'goserve' or 'general'.
    """
    query = _normalize(user_query)
    if not query:
        return "general"

    for phrase in GENERAL_STRONG:
        if phrase in query:
            return "general"

    for phrase in GOSERVE_PHRASES:
        if phrase in query:
            return "goserve"

    general_score = sum(1 for kw in GENERAL_KEYWORDS if kw in query)
    goserve_score = sum(1 for kw in GOSERVE_KEYWORDS if kw in query)

    # Ambiguous short follow-ups with prior GoServe context
    vague_followups = ["where is it", "where is that", "track it", "status?", "what about it", "and it?"]
    if any(v in query for v in vague_followups) and _has_goserve_context(history):
        return "goserve"

    pronoun_followups = ["it", "that", "this one", "the order", "my order"]
    if len(query.split()) <= 5 and any(p in query for p in pronoun_followups):
        if _has_goserve_context(history):
            return "goserve"

    if goserve_score > general_score:
        return "goserve"
    if general_score > goserve_score:
        return "general"

    if _has_goserve_context(history) and goserve_score > 0:
        return "goserve"

    if goserve_score > 0:
        return "goserve"

    return "general"
