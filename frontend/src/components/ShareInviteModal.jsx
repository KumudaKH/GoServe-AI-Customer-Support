import { useState } from "react";
import {
  buildShareText,
  copyInviteLink,
  shareViaNative,
  shareViaWhatsApp,
} from "../utils/inviteShare";

export default function ShareInviteModal({ group, onClose, onViewGroup }) {
  const [status, setStatus] = useState("");

  if (!group) return null;

  const handleCopy = async () => {
    await copyInviteLink(group.invite_code);
    setStatus("Link copied");
    setTimeout(() => setStatus(""), 2000);
  };

  const handleShare = async () => {
    const text = buildShareText(group.product_name, group.price, group.invite_code);
    const shared = await shareViaNative(text);
    if (!shared) {
      await handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-6 sm:items-center">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-violet-600">Buy together</p>
            <h2 className="mt-2 text-xl font-bold text-slate-900">{group.product_name}</h2>
            <p className="mt-1 text-sm text-slate-500">Share a quick link with friends.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 px-3 py-1 text-slate-500 hover:bg-slate-200"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 rounded-[1.75rem] bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-500">Group price</p>
          <p className="mt-2 text-2xl font-semibold text-violet-700">₹{group.price?.toLocaleString("en-IN")}</p>
        </div>

        <div className="mt-5 grid gap-3">
          <button
            type="button"
            onClick={() => shareViaWhatsApp(group.product_name, group.price, group.invite_code)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <span className="text-lg">💬</span>
            WhatsApp
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center justify-center gap-2 rounded-2xl bg-violet-600 py-3.5 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            <span className="text-lg">📤</span>
            Share
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-2xl border border-slate-200 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            {status || "Copy link"}
          </button>
          {onViewGroup && (
            <button
              type="button"
              onClick={() => onViewGroup(group.invite_code)}
              className="rounded-2xl bg-slate-900 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              View group
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
