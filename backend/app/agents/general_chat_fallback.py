"""
Natural-language fallback when external LLM (OpenAI/Ollama) is unavailable.
Produces ChatGPT-style conversational answers.
"""

import re


def generate_fallback_response(user_query: str, history: list[dict] | None = None) -> str:
    q = user_query.strip()
    q_lower = q.lower()

    if _match(q_lower, ["joke", "funny", "make me laugh"]):
        return _joke()

    if _match(q_lower, ["write an email", "draft an email", "email to"]):
        return _email_template(q)

    if _match(q_lower, ["difference between", "compare", " vs ", " versus "]):
        return _comparison(q)

    if _match(q_lower, ["cost", "price", "how much", "expensive", "cheap", "rate", "best saree", "best sari"]):
        return _price_answer(q, q_lower)

    if _match(q_lower, ["explain", "what is", "what are", "define", "meaning of"]):
        return _explain(q, q_lower)

    if _match(q_lower, ["best place", "places in", "visit", "tourist", "travel"]):
        return _places_answer(q, q_lower)

    if _match(q_lower, ["summarize", "summary of", "tl;dr"]):
        return _summarize_help(q)

    if _match(q_lower, ["code", "python", "javascript", "function", "debug", "error in"]):
        return _code_help(q)

    if _match(q_lower, ["diabetes", "health", "symptom", "disease", "treatment"]):
        return _health_info(q_lower)

    if _match(q_lower, ["tcp", "udp", "http", "api", "database", "machine learning", "ai", "artificial intelligence"]):
        return _tech_explain(q_lower)

    return _general_conversation(q, q_lower, history)


def _match(text: str, keywords: list[str]) -> bool:
    return any(kw in text for kw in keywords)


def _joke() -> str:
    return (
        "Here's one for you 😄\n\n"
        "> **Why did the developer go broke?**\n"
        "> Because they used up all their **cache**.\n\n"
        "Want another one, or shall we get back to your GoServe orders?"
    )


def _email_template(q: str) -> str:
    return (
        "Here's a polished email draft you can customize:\n\n"
        "---\n\n"
        "**Subject:** Follow-up on our recent conversation\n\n"
        "Dear [Name],\n\n"
        "I hope this message finds you well. I wanted to follow up regarding "
        "[brief topic]. Please let me know a convenient time to connect, or feel "
        "free to reply with any questions.\n\n"
        "Thank you for your time and consideration.\n\n"
        "Best regards,\n"
        "[Your Name]\n\n"
        "---\n\n"
        "Tell me the **recipient**, **topic**, and **tone** (formal/casual) "
        "and I'll tailor this exactly for you."
    )


def _comparison(q: str) -> str:
    if "tcp" in q.lower() and "udp" in q.lower():
        return (
            "### TCP vs UDP\n\n"
            "Both are transport-layer protocols, but they work quite differently:\n\n"
            "| Feature | TCP | UDP |\n"
            "|---------|-----|-----|\n"
            "| Connection | Connection-oriented | Connectionless |\n"
            "| Reliability | Guaranteed delivery | Best-effort |\n"
            "| Speed | Slower (overhead) | Faster |\n"
            "| Order | Maintains order | No ordering guarantee |\n"
            "| Use cases | Web, email, file transfer | Streaming, gaming, DNS |\n\n"
            "**Simple analogy:** TCP is like a **phone call** (you confirm each part), "
            "UDP is like **sending postcards** (fast, but some may get lost)."
        )

    return (
        f"Great question! To compare things properly, I'd look at:\n\n"
        f"- **Purpose** — what each is designed for\n"
        f"- **Strengths** — where each excels\n"
        f"- **Weaknesses** — trade-offs to know\n"
        f"- **Best use case** — when to pick one over the other\n\n"
        f"Could you specify the two things you'd like me to compare? "
        f"I'll give you a clear side-by-side breakdown."
    )


