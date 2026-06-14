import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authenticatedFetch } from "../services/api";

const statusClasses = {
  Delivered: "bg-green-100 text-green-700",
  Processing: "bg-blue-100 text-blue-700",
  Confirmed: "bg-cyan-100 text-cyan-700",
  Cancelled: "bg-red-100 text-red-700",
  Refunded: "bg-purple-100 text-purple-700",
  "Out for Delivery": "bg-orange-100 text-orange-700",
};

const filters = ["All", "Delivered", "Processing", "Confirmed", "Cancelled", "Refunded"];

export default function History() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await authenticatedFetch("/api/orders", {}, navigate);
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Unable to load history");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [navigate]);

  const filteredOrders = orders.filter((order) => {
    if (filter === "All") return true;
    return order.status === filter;
  });

  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + (order.price || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">GoServe Premium</p>
            <h1 className="mt-2 text-4xl font-bold text-slate-900">Order History</h1>
            <p className="mt-2 text-slate-600 max-w-2xl">
              Review your past orders, track delivery progress and explore premium reorder suggestions.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="inline-flex items-center justify-center rounded-3xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            Shop again
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Total orders</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{totalOrders}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Total spent</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">₹{totalSpent.toLocaleString("en-IN")}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Top category</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">Smart Delivery</p>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-lg">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            {filters.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  filter === item
                    ? "bg-violet-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-500">Loading order history...</div>
          ) : error ? (
            <div className="rounded-3xl bg-red-50 p-6 text-red-700">{error}</div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              No orders match this filter. Try another category or place a new order.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.order_id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Order ID</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{order.order_id}</p>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <div>
                        <p className="text-sm text-slate-500">Amount</p>
                        <p className="mt-1 text-slate-900 font-semibold">₹{order.price?.toLocaleString("en-IN")}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Status</p>
                        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${statusClasses[order.status] || "bg-slate-100 text-slate-700"}`}>
                          {order.status}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Placed</p>
                        <p className="mt-1 text-slate-900">{new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-sm text-slate-500">Product</p>
                      <p className="mt-1 text-slate-900 font-semibold">{order.product_name || "GoServe order"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Delivery</p>
                      <p className="mt-1 text-slate-900">{order.expected_delivery ? new Date(order.expected_delivery).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Pending"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Payment</p>
                      <p className="mt-1 text-slate-900">{order.payment_method || "Standard"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
