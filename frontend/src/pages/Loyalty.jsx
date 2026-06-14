import { useMemo } from "react";

const rewardTiers = [
  { title: "Silver", points: 1200, threshold: 1000, color: "from-slate-200 to-slate-400" },
  { title: "Gold", points: 820, threshold: 5000, color: "from-amber-200 to-orange-400" },
  { title: "Platinum", points: 320, threshold: 10000, color: "from-cyan-200 to-blue-500" },
];

const benefits = [
  "Priority support for orders and deliveries",
  "Exclusive cashback offers and vouchers",
  "Early access to premium deals and bundles",
  "Faster checkout with saved payment rewards",
];

export default function Loyalty() {
  const totalPoints = useMemo(
    () => rewardTiers.reduce((sum, tier) => sum + tier.points, 0),
    []
  );

  return (
    <div className="min-h-screen bg-[#F7F3FF] p-6 pb-28">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[2rem] bg-gradient-to-r from-slate-900 via-violet-800 to-fuchsia-700 p-8 text-white shadow-2xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-violet-200">Loyalty Club</p>
              <h1 className="mt-3 text-4xl font-bold">Your GoServe Rewards</h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-200">Earn points with every order and unlock premium rewards across categories.</p>
            </div>
            <div className="rounded-[2rem] bg-white/10 px-6 py-5 text-center backdrop-blur-sm">
              <p className="text-sm uppercase tracking-[0.28em] text-violet-100">Points Balance</p>
              <p className="mt-4 text-5xl font-extrabold">{totalPoints}</p>
              <p className="mt-2 text-sm text-violet-100">points earned across membership tiers</p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {rewardTiers.map((tier) => (
            <div key={tier.title} className="rounded-[2rem] bg-white p-6 shadow-lg border border-slate-200">
              <div className={`rounded-[1.75rem] bg-gradient-to-r ${tier.color} p-5 text-slate-900`}>
                <p className="text-sm font-semibold uppercase tracking-[0.32em]">{tier.title} tier</p>
                <p className="mt-4 text-4xl font-bold">{tier.points} pts</p>
              </div>
              <div className="mt-5 space-y-2 text-sm text-slate-600">
                <p>Threshold: {tier.threshold.toLocaleString("en-IN")} points</p>
                <p>Redeem rewards, vouchers, and priority perks.</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-lg border border-slate-200">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-violet-600">Membership benefits</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Premium perks unlocked</h2>
            </div>
            <button className="rounded-full bg-violet-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-800">
              Redeem points
            </button>
          </div>
          <ul className="mt-6 space-y-3 text-slate-600">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3 rounded-3xl border border-slate-100 bg-slate-50 p-4 shadow-sm">
                <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">✓</span>
                <p>{benefit}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[2rem] bg-gradient-to-r from-violet-600 to-fuchsia-600 p-8 text-white shadow-2xl">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-violet-100">Fast progress</p>
              <h2 className="mt-4 text-3xl font-bold">Keep climbing the tiers</h2>
              <p className="mt-3 text-sm text-violet-100/90">Earn points on every delivery and unlock higher savings with GoServe's premium shopping experience.</p>
            </div>
            <div className="rounded-[2rem] bg-white/10 p-6">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.28em] text-violet-200">
                <span>Current rank</span>
                <span>Silver</span>
              </div>
              <div className="mt-4 h-4 overflow-hidden rounded-full bg-white/20">
                <div className="h-full rounded-full bg-white" style={{ width: "35%" }} />
              </div>
              <p className="mt-3 text-sm text-violet-100">35% to Gold tier — keep ordering to boost your rewards.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
