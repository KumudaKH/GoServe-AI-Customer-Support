import { useState } from "react";
import { useCart } from "../context/CartContext";
import { getMaxRedeemablePoints, POINTS_TO_RUPEE } from "../utils/pricing";

export default function OrderSummary({ showCoupon = true, showPoints = true, onCheckout }) {
  const {
    pricing,
    appliedCoupon,
    couponMessage,
    productSavings,
    pointsUsed,
    loyaltyPoints,
    cartSubtotal,
    applyCoupon,
    removeCoupon,
    applyPoints,
  } = useCart();
  const [couponInput, setCouponInput] = useState(appliedCoupon || "");
  const [usePoints, setUsePoints] = useState(pointsUsed > 0);

  const maxPoints = getMaxRedeemablePoints(
    cartSubtotal,
    appliedCoupon || null,
    loyaltyPoints
  );

  const handleApply = () => {
    applyCoupon(couponInput);
  };

  const handlePointsToggle = () => {
    if (usePoints) {
      applyPoints(0);
      setUsePoints(false);
    } else {
      applyPoints(maxPoints);
      setUsePoints(true);
    }
  };

  return (
    <div className="rounded-3xl bg-white p-6 shadow-lg">
      <h3 className="text-lg font-bold text-slate-900">Order Summary</h3>

      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal</span>
          <span>₹{pricing.subtotal.toLocaleString("en-IN")}</span>
        </div>
        {productSavings > 0 && (
          <div className="flex justify-between text-orange-600">
            <span>Product savings</span>
            <span>-₹{productSavings.toLocaleString("en-IN")}</span>
          </div>
        )}
        <div className="flex justify-between text-slate-600">
          <span>Delivery fee</span>
          <span>
            {pricing.deliveryFee === 0 ? (
              <span className="font-medium text-green-600">FREE</span>
            ) : (
              `₹${pricing.deliveryFee}`
            )}
          </span>
        </div>
        {pricing.discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Voucher {appliedCoupon && `(${appliedCoupon})`}</span>
            <span>-₹{pricing.discount.toLocaleString("en-IN")}</span>
          </div>
        )}
        {pricing.pointsDiscount > 0 && (
          <div className="flex justify-between text-violet-600">
            <span>Points ({pricing.pointsUsed} pts)</span>
            <span>-₹{pricing.pointsDiscount.toLocaleString("en-IN")}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-slate-100 pt-3 text-lg font-bold text-slate-900">
          <span>Total</span>
          <span className="text-green-600">
            ₹{pricing.total.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {showCoupon && (
        <div className="mt-5">
          <label className="text-sm font-medium text-slate-700">
            Coupon / Voucher
          </label>
          <div className="mt-2 flex gap-2">
            <input
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              placeholder="e.g. SAVE10"
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-green-500"
            />
            {appliedCoupon ? (
              <button
                type="button"
                onClick={() => {
                  removeCoupon();
                  setCouponInput("");
                }}
                className="rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600"
              >
                Remove
              </button>
            ) : (
              <button
                type="button"
                onClick={handleApply}
                className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Apply
              </button>
            )}
          </div>
          {couponMessage && (
            <p
              className={`mt-2 text-xs ${
                appliedCoupon ? "text-green-600" : "text-red-600"
              }`}
            >
              {couponMessage}
            </p>
          )}
        </div>
      )}

      {showPoints && maxPoints > 0 && (
        <div className="mt-5 rounded-2xl border border-violet-200 bg-violet-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-violet-900">
                Loyalty Points
              </p>
              <p className="text-xs text-violet-600">
                {loyaltyPoints} available • 100 pts = ₹
                {(100 * POINTS_TO_RUPEE).toFixed(0)}
              </p>
            </div>
            <button
              type="button"
              onClick={handlePointsToggle}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                usePoints
                  ? "bg-violet-600 text-white"
                  : "bg-white text-violet-700 border border-violet-300"
              }`}
            >
              {usePoints ? `Using ${pricing.pointsUsed} pts` : `Use ${maxPoints} pts`}
            </button>
          </div>
        </div>
      )}

      {onCheckout && (
        <button
          type="button"
          onClick={onCheckout}
          className="mt-6 w-full rounded-2xl bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700"
        >
          Proceed to Payment — ₹{pricing.total.toLocaleString("en-IN")}
        </button>
      )}
    </div>
  );
}
