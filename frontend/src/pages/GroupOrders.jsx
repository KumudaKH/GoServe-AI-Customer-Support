import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authenticatedFetch } from "../services/api";
import { getFallbackImage } from "../utils/productImage";

export default function GroupOrders() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await authenticatedFetch("/api/group/my", {}, navigate);
        setGroups(res?.groups || []);
      } catch (e) {
        setError(e.message || "Unable to load group orders");
        setGroups([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate]);

  const summary = useMemo(() => {
    const totalGroups = groups.length;
    const openGroups = groups.filter((g) => g.status === "open").length;
    const placedGroups = groups.filter((g) => g.status === "placed").length;
    const totalMembers = groups.reduce((sum, g) => sum + (g.members?.length || 0), 0);
    return { totalGroups, openGroups, placedGroups, totalMembers };
  }, [groups]);

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">GoServe Premium</p>
            <h1 className="mt-2 text-4xl font-bold text-slate-900">Buy Together</h1>
            <p className="mt-2 text-slate-600 max-w-2xl">Manage your group orders, invite friends, and track shared contributions in one place.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="inline-flex items-center justify-center rounded-3xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
          >
            Browse products
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
          {[
            { label: "Active groups", value: summary.totalGroups },
            { label: "Open invites", value: summary.openGroups },
            { label: "Placed orders", value: summary.placedGroups },
            { label: "Group members", value: summary.totalMembers },
          ].map((card) => (
            <div key={card.label} className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">{card.label}</p>
              <p className="mt-4 text-3xl font-bold text-slate-900">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-lg">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Your buy together groups</h2>
              <p className="mt-2 text-sm text-slate-500">See progress, contribution status, and total savings for each group.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Create invite from product
            </button>
          </div>

          {loading ? (
            <div className="mt-8 rounded-3xl bg-slate-50 p-8 text-center text-slate-500">Loading group orders...</div>
          ) : error ? (
            <div className="mt-8 rounded-3xl bg-red-50 p-8 text-red-700">{error}</div>
          ) : groups.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-600">
              <p className="text-xl font-semibold text-slate-900">No group orders yet</p>
              <p className="mt-2">Start a group purchase to unlock volume savings and fast delivery.</p>
              <button
                type="button"
                onClick={() => navigate("/products")}
                className="mt-6 rounded-3xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
              >
                Start shopping
              </button>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              {groups.map((group) => {
                const joined = group.members?.length || 0;
                const target = 4;
                const progress = Math.min(100, Math.round((joined / target) * 100));
                const goalText = group.status === "placed" ? "Order placed" : `${Math.max(0, target - joined)} more needed`;

                return (
                  <button
                    key={group.group_id}
                    type="button"
                    onClick={() => navigate(`/group/${group.invite_code}`)}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs uppercase tracking-[0.2em] text-violet-700">
                          {group.status === "placed" ? "Complete" : "Invite open"}
                        </div>
                        <h3 className="mt-2 text-xl font-bold text-slate-900">{group.product_name}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-500">Price</p>
                        <p className="mt-1 text-2xl font-bold text-emerald-600">₹{group.price?.toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                    <div className="mt-5 grid gap-4 sm:grid-cols-3">
                      <div className="rounded-3xl bg-white p-4 shadow-sm">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Members</p>
                        <p className="mt-2 text-xl font-semibold text-slate-900">{joined}</p>
                      </div>
                      <div className="rounded-3xl bg-white p-4 shadow-sm">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Progress</p>
                        <p className="mt-2 text-xl font-semibold text-slate-900">{progress}%</p>
                      </div>
                      <div className="rounded-3xl bg-white p-4 shadow-sm">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Status</p>
                        <p className="mt-2 text-xl font-semibold text-slate-900">{goalText}</p>
                      </div>
                    </div>
                    <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: `${progress}%` }} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
