import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authenticatedFetch } from "../services/api";
import LiveLocationMap, { EtaCountdown, RiderCard } from "../components/LiveLocationMap";
import {
  BoltIcon,
  ShieldCheckIcon,
  MapPinIcon,
  TruckIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";

const DARK_STORES = [
  { name: "Vijayanagar Hub", area: "Dark Store #1", orders: 34, eta: "6 min avg" },
  { name: "Gokulam Micro-Hub", area: "Dark Store #2", orders: 28, eta: "8 min avg" },
  { name: "Hebbal Express", area: "Dark Store #3", orders: 19, eta: "9 min avg" },
];

const SAFETY_FEATURES = [
  { icon: "🔐", title: "OTP-verified delivery", desc: "Share OTP only when your rider arrives at the door" },
  { icon: "📍", title: "Live GPS tracking", desc: "Watch your order move in real time on the map" },
  { icon: "📞", title: "Direct rider call", desc: "One-tap call to your assigned delivery partner" },
  { icon: "❄️", title: "Cold-chain ready", desc: "Insulated bags for groceries, dairy & frozen items" },
];

export default function Delivery() {
  const navigate = useNavigate();
  const [active, setActive] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [activeData, statsData] = await Promise.all([
        authenticatedFetch("http://localhost:8000/api/delivery/active", {}, navigate),
        authenticatedFetch("http://localhost:8000/api/delivery/stats", {}, navigate),
      ]);
      setActive(activeData.deliveries || []);
      setStats(statsData);
      if (!selected && activeData.deliveries?.length > 0) {
        setSelected(activeData.deliveries[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedTracking = selected?.tracking;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7F3FF] to-white pb-28">
      {/* Hero */}
      <div className="bg-gradient-to-r from-violet-800 via-purple-700 to-fuchsia-600 px-6 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-violet-200">GoServe Express</p>
              <h1 className="mt-2 text-4xl font-bold">Live Delivery Command Center</h1>
              <p className="mt-3 max-w-xl text-violet-100">
                Track every package in real time — from our dark store to your doorstep in as little as 8 minutes.
              </p>
            </div>
            {stats && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Riders online", value: stats.riders_online, icon: "🛵" },
                  { label: "In transit", value: stats.orders_in_transit, icon: "📦" },
                  { label: "Avg delivery", value: `${stats.avg_delivery_mins}m`, icon: "⚡" },
                  { label: "Dark stores", value: stats.dark_stores_active, icon: "🏪" },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur">
                    <p className="text-lg">{s.icon}</p>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-[10px] uppercase tracking-wide text-violet-200">{s.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-8 px-6 py-8">
        {/* Express promise */}
        <div className="flex flex-wrap items-center gap-4 rounded-[2rem] border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-6 shadow-lg">
          <BoltIcon className="h-10 w-10 text-amber-500" />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-amber-900">8-Minute Express Promise</h2>
            <p className="text-sm text-amber-800">
              Orders from {stats?.express_zones?.join(", ") || "Mysore zones"} qualify for ultra-fast delivery.
              Miss the window? Get ₹50 GoServe credit automatically.
            </p>
          </div>
          <button
            onClick={() => navigate("/products")}
            className="rounded-full bg-amber-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-600"
          >
            Order now
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Live map section */}
          <div className="space-y-6">
            {loading ? (
              <div className="flex h-80 items-center justify-center rounded-3xl bg-white shadow-lg">
                <p className="text-slate-500">Loading live deliveries...</p>
              </div>
            ) : active.length === 0 ? (
              <div className="rounded-[2rem] bg-white p-10 text-center shadow-xl">
                <div className="text-5xl">📭</div>
                <h3 className="mt-4 text-xl font-bold text-slate-900">No active deliveries</h3>
                <p className="mt-2 text-slate-600">Place an order to see live tracking here.</p>
                <button
                  onClick={() => navigate("/products")}
                  className="mt-6 rounded-full bg-violet-700 px-6 py-3 text-sm font-semibold text-white"
                >
                  Start shopping
                </button>
              </div>
            ) : (
              <>
                {selectedTracking && (
                  <LiveLocationMap
                    liveLocation={selectedTracking.live_location}
                    destination={selectedTracking.destination}
                    origin={selectedTracking.origin}
                    trail={selectedTracking.trail}
                    isLive={selectedTracking.is_live}
                    height="400px"
                  />
                )}

                <div className="flex gap-3 overflow-x-auto pb-2">
                  {active.map((d) => (
                    <button
                      key={d.order_id}
                      onClick={() => setSelected(d)}
                      className={`shrink-0 rounded-2xl border px-4 py-3 text-left transition ${
                        selected?.order_id === d.order_id
                          ? "border-violet-400 bg-violet-50 shadow-md"
                          : "border-slate-200 bg-white hover:border-violet-200"
                      }`}
                    >
                      <p className="text-xs text-slate-500">#{d.order_id}</p>
                      <p className="font-semibold text-slate-900">{d.product_name}</p>
                      <p className="text-xs text-violet-600">{d.status}</p>
                    </button>
                  ))}
                </div>

                {selectedTracking && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <RiderCard
                      rider={selectedTracking.rider}
                      deliveryOtp={selectedTracking.delivery_otp}
                    />
                    <div className="rounded-3xl bg-white p-5 shadow-lg">
                      <EtaCountdown
                        minutes={selectedTracking.eta_minutes}
                        status={selectedTracking.status}
                      />
                      <button
                        onClick={() => navigate(`/track/${selected.order_id}`)}
                        className="mt-4 w-full rounded-2xl bg-violet-700 py-3 text-sm font-semibold text-white hover:bg-violet-800"
                      >
                        Full tracking details →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-[2rem] bg-white p-6 shadow-xl">
              <h3 className="flex items-center gap-2 font-bold text-slate-900">
                <MapPinIcon className="h-5 w-5 text-violet-600" />
                Dark Store Network
              </h3>
              <p className="mt-1 text-xs text-slate-500">Mysuru micro-fulfillment hubs</p>
              <div className="mt-4 space-y-3">
                {DARK_STORES.map((store) => (
                  <div key={store.name} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex justify-between">
                      <p className="font-semibold text-slate-900">{store.name}</p>
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">LIVE</span>
                    </div>
                    <p className="text-xs text-slate-500">{store.area}</p>
                    <div className="mt-2 flex justify-between text-xs">
                      <span className="text-violet-600">{store.orders} orders packing</span>
                      <span className="text-slate-500">{store.eta}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-xl">
              <h3 className="flex items-center gap-2 font-bold text-slate-900">
                <ShieldCheckIcon className="h-5 w-5 text-green-600" />
                GoServe Safe Delivery
              </h3>
              <div className="mt-4 space-y-4">
                {SAFETY_FEATURES.map((f) => (
                  <div key={f.title} className="flex gap-3">
                    <span className="text-xl">{f.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{f.title}</p>
                      <p className="text-xs text-slate-500">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] bg-gradient-to-br from-violet-600 to-fuchsia-600 p-6 text-white shadow-xl">
              <ClockIcon className="h-8 w-8" />
              <h3 className="mt-3 font-bold">Delivery slots</h3>
              <ul className="mt-3 space-y-2 text-sm text-violet-100">
                <li>⚡ Express — 8 minutes</li>
                <li>🕐 Standard — 15–30 minutes</li>
                <li>📅 Scheduled — pick your window</li>
              </ul>
              <button
                onClick={() => navigate("/checkout")}
                className="mt-4 w-full rounded-2xl bg-white py-2.5 text-sm font-bold text-violet-800"
              >
                Choose at checkout
              </button>
            </div>
          </div>
        </div>

        {/* Fleet strip */}
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <TruckIcon className="h-8 w-8 text-violet-600" />
              <div>
                <p className="font-bold text-slate-900">GoServe Fleet — Mysuru</p>
                <p className="text-sm text-slate-500">Electric scooters · Insulated bags · Rain-ready gear</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/track-orders")}
              className="rounded-full border border-violet-200 px-5 py-2.5 text-sm font-semibold text-violet-700 hover:bg-violet-50"
            >
              View all orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
