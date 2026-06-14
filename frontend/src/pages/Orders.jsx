
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authenticatedFetch } from "../services/api";
import ProductImage from "../components/ProductImage";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await authenticatedFetch(
        "http://localhost:8000/api/orders",
        {},
        navigate
      );
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    if (status === "Delivered") return "bg-green-100 text-green-700";
    if (status === "Out for Delivery") return "bg-orange-100 text-orange-700";
    if (status === "Shipped") return "bg-blue-100 text-blue-700";
    if (status === "Packed") return "bg-gray-100 text-gray-700";
    if (status === "Cancelled") return "bg-red-100 text-red-700";
    return "bg-slate-100 text-slate-700";
  };

  const formatDate = (value) => {
    if (!value) return "--";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "--";
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="text-xl font-medium">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-lg">
          <div className="text-center text-xl font-semibold text-slate-900">
            Unable to load orders
          </div>
          <button
            onClick={fetchOrders}
            className="mt-6 w-full rounded-3xl bg-violet-700 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-violet-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 text-center">
          <div className="max-w-lg rounded-[2rem] border border-slate-200 bg-white p-10 shadow-xl">
            <div className="mb-6 text-6xl">📦</div>
            <div className="text-3xl font-bold text-slate-900">No Orders Yet</div>
            <p className="mt-4 text-slate-600">
              Your order history is empty for now. Start shopping to fill your bag with premium finds.
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-8 inline-flex rounded-3xl bg-violet-700 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-violet-800"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {orders.map((order) => (
            <div
              key={order.order_id}
              className="group transform overflow-hidden rounded-3xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <ProductImage
                src={order.product_image}
                alt={order.product_name}
                category="Product"
                className="h-48 w-full rounded-3xl object-cover"
              />

              <div className="mt-5 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">
                      {order.product_name}
                    </div>
                    <div className="mt-2 text-sm text-slate-500">
                      Order ID: {order.order_id}
                    </div>
                  </div>
                  <div
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusBadgeClass(order.status)}`}
                  >
                    {order.status}
                  </div>
                </div>

                <div className="grid gap-2 text-sm text-slate-600">
                  <div>
                    <span className="font-semibold text-slate-900">Price:</span>{" "}
                    ₹{order.price}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">Order Date:</span>{" "}
                    {formatDate(order.created_at)}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">Delivery Date:</span>{" "}
                    {formatDate(order.expected_delivery)}
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => navigate(`/track/${order.order_id}`)}
                    className="w-full rounded-3xl bg-violet-700 px-4 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-violet-800"
                  >
                    Track Order
                  </button>
                  <button
                    onClick={() => navigate(`/orders/${order.order_id}`)}
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition-all duration-300 hover:shadow-lg"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
