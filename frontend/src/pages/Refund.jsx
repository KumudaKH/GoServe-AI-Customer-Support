import { useState } from "react";
import { Link } from "react-router-dom";

export default function Refund() {
  const [orderId, setOrderId] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setOrderId("");
    setReason("");
    setDescription("");
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(229,9,20,0.35),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(120,0,0,0.5),_transparent_40%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#141414] to-black opacity-95" />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative z-10 mx-auto max-w-3xl px-6 py-10">
        <Link to="/orders" className="text-sm text-white/60 transition hover:text-white">
          ← Back to orders
        </Link>

        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-500">
            GoServe Support
          </p>
          <h1 className="mt-3 text-4xl font-bold md:text-5xl">Request a Refund</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/70">
            Tell us what went wrong and our team will review your order within 24 hours.
          </p>
        </div>

        <div className="mt-10 rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl md:p-8">
          {submitted ? (
            <div className="rounded-3xl bg-green-500/10 p-8 text-center ring-1 ring-green-500/30">
              <p className="text-2xl font-bold text-green-400">Refund request submitted</p>
              <p className="mt-2 text-white/70">
                We will notify you once your request has been reviewed.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-white/80">Order ID</label>
                <input
                  type="number"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="Enter your order ID"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-white/80">Refund reason</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-red-500"
                  required
                >
                  <option value="" className="bg-slate-900">Select reason</option>
                  <option value="Damaged Product" className="bg-slate-900">Damaged product</option>
                  <option value="Wrong Item" className="bg-slate-900">Wrong item delivered</option>
                  <option value="Quality Issue" className="bg-slate-900">Quality issue</option>
                  <option value="Late Delivery" className="bg-slate-900">Late delivery</option>
                  <option value="Other" className="bg-slate-900">Other</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-white/80">Description</label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue in detail..."
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-red-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-[#E50914] py-4 text-lg font-bold text-white transition hover:bg-[#f6121d]"
              >
                Submit refund request
              </button>
            </form>
          )}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { title: "Fast review", desc: "Most requests reviewed within 24h" },
            { title: "Wallet credit", desc: "Approved refunds go to your wallet" },
            { title: "Order protection", desc: "Every GoServe order is covered" },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
            >
              <p className="font-semibold text-white">{item.title}</p>
              <p className="mt-2 text-sm text-white/60">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
