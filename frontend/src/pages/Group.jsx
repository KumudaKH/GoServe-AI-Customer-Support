import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { authenticatedFetch } from "../services/api";
import ShareInviteModal from "../components/ShareInviteModal";

export default function Group() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [amount, setAmount] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const loadGroup = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await authenticatedFetch(`/api/group/${code}`, {}, navigate);
      setGroup(data);
    } catch (e) {
      setError(e.message || "Failed to load group");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (code) loadGroup();
  }, [code]);

  const totalContributed = useMemo(
    () =>
      (group?.members || []).reduce(
        (sum, m) => sum + (m.contributed_amount || 0),
        0
      ),
    [group]
  );

  const progress = group?.price
    ? Math.min(100, Math.round((totalContributed / group.price) * 100))
    : 0;

  const handleJoin = async () => {
    setActionLoading(true);
    try {
      await authenticatedFetch(
        "/api/group/join",
        { method: "POST", body: JSON.stringify({ invite_code: code }) },
        navigate
      );
      await loadGroup();
    } catch (e) {
      setError(e.message || "Failed to join group");
    } finally {
      setActionLoading(false);
    }
  };

  const handleContribute = async () => {
    const value = parseFloat(amount);
    if (!value || value <= 0) {
      setError("Enter a valid contribution amount");
      return;
    }

    setActionLoading(true);
    setError("");
    try {
      await authenticatedFetch(
        "/api/group/contribute",
        {
          method: "POST",
          body: JSON.stringify({ invite_code: code, amount: value }),
        },
        navigate
      );
      setAmount("");
      await loadGroup();
    } catch (e) {
      setError(e.message || "Failed to contribute");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
        Loading group...
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6">
        <p className="text-red-600">{error || "Group not found"}</p>
        <Link to="/group-orders" className="text-violet-600 underline">
          Back to Buy Together
        </Link>
      </div>
    );
  }

  const paidCount = (group.members || []).filter((member) => member.has_paid).length;
  const pendingCount = (group.members || []).filter((member) => !member.has_paid).length;
  const estimatedIndividual = Math.round(group.price * 1.16);
  const estimatedSaving = Math.round(estimatedIndividual - group.price);

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-3xl">
        <Link to="/group-orders" className="text-sm text-slate-500 hover:text-violet-600">
          ← Back to Buy Together
        </Link>

        <div className="mt-4 rounded-[2rem] bg-gradient-to-r from-violet-600 to-fuchsia-600 p-6 text-white shadow-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
            {group.status === "placed" ? "Order placed" : "Open group"}
          </p>
          <h1 className="mt-2 text-3xl font-bold">{group.product_name}</h1>
          <p className="mt-4 text-3xl font-bold">₹{group.price?.toLocaleString("en-IN")}</p>
          <p className="mt-2 text-sm text-white/80">Share a quick link so friends can join.</p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Joined</p>
            <p className="mt-3 text-2xl font-bold text-slate-900">{paidCount}</p>
          </div>
          <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Pending</p>
            <p className="mt-3 text-2xl font-bold text-slate-900">{pendingCount}</p>
          </div>
          <div className="rounded-[1.75rem] bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Progress</p>
            <p className="mt-3 text-2xl font-bold text-slate-900">{progress}%</p>
          </div>
        </div>

        <div className="mt-6 rounded-[2rem] bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Individual price</span>
            <span>₹{estimatedIndividual.toLocaleString("en-IN")}</span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xl font-semibold text-violet-700">
            <span>Group price</span>
            <span>₹{group.price?.toLocaleString("en-IN")}</span>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-3xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
            <span>🎉 You save</span>
            <span>₹{estimatedSaving.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="mt-6 rounded-[2rem] bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Members</span>
            <span>{group.members?.length || 0} / 4</span>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
              <div className="font-semibold text-slate-900">{paidCount}</div>
              Joined
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
              <div className="font-semibold text-slate-900">{pendingCount}</div>
              Pending
            </div>
          </div>
        </div>

        {error && <p className="mt-4 text-red-600">{error}</p>}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleJoin}
            disabled={actionLoading}
            className="rounded-2xl border border-slate-300 py-3.5 font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-60"
          >
            Join Group
          </button>
          <button
            type="button"
            onClick={() => setShowShare(true)}
            className="rounded-2xl bg-violet-600 py-3.5 font-semibold text-white hover:bg-violet-700"
          >
            Share group
          </button>
        </div>

        <button
          type="button"
          disabled={group.status !== "placed"}
          className="mt-6 w-full rounded-3xl bg-violet-600 py-4 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {group.status === "placed" ? "Complete purchase" : "Complete purchase"}
        </button>
      </div>

      {showShare && (
        <ShareInviteModal
          group={group}
          onClose={() => setShowShare(false)}
          onViewGroup={() => {
            setShowShare(false);
          }}
        />
      )}
    </div>
  );
}
