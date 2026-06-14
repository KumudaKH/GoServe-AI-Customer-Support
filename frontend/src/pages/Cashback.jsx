export default function Cashback() {
  return (
    <div className="min-h-screen bg-[#F7F3FF] p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="overflow-hidden rounded-[2rem] bg-gradient-to-r from-violet-700 to-fuchsia-600 p-8 text-white shadow-2xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-violet-200">Cashback</p>
              <h1 className="mt-3 text-4xl font-bold">Earn rewards every time you shop.</h1>
              <p className="mt-3 max-w-2xl text-sm text-violet-100">Track available cashback, pending payouts, and expiring rewards.</p>
            </div>
            <button className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-violet-900 shadow-lg transition hover:bg-violet-100">
              Redeem Cashback
            </button>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-[2rem] bg-white p-6 shadow-lg border border-slate-200">
            <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Available Cashback</p>
            <p className="mt-3 text-4xl font-bold text-slate-900">₹1,280</p>
            <p className="mt-2 text-sm text-slate-600">Ready to use on your next order.</p>
          </div>
          <div className="rounded-[2rem] bg-white p-6 shadow-lg border border-slate-200">
            <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Pending Cashback</p>
            <p className="mt-3 text-4xl font-bold text-slate-900">₹450</p>
            <p className="mt-2 text-sm text-slate-600">Expected after order confirmation.</p>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-lg border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Cashback History</h2>
          <div className="mt-5 space-y-4">
            {[
              { label: "Order #6592", amount: "₹120", status: "Credited", date: "Today" },
              { label: "Order #6531", amount: "₹80", status: "Pending", date: "2 days ago" },
              { label: "Order #6480", amount: "₹250", status: "Expired soon", date: "5 days ago" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col gap-2 rounded-3xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{item.label}</p>
                  <p className="text-sm text-slate-500">{item.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{item.status}</span>
                  <p className="text-lg font-bold text-slate-900">{item.amount}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
