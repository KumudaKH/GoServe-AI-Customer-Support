import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authenticatedFetch } from "../services/api";
import LiveLocationMap, { EtaCountdown, RiderCard } from "../components/LiveLocationMap";
import {
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  MapPinIcon,
  TruckIcon,
} from "@heroicons/react/24/solid";

const timelineSteps = [
  { title: "Order Received", key: "Placed" },
  { title: "Packed", key: "Packed" },
  { title: "Shipped", key: "Shipped" },
  { title: "Out for Delivery", key: "Out for Delivery" },
  { title: "Delivered", key: "Delivered" },
];

const STATUS_ORDER = ["Placed", "Order Received", "Packed", "Shipped", "Out for Delivery", "Delivered"];

export default function TrackOrder() {
  const { order_id } = useParams();
  const navigate = useNavigate();
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchLiveTracking = useCallback(async () => {
    setError("");
    try {
      const data = await authenticatedFetch(
        `http://localhost:8000/api/delivery/live/${order_id}`,
        {},
        navigate
      );
      setTracking(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      setError(err.message || "Order not found");
    } finally {
      setLoading(false);
    }
  }, [order_id, navigate]);

  useEffect(() => {
    fetchLiveTracking();
    const interval = setInterval(fetchLiveTracking, 10000);
    return () => clearInterval(interval);
  }, [fetchLiveTracking]);

  const getActiveStep = () => {
    if (!tracking) return -1;
    const idx = STATUS_ORDER.indexOf(tracking.status);
    if (idx >= 0) return Math.min(idx, timelineSteps.length - 1);
    return timelineSteps.findIndex(
      (s) => s.key.toLowerCase() === tracking.status?.toLowerCase()
    );
  };

  const activeStep = getActiveStep();

  const getStatusBadgeClass = () => {
    if (!tracking) return "bg-gray-100 text-gray-700";
    const s = tracking.status;
    if (s === "Delivered") return "bg-green-100 text-green-700";
    if (s === "Out for Delivery") return "bg-orange-100 text-orange-700 animate-pulse";
    if (s === "Shipped") return "bg-blue-100 text-blue-700";
    if (s === "Packed") return "bg-gray-100 text-gray-700";
    if (s === "Cancelled") return "bg-red-100 text-red-700";
    return "bg-slate-100 text-slate-700";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-violet-50 to-white p-6">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
          <p className="mt-4 font-medium text-slate-600">Loading live tracking...</p>
        </div>
      </div>
    );
  }

  if (error || !tracking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
        <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-lg">
          <div className="text-center text-xl font-semibold text-slate-900">Order not found</div>
          <button
            onClick={() => navigate("/orders")}
            className="mt-6 w-full rounded-3xl bg-violet-700 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-800"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50/80 to-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <button
              onClick={() => navigate("/orders")}
              className="mb-2 flex items-center gap-1 text-sm text-violet-600 hover:text-violet-800"
            >
              <ArrowLeftIcon className="h-4 w-4" /> Back to orders
            </button>
            <h1 className="text-3xl font-bold text-slate-900">Live Order Tracking</h1>
            <p className="mt-1 text-sm text-slate-500">
              Order #{tracking.order_id} · {tracking.product_name}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`rounded-full px-4 py-2 text-sm font-semibold ${getStatusBadgeClass()}`}>
              {tracking.status}
            </span>
            <EtaCountdown minutes={tracking.eta_minutes} status={tracking.status} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <LiveLocationMap
              liveLocation={tracking.live_location}
              destination={tracking.destination}
              origin={tracking.origin}
              trail={tracking.trail}
              isLive={tracking.is_live}
              height="380px"
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-white p-4 shadow-md">
                <p className="text-xs text-slate-500">Distance left</p>
                <p className="text-xl font-bold text-slate-900">{tracking.distance_remaining_km} km</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-md">
                <p className="text-xs text-slate-500">Progress</p>
                <p className="text-xl font-bold text-violet-700">{tracking.progress_percent}%</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-md">
                <p className="text-xs text-slate-500">Tracking ID</p>
                <p className="text-sm font-bold text-slate-900 truncate">{tracking.tracking_number}</p>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-xl">
              <h2 className="text-xl font-bold text-slate-900">Delivery Timeline</h2>
              <div className="mt-6 space-y-4">
                {timelineSteps.map((step, index) => {
                  const isActive = index === activeStep;
                  const isComplete = index < activeStep;
                  return (
                    <div key={step.title} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-full border-2 ${
                            isActive
                              ? "border-violet-500 bg-violet-500 shadow-lg shadow-violet-200"
                              : isComplete
                              ? "border-violet-400 bg-violet-100"
                              : "border-gray-200 bg-white"
                          }`}
                        >
                          {isComplete || isActive ? (
                            <CheckCircleIcon className={`h-5 w-5 ${isActive ? "text-white" : "text-violet-500"}`} />
                          ) : (
                            <div className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                          )}
                        </div>
                        {index < timelineSteps.length - 1 && (
                          <div className={`mt-1 h-8 w-0.5 ${isComplete ? "bg-violet-300" : "bg-gray-200"}`} />
                        )}
                      </div>
                      <div className="pt-2">
                        <p className="font-semibold text-slate-900">{step.title}</p>
                        {isActive && <p className="text-sm text-violet-600">In progress now</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <RiderCard rider={tracking.rider} deliveryOtp={tracking.delivery_otp} />

            <div className="rounded-3xl bg-white p-5 shadow-xl">
              <h3 className="font-bold text-slate-900">Delivery details</h3>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex gap-3">
                  <MapPinIcon className="h-5 w-5 shrink-0 text-violet-500" />
                  <div>
                    <p className="text-slate-500">Delivering to</p>
                    <p className="font-medium text-slate-900">{tracking.destination?.address}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <TruckIcon className="h-5 w-5 shrink-0 text-violet-500" />
                  <div>
                    <p className="text-slate-500">Carrier</p>
                    <p className="font-medium text-slate-900">{tracking.carrier || "GoServe Express"}</p>
                  </div>
                </div>
                {tracking.delivery_slot && (
                  <div className="rounded-2xl bg-violet-50 px-3 py-2">
                    <p className="text-xs text-violet-600">Slot</p>
                    <p className="font-semibold text-violet-900">{tracking.delivery_slot}</p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={fetchLiveTracking}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-700 py-3 text-sm font-semibold text-white hover:bg-violet-800"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Refresh live location
            </button>
            {lastUpdated && (
              <p className="text-center text-xs text-slate-400">
                Updated {lastUpdated.toLocaleTimeString()} · auto-refreshes every 10s
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
