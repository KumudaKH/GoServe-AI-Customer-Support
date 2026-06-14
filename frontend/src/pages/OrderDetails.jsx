import { useParams, useNavigate } from "react-router-dom";

export default function OrderDetails() {
  const { order_id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Order Details</h1>
            <p className="text-slate-600">Order ID: {order_id}</p>
          </div>
          <button
            onClick={() => navigate('/orders')}
            className="rounded-2xl bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-800"
          >
            Back to Orders
          </button>
        </div>

        <div className="mt-8 rounded-3xl bg-slate-50 p-6 text-slate-700">
          <p>This page is a placeholder for order details.</p>
        </div>
      </div>
    </div>
  );
}
