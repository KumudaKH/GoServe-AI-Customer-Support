import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authenticatedFetch } from "../services/api";
import ProductImage from "../components/ProductImage";
import { getDiscountPercent } from "../utils/pricing";
import {
  buildShareText,
  copyInviteLink,
  shareViaNative,
  shareViaWhatsApp,
} from "../utils/inviteShare";

const staticMembers = [
  { name: "Kumuda", status: "paid" },
  { name: "Rahul", status: "paid" },
  { name: "Sneha", status: "pending" },
  { name: "Akash", status: "pending" },
];

export default function BuyTogether() {
  const navigate = useNavigate();
  const location = useLocation();
  const product = location.state?.product;
  const [group, setGroup] = useState(null);
  const [creating, setCreating] = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  useEffect(() => {
    if (!product) {
      navigate("/products", { replace: true });
    }
  }, [product, navigate]);

  const discount = useMemo(
    () => getDiscountPercent(product?.price || 0, product?.original_price || 0),
    [product]
  );

  const estimatedIndividual = useMemo(
    () => (product ? product.original_price || product.price : 0),
    [product]
  );

  const savings = useMemo(
    () => (product ? Math.max(0, Math.round((product.original_price || product.price) - product.price)) : 0),
    [product]
  );

  const progress = useMemo(() => {
    if (!group) return 40;
    const joined = group.members?.length || 1;
    return Math.min(100, Math.round((joined / 4) * 100));
  }, [group]);

  const joinedCount = useMemo(() => (group ? group.members?.length || 1 : 1), [group]);

  const handleCreate = async () => {
    if (!product) return;
    setCreating(true);
    try {
      const created = await authenticatedFetch(
        "/api/group/",
        {
          method: "POST",
          body: JSON.stringify({
            product_name: product.name,
            price: product.price,
          }),
        },
        navigate
      );
      setGroup(created);
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleInvite = async () => {
    if (!group) return;
    const text = buildShareText(group.product_name, group.price, group.invite_code);
    const shared = await shareViaNative(text);
    if (!shared) {
      shareViaWhatsApp(group.product_name, group.price, group.invite_code);
    }
    setShareStatus("Invite sent");
    setTimeout(() => setShareStatus(""), 2000);
  };

  const handleCopy = async () => {
    if (!group) return;
    await copyInviteLink(group.invite_code);
    setCopyStatus("Link copied");
    setTimeout(() => setCopyStatus(""), 2000);
  };

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <button
          type="button"
          onClick={() => navigate("/products")}
          className="text-sm font-medium text-slate-600 hover:text-violet-700"
        >
          ← Back to Products
        </button>

        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-violet-600">👥 Buy Together</p>
            <h1 className="mt-3 text-4xl font-bold text-slate-900">Invite friends and save more together.</h1>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_0.95fr]">
          <div className="rounded-[2rem] bg-white p-6 shadow-xl">
            <div className="overflow-hidden rounded-[1.75rem] bg-slate-100">
              <ProductImage
                src={product.image_url}
                alt={product.name}
                category={product.category}
                className="h-[360px] w-full object-cover"
              />
            </div>
            <div className="mt-6 space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{product.category}</p>
                <h2 className="mt-3 text-3xl font-bold text-slate-900">{product.name}</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.5rem] bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Original price</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">₹{(product.original_price || product.price).toLocaleString("en-IN")}</p>
                </div>
                <div className="rounded-[1.5rem] bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Group price</p>
                  <p className="mt-2 text-xl font-semibold text-violet-700">₹{product.price.toLocaleString("en-IN")}</p>
                </div>
                <div className="rounded-[1.5rem] bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Discount</p>
                  <p className="mt-2 text-xl font-semibold text-emerald-600">{discount}%</p>
                </div>
              </div>

              <div className="rounded-[1.5rem] bg-violet-700 px-5 py-4 text-white shadow-lg">
                <p className="text-sm uppercase tracking-[0.3em] text-violet-200">Estimated savings</p>
                <p className="mt-3 text-3xl font-bold">₹{savings.toLocaleString("en-IN")}</p>
                <p className="mt-1 text-sm text-violet-200">Save instantly when friends join the group.</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] bg-white p-6 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Group details</p>
                  <h2 className="mt-3 text-2xl font-bold text-slate-900">Need members</h2>
                </div>
                <span className="rounded-full bg-violet-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-violet-700">
                  Live
                </span>
              </div>

              <div className="mt-5 grid grid-cols-4 gap-2 text-center text-xl">
                <span className="rounded-3xl bg-violet-50 py-4 text-violet-700">👤</span>
                <span className="rounded-3xl bg-violet-50 py-4 text-violet-700">👤</span>
                <span className="rounded-3xl bg-violet-50 py-4 text-violet-700">👤</span>
                <span className="rounded-3xl bg-violet-50 py-4 text-violet-700">👤</span>
              </div>

              <div className="mt-6 rounded-[1.75rem] bg-slate-50 p-5">
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Joined</span>
                  <span>{group ? group.members?.length || 1 : 1} / 4</span>
                </div>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" style={{ width: `${progress}%` }} />
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                  <span>Time remaining</span>
                  <span>05:42:18</span>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={creating || Boolean(group)}
                  className="rounded-3xl bg-violet-700 py-3 text-sm font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {group ? "Group created" : creating ? "Creating group..." : "Create Group"}
                </button>
                <button
                  type="button"
                  onClick={handleInvite}
                  disabled={!group}
                  className="rounded-3xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Invite Friends
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!group}
                  className="rounded-3xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {copyStatus || "Copy Link"}
                </button>
              </div>

              {shareStatus && (
                <p className="mt-3 text-sm text-emerald-700">{shareStatus}</p>
              )}
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-xl">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Savings card</p>
              <div className="mt-4 space-y-4">
                <div className="rounded-[1.5rem] bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Individual Price</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">₹{estimatedIndividual.toLocaleString("en-IN")}</p>
                </div>
                <div className="rounded-[1.5rem] bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Group Price</p>
                  <p className="mt-2 text-xl font-semibold text-violet-700">₹{product.price.toLocaleString("en-IN")}</p>
                </div>
                <div className="rounded-[1.5rem] bg-emerald-50 p-4">
                  <p className="text-sm font-semibold text-emerald-700">🎉 You Save</p>
                  <p className="mt-2 text-2xl font-bold text-emerald-900">₹{savings.toLocaleString("en-IN")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[2rem] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Members</p>
              <span className="text-xs uppercase tracking-[0.3em] text-slate-400">Live</span>
            </div>
            <div className="mt-6 space-y-3">
              {staticMembers.map((member) => (
                <div key={member.name} className="flex items-center justify-between rounded-3xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-violet-100 text-center leading-11 text-xl font-semibold text-violet-700">{member.name[0]}</div>
                    <div>
                      <p className="font-semibold text-slate-900">{member.name}</p>
                      <p className="text-sm text-slate-500">{member.status === "paid" ? "Joined" : "Pending"}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${member.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {member.status === "paid" ? "✅" : "⏳"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-xl">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">FAQ</p>
            <div className="mt-6 space-y-4 text-slate-600">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">How does Buy Together work?</p>
                <p className="mt-2 text-sm">Create a group, invite friends, and save when enough members join before checkout.</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">When do I get the discount?</p>
                <p className="mt-2 text-sm">The group price applies once the group is created and members contribute their share.</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">What if members don't join?</p>
                <p className="mt-2 text-sm">The group remains open and you can keep inviting until the group fills up or you choose to checkout.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