def _explain(q: str, q_lower: str) -> str:
    if "artificial intelligence" in q_lower or re.search(r"\bai\b", q_lower):
        return (
            "### What is Artificial Intelligence (AI)?\n\n"
            "**Artificial Intelligence** is the field of computer science focused on "
            "building systems that can perform tasks typically requiring human intelligence — "
            "such as understanding language, recognizing images, making decisions, and learning from data.\n\n"
            "**Key types:**\n"
            "- **Narrow AI** — specialized (Siri, recommendation engines, this chatbot)\n"
            "- **General AI** — hypothetical human-level intelligence (still research)\n\n"
            "**How it works (simplified):**\n"
            "1. Collect data\n"
            "2. Train models to find patterns\n"
            "3. Use those patterns to predict or generate outputs\n\n"
            "AI is already part of daily life — from search engines to navigation apps to smart assistants like this one!"
        )

    if "python" in q_lower:
        return (
            "### What is Python?\n\n"
            "**Python** is a high-level, versatile programming language known for its "
            "readable syntax — often described as *\"executable pseudocode.\"*\n\n"
            "**Why developers love it:**\n"
            "- Easy to learn and read\n"
            "- Huge ecosystem (web, data science, AI, automation)\n"
            "- Strong community and libraries\n\n"
            "**Popular uses:** web apps (Django, FastAPI), data analysis (pandas), "
            "machine learning (PyTorch, scikit-learn), scripting, and automation.\n\n"
            "```python\n# Your first Python program\nprint('Hello, World!')\n```"
        )

    topic = re.sub(
        r"^(what is|what are|explain|define|meaning of)\s+",
        "",
        q_lower,
        flags=re.IGNORECASE,
    ).strip(" ?")

    return (
        f"### About {topic.title()}\n\n"
        f"**{topic.title()}** is a topic with several interesting aspects. "
        f"Here's a helpful overview:\n\n"
        f"- **Definition** — it refers to concepts, practices, or items related to {topic}\n"
        f"- **Context** — understanding {topic} often depends on your specific use case\n"
        f"- **Practical value** — knowing about {topic} helps you make better informed decisions\n\n"
        f"If you'd like, ask me to go **deeper** on any specific angle — history, "
        f"how it works, pros & cons, or practical tips."
    )


def _price_answer(q: str, q_lower: str) -> str:
    if "saree" in q_lower or "sari" in q_lower:
        return (
            "### Cost of Sarees in India\n\n"
            "Saree prices vary widely depending on **fabric**, **work**, **brand**, and **occasion**:\n\n"
            "| Category | Price Range (₹) | Examples |\n"
            "|----------|-----------------|----------|\n"
            "| Daily wear cotton | 300 – 1,500 | Simple printed cotton |\n"
            "| Silk (basic) | 1,500 – 5,000 | Art silk, semi-silk |\n"
            "| Pure silk | 5,000 – 25,000 | Kanjeevaram, Banarasi basics |\n"
            "| Designer / Premium | 15,000 – 1,00,000+ | Handwoven Kanjeevaram, Paithani, designer labels |\n"
            "| Bridal sarees | 25,000 – 5,00,000+ | Heavy zari, custom designer |\n\n"
            "**Best value picks:**\n"
            "- **Everyday:** Cotton handloom from local weavers (₹500–1,200)\n"
            "- **Festive:** Art silk or Tussar (₹2,000–8,000)\n"
            "- **Wedding/special:** Kanjeevaram or Banarasi silk (₹15,000+)\n\n"
            "**Tips for buying:**\n"
            "- Check fabric authenticity (pure silk vs art silk)\n"
            "- Compare prices on GoServe, Amazon, Myntra, or local silk houses\n"
            "- Festival sales (Diwali, Pongal) often have 20–40% discounts\n\n"
            "Want recommendations for a **specific budget** or **occasion**?"
        )

    return (
        f"### Pricing Guide\n\n"
        f"Costs depend on **quality**, **brand**, **location**, and **market demand**. "
        f"Here's a general approach to finding the best price:\n\n"
        f"1. **Set a budget** — decide your comfortable range\n"
        f"2. **Research online** — compare 3–5 sellers\n"
        f"3. **Read reviews** — price alone doesn't tell the full story\n"
        f"4. **Watch for sales** — festive seasons often have big discounts\n\n"
        f"Tell me the **specific product** and your **budget range**, "
        f"and I'll give you a more targeted price breakdown."
    )


def _places_answer(q: str, q_lower: str) -> str:
    if "mysore" in q_lower:
        return (
            "### Best Places to Visit in Mysore\n\n"
            "Mysore (Mysuru) is one of Karnataka's most beautiful cities. Top spots:\n\n"
            "**Must-visit landmarks:**\n"
            "- **Mysore Palace** — stunning Indo-Saracenic architecture, especially magical at night\n"
            "- **Chamundi Hills** — panoramic city views + Chamundeshwari Temple\n"
            "- **Brindavan Gardens** — famous musical fountain (evenings)\n\n"
            "**Nature & wildlife:**\n"
            "- **Karanji Lake** — bird sanctuary, butterfly park\n"
            "- **Ranganathittu Bird Sanctuary** (~20 km away)\n\n"
            "**Culture & shopping:**\n"
            "- **Devaraja Market** — flowers, spices, local life\n"
            "- **Mysore silk & sandalwood** shops near palace\n\n"
            "**Food picks:** Mysore masala dosa, Mysore pak, RRR Restaurant, Hotel Mylari\n\n"
            "**Best time:** October–February (pleasant weather, Dasara festival in Sept/Oct)"
        )

    city = re.search(r"places in\s+(\w+)", q_lower)
    place = city.group(1).title() if city else "that destination"

    return (
        f"### Best Places in {place}\n\n"
        f"I'd recommend exploring {place} through these categories:\n\n"
        f"- **Landmarks & history** — palaces, temples, museums\n"
        f"- **Nature** — parks, lakes, hills nearby\n"
        f"- **Food scene** — local specialties and famous eateries\n"
        f"- **Shopping** — handicrafts, textiles, local markets\n\n"
        f"Tell me your **interests** (history, food, adventure, family-friendly) "
        f"and I'll build a personalized itinerary!"
    )


