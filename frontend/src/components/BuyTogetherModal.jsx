import { useMemo, useState } from "react";
import { getProductImage, getFallbackImage } from "../utils/productImage";
import { getDiscountPercent } from "../utils/pricing";
import {
  buildShareText,
  copyInviteLink,
  shareViaNative,
  shareViaWhatsApp,
} from "../utils/inviteShare";

export default function BuyTogetherModal({ product, group, onClose, onStartGroup, loading }) {
  const [status, setStatus] = useState("");

  if (!product && !group) return null;

  const image = getProductImage(
    product?.image_url,
    product?.category,
    product?.name || group?.product_name
  );

  const originalPrice = product?.original_price || product?.price || group?.price || 0;
  const groupPrice = group?.price || product?.price || 0;
  const discount = product ? getDiscountPercent(product.price, product.original_price) : 0;
  const saveAmount = product?.original_price
    ? Math.max(0, Math.round(product.original_price - product.price))
    : Math.max(0, Math.round(groupPrice * 0.14));

  const memberCount = group ? group.members?.length || 1 : 1;
  const targetMembers = 4;
  const progress = Math.min(100, Math.round((memberCount / targetMembers) * 100));
  const peopleText = `${memberCount}/${targetMembers}`;

  const handleCopy = async () => {
    if (!group) return;
    await copyInviteLink(group.invite_code);
    setStatus("Link copied");
    setTimeout(() => setStatus(""), 2000);
  };

  const handleShare = async () => {
    if (!group) return;
    const text = buildShareText(group.product_name, group.price, group.invite_code);
    const shared = await shareViaNative(text);
    if (!shared) {
      await handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-6 sm:items-center sm:p-0">
      <div className="w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-2xl sm:rounded-[2.5rem]">
        <div className="flex items-center gap-4 bg-slate-950 px-5 py-4 text-white">
          <div className="h-14 w-14 rounded-3xl bg-white/10 p-2">
            <img src={image} alt={product?.name || group?.product_name} className="h-full w-full object-cover rounded-2xl" />
          </div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.32em] text-slate-300">Buy Together</p>
            <h2 className="mt-2 text-lg font-semibold">{product?.name || group?.product_name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl bg-slate-800 px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-700"
          >
            Close
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="rounded-[1.75rem] bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Individual price</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">
                  ₹{originalPrice.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="rounded-3xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white">
                {discount > 0 ? `${discount}% OFF` : "Group"}
              </div>
            </div>
            <div className="mt-4 border-t border-slate-200 pt-4">
              <p className="text-sm text-slate-500">Group price</p>
              <p className="mt-1 text-2xl font-bold text-violet-700">
                ₹{groupPrice.toLocaleString("en-IN")}
              </p>
              <p className="mt-2 text-sm text-slate-500">You save ₹{saveAmount.toLocaleString("en-IN")}</p>
            </div>
          </div>

          <div className="rounded-[1.75rem] bg-slate-50 p-4">
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>People joined</span>
              <span>{peopleText}</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-xs text-slate-500">{progress}% to a faster group buy</p>
          </div>

          {group ? (
            <div className="space-y-3">
              <div className="rounded-[1.75rem] bg-emerald-50 p-4 text-sm text-emerald-900">
                ✅ Group created successfully.
              </div>
              <p className="text-sm text-slate-600">Invite friends to save more and fill the group faster.</p>
              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={() => shareViaWhatsApp(group.product_name, group.price, group.invite_code)}
                  className="flex items-center justify-center gap-2 rounded-3xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  <span>💬</span>
                  WhatsApp
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 rounded-3xl bg-violet-600 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
                >
                  <span>📱</span>
                  Share
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded-3xl border border-slate-200 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  {status || "Copy link"}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">Create a group instantly and get a shareable link in one tap.</p>
              <button
                type="button"
                onClick={onStartGroup}
                disabled={loading}
                className="w-full rounded-3xl bg-violet-600 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
              >
                {loading ? "Starting group..." : "Start group"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
