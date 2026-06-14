import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authenticatedFetch } from "../services/api";
import MarkdownMessage from "../components/chat/MarkdownMessage";
import ResponseCards from "../components/chat/ResponseCards";

const SUGGESTED = [
  "Best phone under ₹20000",
  "Healthy breakfast ideas",
  "Cheapest grocery combo",
  "Gift suggestions",
  "Compare iPhone and Samsung",
];

function makeHistoryPayload(messages) {
  return messages.map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }));
}

export default function AiShopping() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, role: "assistant", text: "Hi! I’m GoServe AI. Ask me anything about products, deals, delivery, or savings." },
  ]);
  const [loading, setLoading] = useState(false);
  const [likeState, setLikeState] = useState({});
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const sendMessage = async (text, opts = {}) => {
    const trimmed = (text || "").trim();
    if (!trimmed) return;

    const userMsg = { id: Date.now(), role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setQuery("");
    setLoading(true);

    try {
      const historyPayload = makeHistoryPayload(messages.slice(-20));
      const body = {
        message: trimmed,
        history: historyPayload,
        client_context: {
          cart_items: opts.cartItems || [],
          wishlist: opts.wishlist || [],
          loyalty_points: opts.loyaltyPoints || 0,
        },
      };

      const res = await authenticatedFetch("/api/chat/message", { method: "POST", body: JSON.stringify(body) }, navigate);

      const assistantText = res.response || "Sorry, I couldn't find an answer.";

      const assistantMsg = { id: Date.now() + 1, role: "assistant", text: assistantText };
      setMessages((prev) => [...prev, assistantMsg]);
      setLikeState((s) => ({ ...s, [assistantMsg.id]: null }));
    } catch (err) {
      const errMsg = { id: Date.now() + 1, role: "assistant", text: `Error: ${err.message}` };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const regenerate = async (lastUser) => {
    // resend the last user message
    if (!lastUser) return;
    await sendMessage(lastUser.text);
  };

  const clearChat = async () => {
    setMessages([{ id: Date.now(), role: "assistant", text: "Hi! I’m GoServe AI. Ask me anything about products, deals, delivery, or savings." }]);
    try {
      // optionally backend could support clearing history; skipping server delete to avoid destructive operations
    } catch (e) {
      console.warn(e);
    }
  };

  const handleLike = (id, value) => {
    setLikeState((s) => ({ ...s, [id]: value }));
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.warn("Copy failed", e);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3FF] p-6 pb-28">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[2rem] bg-gradient-to-r from-violet-700 to-fuchsia-600 p-8 text-white shadow-2xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-violet-200">AI Shopping Assistant</p>
              <h1 className="mt-3 text-4xl font-bold">Talk to GoServe AI</h1>
              <p className="mt-3 max-w-2xl text-sm text-violet-100">Ask for smart picks, budget-friendly products, combo offers, or gift ideas.</p>
            </div>
            <button
              onClick={() => navigate("/products")}
              className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-violet-900 shadow-lg transition hover:bg-violet-100"
            >
              Browse products
            </button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[2.3fr_1fr]">
          <div className="rounded-[2rem] bg-white p-6 shadow-lg border border-slate-200">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Chat</p>
                <h2 className="mt-2 text-xl font-bold text-slate-900">Ask anything</h2>
              </div>
              <div className="rounded-3xl bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">
                Hybrid AI
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`rounded-3xl p-5 shadow-sm ${message.role === "assistant" ? "bg-slate-50 border border-slate-200 text-slate-900" : "bg-slate-900 text-white self-end"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <MarkdownMessage
                        content={message.text}
                        className={message.role === "user" ? "text-white font-semibold" : "text-slate-900"}
                      />
                    </div>
                    {message.role === "assistant" && (
                      <div className="ml-3 flex flex-col items-end gap-2">
                        <button onClick={() => copyToClipboard(message.text)} className="text-xs text-slate-500 hover:text-slate-700">Copy</button>
                        <div className="flex gap-1">
                          <button onClick={() => handleLike(message.id, true)} className={`text-sm ${likeState[message.id] === true ? 'text-green-600' : 'text-slate-400'}`}>👍</button>
                          <button onClick={() => handleLike(message.id, false)} className={`text-sm ${likeState[message.id] === false ? 'text-red-600' : 'text-slate-400'}`}>👎</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="rounded-3xl bg-violet-100 p-4 text-sm text-slate-700">GoServe AI is typing...</div>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask for a product, deal, or delivery update"
                className="flex-1 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(query); }}
              />
              <button onClick={() => sendMessage(query)} className="rounded-3xl bg-violet-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-800">Send</button>
              <button onClick={() => regenerate(messages.slice().reverse().find(m => m.role === 'user'))} className="rounded-3xl border border-slate-200 px-4 py-3 text-sm font-semibold">Regenerate</button>
              <button onClick={clearChat} className="rounded-3xl border border-slate-200 px-4 py-3 text-sm font-semibold">Clear</button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[2rem] bg-white p-6 shadow-lg border border-slate-200">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Quick suggestions</p>
              <div className="mt-5 space-y-3">
                {SUGGESTED.map((s) => (
                  <button key={s} onClick={() => sendMessage(s)} className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-left text-sm font-medium text-slate-900 transition hover:border-violet-300 hover:bg-violet-50">{s}</button>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] bg-violet-700 p-6 text-white shadow-lg">
              <h3 className="text-xl font-bold">Why GoServe AI?</h3>
              <ul className="mt-4 space-y-3 text-sm text-violet-100">
                <li>• Smart picks for your budget</li>
                <li>• Deal discovery in seconds</li>
                <li>• Product comparisons across categories</li>
                <li>• Instant support with order context</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