def _summarize_help(q: str) -> str:
    return (
        "I'd be happy to summarize that for you!\n\n"
        "**Paste the paragraph or text** you'd like summarized, and I'll give you:\n\n"
        "- A **2–3 sentence** quick summary\n"
        "- **Key bullet points**\n"
        "- **Main takeaway** in one line\n\n"
        "Go ahead and share the text!"
    )


def _code_help(q: str) -> str:
    return (
        "I can help with your code! Here's how to get the best answer:\n\n"
        "**Share with me:**\n"
        "1. The code snippet (or describe the problem)\n"
        "2. What you **expected** to happen\n"
        "3. What **actually** happened (error message if any)\n"
        "4. Language/framework (Python, JavaScript, etc.)\n\n"
        "I'll explain the issue, suggest a fix, and walk you through the logic — "
        "just like pair programming with a friend.\n\n"
        "```python\n# Example: paste your code like this\nfor i in range(10):\n    print(i)\n```"
    )


def _health_info(q_lower: str) -> str:
    if "diabetes" in q_lower:
        return (
            "### Understanding Diabetes\n\n"
            "**Diabetes** is a chronic condition where the body struggles to regulate "
            "blood sugar (glucose) effectively.\n\n"
            "**Main types:**\n"
            "- **Type 1** — immune system attacks insulin-producing cells\n"
            "- **Type 2** — body becomes resistant to insulin (most common)\n"
            "- **Gestational** — develops during pregnancy\n\n"
            "**Common symptoms:** increased thirst, frequent urination, fatigue, "
            "blurred vision, slow-healing wounds.\n\n"
            "**Management:** diet, exercise, medication/insulin, regular blood sugar monitoring.\n\n"
            "⚠️ *This is general information, not medical advice. "
            "Please consult a healthcare professional for diagnosis and treatment.*"
        )

    return (
        "I can share **general health information**, but I'm not a doctor.\n\n"
        "For any health concerns, please consult a qualified healthcare professional. "
        "I'm happy to explain general concepts — what symptoms mean, lifestyle tips, "
        "or help you prepare questions for your doctor."
    )


def _tech_explain(q_lower: str) -> str:
    if "tcp" in q_lower or "udp" in q_lower:
        return _comparison("difference between tcp and udp")

    if "machine learning" in q_lower or "artificial intelligence" in q_lower:
        return _explain("", q_lower)

    return (
        "That's a great technical question! I can explain it clearly with "
        "examples and analogies. Could you tell me your **familiarity level** "
        "(beginner / intermediate / advanced) so I can tailor the explanation?"
    )


def _general_conversation(q: str, q_lower: str, history: list[dict] | None) -> str:
    greetings = ["hi", "hello", "hey", "good morning", "good evening", "how are you"]
    if any(q_lower.startswith(g) or q_lower == g for g in greetings):
        return (
            "Hello! 👋 Great to chat with you.\n\n"
            "I'm your GoServe AI assistant — I can help with **anything**:\n\n"
            "- 🛍 Shopping, products & price guides\n"
            "- 📚 General knowledge & explanations\n"
            "- ✍️ Writing emails, summaries, code help\n"
            "- 📦 Your GoServe orders, refunds & tickets\n\n"
            "What's on your mind?"
        )

    if q_lower.endswith("?"):
        return (
            f"That's a thoughtful question!\n\n"
            f"Regarding **\"{q}\"** — here's what I can share:\n\n"
            f"This depends on several factors like context, location, and personal "
            f"preferences. Let me break it down:\n\n"
            f"1. **Core answer** — the direct response to your question\n"
            f"2. **Context** — why it matters and what influences it\n"
            f"3. **Practical tips** — actionable advice you can use right away\n\n"
            f"Could you share a bit more detail (budget, location, or specific context)? "
            f"I'll give you a much more precise and helpful answer."
        )

    return (
        f"Thanks for sharing that!\n\n"
        f"Here's my take on **\"{q}\"**:\n\n"
        f"I understand what you're looking for. While I'd love to give you the most "
        f"detailed answer possible, a bit more context would help me tailor my response.\n\n"
        f"Feel free to ask follow-up questions — I remember our conversation and "
        f"can build on what we've discussed. I'm here for both **general questions** "
        f"and your **GoServe shopping** needs!"
    )
