import { useNavigate } from "react-router-dom";

const dealCards = [
  { title: "Trending Deals", description: "Popular products chosen by smart shoppers", icon: "🔥" },
  { title: "Recommended Deals", description: "Personalized deals curated for you", icon: "🎯" },
  { title: "AI Picks", description: "Smart recommendations based on recent searches", icon: "🤖" },
  { title: "Festival Deals", description: "Special prices for festival season", icon: "✨" },
];

export default function Deals() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F7F3FF] p-6 pb-28">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[2rem] bg-gradient-to-r from-violet-700 to-fuchsia-600 p-8 text-white shadow-2xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold">Deals</h1>
              <p className="mt-3 max-w-2xl text-sm text-violet-100">Unlock trending, recommended, AI-picked, and festival offers.</p>
            </div>
            <button
              onClick={() => navigate("/products")}
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-violet-900 transition hover:bg-violet-100"
            >
              Shop deals
            </button>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {dealCards.map((deal) => (
            <div key={deal.title} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-violet-50 text-2xl">
                {deal.icon}
              </div>
              <h2 className="mt-4 text-xl font-bold text-slate-900">{deal.title}</h2>
              <p className="mt-3 text-sm text-slate-600">{deal.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
