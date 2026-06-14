import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authenticatedFetch } from "../services/api";
import { useCart } from "../context/CartContext";
import { COUPONS } from "../utils/pricing";

export default function Vouchers() {
  const navigate = useNavigate();
  const { applyCoupon, appliedCoupon } = useCart();
  const [coupons, setCoupons] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await authenticatedFetch(
          "http://localhost:8000/api/coupons/",
          {},
          navigate
        );
        setCoupons(Array.isArray(data) ? data : Object.values(COUPONS));
      } catch {
        setCoupons(Object.values(COUPONS));
      }
    };
    load();
  }, [navigate]);

  const handleApply = (code) => {
    const result = applyCoupon(code);
    setMessage(result.message || (result.valid ? "Applied!" : "Failed"));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-slate-900">Vouchers & Coupons</h1>
        <p className="mt-2 text-slate-600">
          Apply a coupon at checkout — try SAVE10, FLAT50, QUICK8
        </p>

        {message && (
          <p className="mt-4 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </p>
        )}

        <div className="mt-6 space-y-4">
          {coupons.map((coupon) => (
            <div
              key={coupon.code}
              className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-lg sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-green-100 px-3 py-1 font-mono text-sm font-bold text-green-700">
                    {coupon.code}
                  </span>
                  {appliedCoupon === coupon.code && (
                    <span className="text-xs font-semibold text-green-600">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="mt-2 text-slate-600">{coupon.description}</p>
                <p className="mt-1 text-xs text-slate-400">
                  Min order: ₹{coupon.min_order ?? coupon.minOrder}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleApply(coupon.code)}
                className="rounded-2xl bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
              >
                {appliedCoupon === coupon.code ? "Applied" : "Apply"}
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => navigate("/bag")}
          className="mt-8 rounded-2xl border border-green-600 px-6 py-3 font-semibold text-green-600"
        >
          Go to Bag →
        </button>
      </div>
    </div>
  );
}
