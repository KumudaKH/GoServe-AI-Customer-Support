import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import OrderSummary from "../components/OrderSummary";
import ProductImage from "../components/ProductImage";

export default function Bag() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    items,
    updateQuantity,
    removeFromCart,
    cartCount,
    pricing,
    productSavings,
    loyaltyPoints,
  } = useCart();

  // Check if this is from Smart Cart Saver (highlight abandoned items)
  const highlightCartSaver = new URLSearchParams(location.search).get("highlight") === "cart-saver";

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Bag</h1>
            {highlightCartSaver && items.length > 0 && (
              <p className="mt-2 rounded-full bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-800 shadow-sm">
                Highlighting abandoned items for faster checkout.
              </p>
            )}
          </div>
          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
            ⚡ 8 min delivery
          </span>
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center shadow-lg">
            <div className="mb-6 text-6xl">🛍</div>
            <h2 className="mb-2 text-xl font-semibold">Your bag is empty</h2>
            <p className="mb-6 text-slate-600">
              Add products and get them delivered in 8 minutes!
            </p>
            <button
              onClick={() => navigate("/products")}
              className="inline-flex items-center gap-2 rounded-full border border-green-600 px-6 py-3 text-green-600 transition hover:bg-green-600 hover:text-white"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_0.7fr]">
            <div className="space-y-4">
              <div className="rounded-[2rem] bg-violet-950/95 p-6 text-white shadow-2xl">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-violet-300">Premium Bag</p>
                    <h2 className="text-3xl font-bold">Review your GoServe order</h2>
                    <p className="mt-2 text-sm text-violet-200">
                      {cartCount} item{cartCount > 1 ? "s" : ""} in your bag. Save more with loyalty points and coupons.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/group-orders")}
                    className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-violet-950 shadow-lg transition hover:bg-violet-100"
                  >
                    Continue Buy Together
                  </button>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-3xl bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.35em] text-violet-300">Saved</p>
                    <p className="mt-2 text-xl font-semibold">₹{productSavings.toLocaleString("en-IN")}</p>
                    <p className="mt-1 text-sm text-violet-200">on product deals</p>
                  </div>
                  <div className="rounded-3xl bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.35em] text-violet-300">Loyalty</p>
                    <p className="mt-2 text-xl font-semibold">{loyaltyPoints} pts</p>
                    <p className="mt-1 text-sm text-violet-200">available to redeem</p>
                  </div>
                  <div className="rounded-3xl bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.35em] text-violet-300">Delivery</p>
                    <p className="mt-2 text-xl font-semibold">Free</p>
                    <p className="mt-1 text-sm text-violet-200">for eligible orders</p>
                  </div>
                </div>
              </div>

              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow"
                >
                  <ProductImage
                    src={item.image_url}
                    alt={item.name}
                    category={item.category}
                    className="h-24 w-24 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-900">
                          {item.name}
                        </h3>
                        {highlightCartSaver && (
                          <span className="rounded-full bg-violet-100 px-2 py-1 text-xs font-semibold text-violet-700">
                            Abandoned
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-sm text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-sm font-bold text-green-600">
                        ₹{item.price.toLocaleString("en-IN")}
                      </p>
                      {item.original_price && item.original_price > item.price && (
                        <p className="text-xs text-slate-400 line-through">
                          ₹{item.original_price.toLocaleString("en-IN")}
                        </p>
                      )}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="rounded-full border px-3 py-1"
                      >
                        -
                      </button>
                      <span className="rounded-full bg-slate-100 px-4 py-1">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="rounded-full border px-3 py-1"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <div className="rounded-[2rem] bg-white p-6 shadow-lg">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-slate-500">GoServe Checkout</p>
                    <h3 className="mt-2 text-xl font-bold text-slate-900">Ready for fast delivery</h3>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-700">
                    8 min delivery
                  </span>
                </div>
                <div className="mt-5 grid gap-3">
                  <div className="rounded-3xl bg-violet-50 p-4 text-sm text-violet-700">
                    <p className="font-semibold">Premium payment perks</p>
                    <p className="mt-2 text-slate-600">Use points and coupons to reduce your total instantly.</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
                    <p className="font-semibold text-slate-900">Need a quick quote?</p>
                    <p className="mt-2">Tap checkout to see your final delivery time and savings.</p>
                  </div>
                </div>
              </div>

              <OrderSummary
                showCoupon
                onCheckout={() => navigate("/checkout")}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
