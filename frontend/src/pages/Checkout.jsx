import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authenticatedFetch } from "../services/api";
import { useCart } from "../context/CartContext";
import { DELIVERY_SLOTS } from "../constants/delivery";
import {
  calculatePricing,
  DEFAULT_WALLET_BALANCE,
  PAYMENT_METHODS,
  UPI_APPS,
} from "../utils/pricing";
import {
  SiCredly,
  SiGooglepay,
  SiPaytm,
  SiPhonepe,
} from "react-icons/si";
import { FaAmazonPay } from "react-icons/fa";
import { AiOutlineQrcode } from "react-icons/ai";
import ProductImage from "../components/ProductImage";
import LiveLocationMap from "../components/LiveLocationMap";

const STEPS = ["Delivery", "Payment", "Confirm"];

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    items: cartItems,
    clearCart,
    appliedCoupon,
    pointsUsed,
  } = useCart();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deliverySlot, setDeliverySlot] = useState("express-8");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [upiApp, setUpiApp] = useState("gpay");
  const [useWallet, setUseWallet] = useState(false);
  const [walletBalance] = useState(
    Number(localStorage.getItem("wallet_balance")) || DEFAULT_WALLET_BALANCE
  );
  const [address, setAddress] = useState(
    localStorage.getItem("delivery_address") || ""
  );
  const [latitude, setLatitude] = useState(
    localStorage.getItem("delivery_latitude")
      ? Number(localStorage.getItem("delivery_latitude"))
      : null
  );
  const [longitude, setLongitude] = useState(
    localStorage.getItem("delivery_longitude")
      ? Number(localStorage.getItem("delivery_longitude"))
      : null
  );
  const [mapCenter, setMapCenter] = useState(() => {
    const lat = localStorage.getItem("delivery_latitude");
    const lng = localStorage.getItem("delivery_longitude");
    if (lat && lng) return { lat: Number(lat), lng: Number(lng) };
    return { lat: 12.9715987, lng: 77.5945627 };
  });
  const [pickerLoading, setPickerLoading] = useState(false);
  const [locationErrorMessage, setLocationErrorMessage] = useState("");

  const reverseGeocode = async (lat, lng) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=en`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Reverse geocoding failed");
      const data = await res.json();
      return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch {
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  };

  const persistLocation = (lat, lng, addr) => {
    localStorage.setItem("delivery_address", addr);
    localStorage.setItem("delivery_latitude", String(lat));
    localStorage.setItem("delivery_longitude", String(lng));
  };

  const handleMapMove = async (pos) => {
    setLatitude(pos.lat);
    setLongitude(pos.lng);
    setPickerLoading(true);
    const addr = await reverseGeocode(pos.lat, pos.lng);
    setAddress(addr);
    persistLocation(pos.lat, pos.lng, addr);
    setPickerLoading(false);
  };

  useEffect(() => {
    const saved = localStorage.getItem("delivery_latitude");
    if (saved) return;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMapCenter(coords);
        setLatitude(coords.lat);
        setLongitude(coords.lng);
        const addr = await reverseGeocode(coords.lat, coords.lng);
        setAddress(addr);
        persistLocation(coords.lat, coords.lng, addr);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLocationErrorMessage("Geolocation not supported");
      return;
    }
    setPickerLoading(true);
    setLocationErrorMessage("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMapCenter(coords);
        setLatitude(coords.lat);
        setLongitude(coords.lng);
        const addr = await reverseGeocode(coords.lat, coords.lng);
        setAddress(addr);
        persistLocation(coords.lat, coords.lng, addr);
        setPickerLoading(false);
      },
      (err) => {
        setLocationErrorMessage("Could not get location. Please drag the map pin instead.");
        setPickerLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  useEffect(() => {
    const savedLat = localStorage.getItem("delivery_latitude");
    const savedLng = localStorage.getItem("delivery_longitude");
    // Only update mapCenter from lat/lng state if user doesn't have saved coords
    if (latitude && longitude && (!savedLat || !savedLng)) {
      setMapCenter({ lat: latitude, lng: longitude });
    }
  }, [latitude, longitude]);

  useEffect(() => {
    const loadProfileAddress = async () => {
      try {
        const profile = await authenticatedFetch("/api/profile", {}, navigate);
        if (profile?.address) {
          if (!address.trim()) {
            setAddress(profile.address);
          }
          if (!latitude && profile.latitude) {
            setLatitude(profile.latitude);
          }
          if (!longitude && profile.longitude) {
            setLongitude(profile.longitude);
          }
        }
      } catch (err) {
        console.warn("Could not load profile for checkout:", err);
      }
    };

    loadProfileAddress();
  }, [address, navigate]);

  const items = location.state?.items?.length ? location.state.items : cartItems;

  const checkoutSubtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const pricing = useMemo(
    () => calculatePricing(checkoutSubtotal, appliedCoupon || null, pointsUsed),
    [checkoutSubtotal, appliedCoupon, pointsUsed]
  );

  const productSavings = useMemo(
    () =>
      items.reduce((sum, item) => {
        if (item.original_price && item.original_price > item.price) {
          return sum + (item.original_price - item.price) * item.quantity;
        }
        return sum;
      }, 0),
    [items]
  );

  const selectedPayment = PAYMENT_METHODS.find((m) => m.id === paymentMethod);
  const selectedUpiApp = UPI_APPS.find((app) => app.id === upiApp);
  const walletRedeem = useWallet
    ? Math.min(walletBalance, pricing.total)
    : 0;

  const UPI_ICONS = {
    gpay: SiGooglepay,
    phonepe: SiPhonepe,
    paytm: SiPaytm,
    bhim: AiOutlineQrcode,
    amazonpay: FaAmazonPay,
    cred: SiCredly,
  };
  const amountToPay = Math.max(pricing.total - walletRedeem, 0);

  const goNext = () => {
    if (step === 0) {
      if (!address.trim()) {
        setError("Please enter your delivery address");
        return;
      }
      setError("");
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;

    setLoading(true);
    setError("");

    try {
      const slot = DELIVERY_SLOTS.find((s) => s.id === deliverySlot);

      const payload = {
        items: items.map((item) => ({
          product_id: item.id,
          product_name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        coupon_code: appliedCoupon || null,
        points_used: pointsUsed || 0,
        payment_method:
          paymentMethod === "upi"
            ? `UPI - ${selectedUpiApp?.label || "Google Pay"}`
            : paymentMethod === "wallet"
              ? `Wallet${walletRedeem > 0 ? ` (₹${walletRedeem})` : ""}`
              : selectedPayment?.label || paymentMethod,
        delivery_slot: slot?.label || "Express — 8 mins",
        delivery_address: address.trim(),
        delivery_latitude: latitude,
        delivery_longitude: longitude,
      };

      const result = await authenticatedFetch(
        "http://localhost:8000/api/orders/checkout",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        navigate
      );

      localStorage.setItem("delivery_address", address.trim());
      clearCart();
      navigate("/orders", {
        state: {
          orderPlaced: true,
          summary: result.summary,
          eta: slot?.eta || "8 min",
          paymentMethod: selectedPayment?.label,
        },
      });
    } catch (err) {
      setError(err.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6">
        <h1 className="text-2xl font-bold text-slate-900">Nothing to checkout</h1>
        <Link
          to="/products"
          className="rounded-2xl bg-green-600 px-6 py-3 font-semibold text-white"
        >
          Shop Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-3xl">
        <Link to="/bag" className="text-sm text-slate-500 hover:text-green-600">
          ← Back to bag
        </Link>

        <div className="mt-4 rounded-3xl bg-gradient-to-r from-green-600 to-emerald-500 p-6 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚡</span>
            <div>
              <h1 className="text-2xl font-bold">Checkout</h1>
              <p className="text-sm text-white/90">
                Step {step + 1} of {STEPS.length}: {STEPS[step]}
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            {STEPS.map((label, i) => (
              <div
                key={label}
                className={`h-1.5 flex-1 rounded-full transition ${
                  i <= step ? "bg-white" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>

        {step === 0 && (
          <>
            <div className="mt-6 rounded-3xl bg-white p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-900">Delivery Address</h2>
                {latitude && longitude && (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    📍 Pin set
                  </span>
                )}
              </div>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                placeholder="House no, street, landmark, city..."
                className="mt-3 w-full rounded-2xl border border-slate-200 p-4 text-sm outline-none focus:border-green-500"
              />
              {locationErrorMessage && (
                <p className="mt-2 text-sm text-red-600">{locationErrorMessage}</p>
              )}
            </div>

            <div className="mt-6 overflow-hidden rounded-3xl bg-white shadow-lg">
              <div className="flex items-center justify-between p-6 pb-3">
                <div>
                  <h2 className="font-bold text-slate-900">Pin Your Exact Location</h2>
                  <p className="mt-0.5 text-xs text-slate-500">Drag the map to place the pin at your delivery spot</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate("/select-location")}
                    className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Full Map
                  </button>
                  <button
                    type="button"
                    onClick={handleLocateMe}
                    disabled={pickerLoading}
                    className="flex items-center gap-1.5 rounded-full bg-violet-50 px-4 py-2 text-xs font-semibold text-violet-700 transition hover:bg-violet-100 disabled:opacity-50"
                  >
                    <span>{pickerLoading ? "⏳" : "🎯"}</span>
                    {pickerLoading ? "Locating..." : "Locate Me"}
                  </button>
                </div>
              </div>
              <div className="relative mx-4 h-[380px] overflow-hidden rounded-2xl border border-slate-200">
                <LiveLocationMap
                  interactive
                  center={mapCenter}
                  zoom={19}
                  onCenterChange={handleMapMove}
                  height="100%"
                  showCenterPin
                />
              </div>
              {pickerLoading && (
                <div className="px-6 pb-3 pt-2 text-sm text-slate-500">
                  ⏳ Finding address...
                </div>
              )}
              {latitude && longitude && (
                <div className="border-t border-slate-100 px-6 py-3 text-xs text-slate-400">
                  📌 {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </div>
              )}
            </div>

            <div className="mt-6 rounded-3xl bg-white p-6 shadow-lg">
              <h2 className="font-bold text-slate-900">Delivery Slot</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {DELIVERY_SLOTS.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setDeliverySlot(slot.id)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      deliverySlot === slot.id
                        ? "border-green-600 bg-green-50 ring-2 ring-green-600"
                        : "border-slate-200 hover:border-green-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">
                        {slot.label}
                      </span>
                      {slot.express && (
                        <span className="rounded-full bg-green-600 px-2 py-0.5 text-xs font-bold text-white">
                          FAST
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-500">ETA: {slot.eta}</p>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 1 && (
          <div className="mt-6 space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-lg">
              <h2 className="font-bold text-slate-900">Select Payment Method</h2>
              <div className="mt-4 space-y-3">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(method.id);
                      if (method.id === "wallet") setUseWallet(true);
                      if (method.id !== "wallet") setUseWallet(false);
                    }}
                    className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                      paymentMethod === method.id
                        ? "border-green-600 bg-green-50 ring-2 ring-green-600"
                        : "border-slate-200 hover:border-green-300"
                    }`}
                  >
                    <span className="text-2xl">{method.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{method.label}</p>
                      <p className="text-sm text-slate-500">{method.detail}</p>
                    </div>
                    {paymentMethod === method.id && (
                      <span className="font-bold text-green-600">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {paymentMethod === "upi" && (
              <div className="rounded-3xl bg-white p-6 shadow-lg">
                <h3 className="font-bold text-slate-900">Choose UPI App</h3>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {UPI_APPS.map((app) => {
                    const AppLogo = UPI_ICONS[app.id] || SiGooglepay;
                    return (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => setUpiApp(app.id)}
                        className={`rounded-2xl border p-4 text-left transition ${
                          upiApp === app.id
                            ? "border-green-600 bg-green-50 ring-2 ring-green-600"
                            : "border-slate-200 hover:border-green-300"
                        }`}
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-900">
                          <AppLogo className="h-6 w-6" />
                        </div>
                        <p className="mt-3 text-sm font-semibold text-slate-900">{app.label}</p>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                  You will be redirected to {selectedUpiApp?.label} to complete payment of ₹
                  {amountToPay.toLocaleString("en-IN")}.
                </p>
              </div>
            )}

            {paymentMethod === "wallet" && (
              <div className="rounded-3xl bg-white p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">GoServe Wallet</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Available balance: ₹{walletBalance.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUseWallet((v) => !v)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      useWallet
                        ? "bg-green-600 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {useWallet ? "Redeeming" : "Redeem"}
                  </button>
                </div>
                {useWallet && (
                  <p className="mt-4 rounded-2xl bg-violet-50 p-4 text-sm text-violet-800">
                    ₹{walletRedeem.toLocaleString("en-IN")} will be deducted from your wallet.
                    {amountToPay > 0
                      ? ` Remaining ₹${amountToPay.toLocaleString("en-IN")} due on delivery or via UPI.`
                      : " Your order is fully covered by wallet balance."}
                  </p>
                )}
              </div>
            )}

            {paymentMethod === "cod" && (
              <div className="rounded-3xl bg-amber-50 p-6 shadow-lg">
                <h3 className="font-bold text-amber-900">Cash on Delivery</h3>
                <p className="mt-2 text-sm text-amber-800">
                  Pay ₹{amountToPay.toLocaleString("en-IN")} in cash when your order arrives.
                  Please keep exact change ready for faster 8-min delivery.
                </p>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <>
            <div className="mt-6 rounded-3xl bg-white p-6 shadow-lg">
              <h2 className="font-bold text-slate-900">Order Items</h2>
              <div className="mt-4 space-y-4">
                {items.map((item) => (
                  <div
                    key={`${item.id}-${item.quantity}`}
                    className="flex items-center gap-4 border-b border-slate-100 pb-4"
                  >
                    <ProductImage
                      src={item.image_url}
                      alt={item.name}
                      category={item.category}
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-green-600">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-3xl bg-white p-6 shadow-lg">
              <h2 className="font-bold text-slate-900">Price Details</h2>
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
                  <span>Delivery</span>
                  <span>
                    {pricing.deliveryFee === 0 ? "FREE" : `₹${pricing.deliveryFee}`}
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
                <div className="flex justify-between border-t pt-3 text-lg font-bold">
                  <span>Total</span>
                  <span className="text-green-600">
                    ₹{pricing.total.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm">
                <p>
                  <span className="font-medium">Payment:</span>{" "}
                  {selectedPayment?.icon}{" "}
                  {paymentMethod === "upi"
                    ? `${selectedPayment?.label} (${selectedUpiApp?.label})`
                    : selectedPayment?.label}
                </p>
                {walletRedeem > 0 && (
                  <p className="mt-1 text-violet-700">
                    Wallet redeemed: ₹{walletRedeem.toLocaleString("en-IN")}
                  </p>
                )}
                <p className="mt-1 text-slate-500">
                  Delivering to: {address.slice(0, 60)}
                  {address.length > 60 ? "..." : ""}
                </p>
              </div>
            </div>
          </>
        )}

        {error && <p className="mt-4 text-red-600">{error}</p>}

        <div className="mt-6 flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 rounded-2xl border border-slate-300 py-4 font-semibold text-slate-700"
            >
              Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="flex-1 rounded-2xl bg-green-600 py-4 font-bold text-white"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={loading}
              className="flex-1 rounded-2xl bg-green-600 py-4 text-lg font-bold text-white disabled:opacity-60"
            >
              {loading
                ? "Processing..."
                : `Pay ₹${amountToPay.toLocaleString("en-IN")}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
