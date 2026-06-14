import os
import logging
import requests
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.1")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")


def ask_llm(prompt: str) -> str:
    result = ask_llm_chat([{"role": "user", "content": prompt}])
    if result:
        return result
    raise RuntimeError("No LLM provider available")


def ask_llm_chat(messages: list[dict]) -> str | None:
    """
    ChatGPT-style conversation call.
    Priority: OpenAI (best quality) → Ollama chat → Ollama generate.
    Returns None if all providers fail (caller uses NLP fallback).
    """
    if OPENAI_API_KEY:
        try:
            return _ask_openai_chat(messages)
        except Exception as exc:
            logger.warning("OpenAI chat failed: %s", exc)

    try:
        return _ask_ollama_chat(messages)
    except Exception as exc:
        logger.warning("Ollama chat failed: %s", exc)

    try:
        prompt = "\n".join(
            f"{m.get('role', 'user').upper()}: {m.get('content', '')}"
            for m in messages if m.get("content")
        )
        return _ask_ollama(f"{prompt}\n\nASSISTANT:")
    except Exception as exc:
        logger.warning("Ollama generate failed: %s", exc)

    return None


def _ask_ollama(prompt: str) -> str:
    url = f"{OLLAMA_BASE_URL}/api/generate"
    payload = {"model": OLLAMA_MODEL, "prompt": prompt, "stream": False}
    response = requests.post(url, json=payload, timeout=60)
    response.raise_for_status()
    return response.json()["response"]


def _ask_ollama_chat(messages: list[dict]) -> str:
    url = f"{OLLAMA_BASE_URL}/api/chat"
    payload = {"model": OLLAMA_MODEL, "messages": messages, "stream": False}
    response = requests.post(url, json=payload, timeout=60)
    response.raise_for_status()
    data = response.json()
    return data["message"]["content"]


def _ask_openai_chat(messages: list[dict]) -> str:
    if not OPENAI_API_KEY:
        raise RuntimeError("OpenAI API key not configured")

    from openai import OpenAI

    client = OpenAI(api_key=OPENAI_API_KEY)
    completion = client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=messages,
        temperature=0.8,
        max_tokens=2000,
        presence_penalty=0.1,
        frequency_penalty=0.1,
    )
    return completion.choices[0].message.content or ""
