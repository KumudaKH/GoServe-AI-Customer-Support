import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authenticatedFetch } from "../services/api";
import { MapPinIcon, TruckIcon } from "@heroicons/react/24/solid";

export default function TrackOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await authenticatedFetch("http://localhost:8000/api/orders", {}, navigate);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const activeOrders = orders.filter((o) => !["Delivered", "Cancelled"].includes(o.status));
  const pastOrders = orders.filter((o) => ["Delivered", "Cancelled"].includes(o.status));

  const statusColor = (status) => {
    if (status === "Delivered") return "text-green-600 bg-green-50";
    if (status === "Out for Delivery") return "text-orange-600 bg-orange-50";
    if (status === "Shipped") return "text-blue-600 bg-blue-50";
    return "text-violet-600 bg-violet-50";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50/50 to-white p-6 pb-28">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="rounded-[2rem] bg-gradient-to-r from-violet-700 to-fuchsia-600 p-8 text-white shadow-2xl">
          <h1 className="text-3xl font-bold">Track Orders</h1>
          <p className="mt-2 text-violet-100">
            Live GPS tracking for every active shipment. Tap any order to see the map.
          </p>
          <button
            onClick={() => navigate("/delivery")}
            className="mt-4 rounded-full bg-white/20 px-5 py-2 text-sm font-semibold backdrop-blur hover:bg-white/30"
          >
            📍 Open Delivery Command Center
          </button>
        </div>

        {loading ? (
          <p className="text-center text-slate-500">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="rounded-[2rem] bg-white p-10 text-center shadow-lg">
            <p className="text-5xl">📦</p>
            <p className="mt-4 text-xl font-bold">No orders to track</p>
            <button
              onClick={() => navigate("/products")}
              className="mt-4 rounded-full bg-violet-700 px-6 py-3 text-sm font-semibold text-white"
            >
              Shop now
            </button>
          </div>
        ) : (
          <>
            {activeOrders.length > 0 && (
              <section>
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
                  </span>
                  Live — {activeOrders.length} active
                </h2>
                <div className="space-y-4">
                  {activeOrders.map((order) => (
                    <div
                      key={order.order_id}
                      className="rounded-[1.5rem] border border-violet-100 bg-white p-5 shadow-lg transition hover:shadow-xl"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-xs text-slate-500">Order #{order.order_id}</p>
                          <p className="font-bold text-slate-900">{order.product_name}</p>
                          <p className="mt-1 flex items-center gap-1 text-sm text-slate-600">
                            <MapPinIcon className="h-4 w-4 text-violet-500" />
                            {order.current_location || "Tracking..."}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor(order.status)}`}>
                            {order.status}
                          </span>
                          <button
                            onClick={() => navigate(`/track/${order.order_id}`)}
                            className="rounded-2xl bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-800"
                          >
                            Live map
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {pastOrders.length > 0 && (
              <section>
                <h2 className="mb-4 text-lg font-bold text-slate-900">Completed</h2>
                <div className="space-y-3">
                  {pastOrders.map((order) => (
                    <div
                      key={order.order_id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4"
                    >
                      <div className="flex items-center gap-3">
                        <TruckIcon className="h-5 w-5 text-slate-400" />
                        <div>
                          <p className="font-medium text-slate-900">{order.product_name}</p>
                          <p className="text-xs text-slate-500">#{order.order_id}</p>
                        </div>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
