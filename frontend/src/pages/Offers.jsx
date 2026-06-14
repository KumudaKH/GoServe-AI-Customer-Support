import { useNavigate } from "react-router-dom";

const offerItems = [
  { title: "Flash Sale", detail: "Up to 70% off on essentials", badge: "HOT" },
  { title: "Limited Time Deals", detail: "Deals ending soon", badge: "FAST" },
  { title: "Buy 1 Get 1", detail: "Selected brands only", badge: "BUNDLE" },
  { title: "Combo Offers", detail: "Build your cart for savings", badge: "SAVE" },
];

export default function Offers() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F7F3FF] p-6 pb-28">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[2rem] bg-gradient-to-r from-violet-700 to-fuchsia-600 p-8 text-white shadow-2xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold">Today's Offers</h1>
              <p className="mt-3 max-w-2xl text-sm text-violet-100">Snap up the latest flash sales, combo bundles and limited-time specials.</p>
            </div>
            <button
              onClick={() => navigate("/products")}
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-violet-900 transition hover:bg-violet-100"
            >
              Explore products
            </button>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {offerItems.map((offer) => (
            <div key={offer.title} className="rounded-[2rem] bg-white p-6 shadow-lg border border-slate-200 transition hover:-translate-y-1 hover:shadow-2xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-violet-600">{offer.badge}</p>
                  <h2 className="mt-3 text-2xl font-bold text-slate-900">{offer.title}</h2>
                </div>
                <span className="rounded-full bg-violet-50 px-3 py-1 text-sm font-semibold text-violet-700">New</span>
              </div>
              <p className="mt-4 text-sm text-slate-600">{offer.detail}</p>
            </div>
          ))}
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-lg border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Countdown Timer</h2>
          <p className="mt-3 text-sm text-slate-600">Grab these offers before time runs out.</p>
          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            {['12', '04', '29'].map((value, idx) => (
              <div key={idx} className="rounded-3xl bg-violet-50 p-5">
                <p className="text-3xl font-bold text-violet-700">{value}</p>
                <p className="text-xs uppercase tracking-[0.28em] text-violet-500">{idx === 0 ? 'Hrs' : idx === 1 ? 'Mins' : 'Secs'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
