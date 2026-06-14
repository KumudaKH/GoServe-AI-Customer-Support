import { useNavigate } from "react-router-dom";

function OrderCard({ data, onCreateTicket }) {
  const navigate = useNavigate();
  const status = (data.status || "").toLowerCase();
  const badge = status.includes("delivered") ? "🟢"
    : status.includes("shipped") ? "🔵"
    : status.includes("cancel") ? "🔴" : "🟠";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="font-bold text-slate-900">📦 Order #{data.order_id}</h4>
        <span className="text-sm">{badge} {data.status}</span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div><p className="text-xs text-slate-500">Product</p><p className="font-medium">{data.product_name}</p></div>
        <div><p className="text-xs text-slate-500">Amount</p><p className="font-medium">₹{data.price?.toFixed?.(0) ?? data.price}</p></div>
        {data.carrier && <div><p className="text-xs text-slate-500">Carrier</p><p className="font-medium">{data.carrier}</p></div>}
        {data.tracking_number && <div><p className="text-xs text-slate-500">Tracking</p><p className="font-medium">{data.tracking_number}</p></div>}
        {data.current_location && (
          <div className="col-span-2"><p className="text-xs text-slate-500">Location</p><p className="font-medium">{data.current_location}</p></div>
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => navigate("/orders")} className="rounded-xl bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700">📍 Track</button>
        <button onClick={() => navigate("/refunds")} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">💰 Refund</button>
        {onCreateTicket && (
          <button onClick={onCreateTicket} className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-100">🎫 Ticket</button>
        )}
      </div>
    </div>
  );
}

function ProductCard({ data }) {
  const navigate = useNavigate();
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md">
      <div className="flex gap-3">
        {data.image_url && (
          <img src={data.image_url} alt={data.name} className="h-16 w-16 rounded-xl object-cover" />
        )}
        <div className="flex-1">
          <h4 className="font-semibold text-slate-900">{data.name}</h4>
          <p className="text-sm text-violet-700 font-bold">₹{data.price}</p>
          <p className="text-xs text-slate-500">{data.category}</p>
        </div>
      </div>
      <button
        onClick={() => navigate(`/products/${data.id}`)}
        className="mt-3 w-full rounded-xl bg-violet-600 py-2 text-xs font-semibold text-white hover:bg-violet-700"
      >
        View Product
      </button>
    </div>
  );
}

function TicketCard({ data }) {
  const navigate = useNavigate();
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md">
      <p className="text-xs text-slate-500">{data.ticket_id}</p>
      <h4 className="font-semibold text-slate-900">{data.subject}</h4>
      <p className="mt-1 text-sm text-orange-600">🟠 {data.status} · {data.priority}</p>
      <button
        onClick={() => navigate(`/tickets/${data.ticket_id}`)}
        className="mt-3 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
      >
        View Ticket
      </button>
    </div>
  );
}

function CouponCard({ data }) {
  return (
    <div className="rounded-2xl border border-dashed border-violet-300 bg-violet-50 p-4">
      <p className="text-lg font-bold text-violet-800">{data.code}</p>
      <p className="text-sm text-slate-600">{data.description}</p>
    </div>
  );
}

export default function ResponseCards({ cards, onCreateTicket }) {
  if (!cards?.length) return null;

  return (
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      {cards.map((card, idx) => {
        switch (card.type) {
          case "order":
            return <OrderCard key={idx} data={card.data} onCreateTicket={onCreateTicket} />;
          case "product":
            return <ProductCard key={idx} data={card.data} />;
          case "ticket":
            return <TicketCard key={idx} data={card.data} />;
          case "coupon":
            return <CouponCard key={idx} data={card.data} />;
          default:
            return null;
        }
      })}
    </div>
  );
}

export function ActionButtons({ actions, onAction }) {
  if (!actions?.length) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {actions.map((act, idx) => (
        <button
          key={idx}
          onClick={() => onAction?.(act)}
          className="rounded-full border border-violet-200 bg-white px-4 py-2 text-xs font-semibold text-violet-700 transition hover:bg-violet-50 hover:shadow-sm"
        >
          {act.label}
        </button>
      ))}
    </div>
  );
}
