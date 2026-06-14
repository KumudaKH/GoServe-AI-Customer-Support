import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import OrderSummary from "../components/OrderSummary";
import ProductImage from "../components/ProductImage";

export default function Cart() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6">
        <h1 className="text-2xl font-bold text-slate-900">Your cart is empty</h1>
        <Link
          to="/products"
          className="rounded-2xl bg-green-600 px-6 py-3 font-semibold text-white"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Shopping Cart</h1>
          <Link to="/products" className="text-sm text-slate-600 underline">
            Continue shopping
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-lg sm:flex-row sm:items-center"
              >
                <ProductImage
                  src={item.image_url}
                  alt={item.name}
                  category={item.category}
                  className="h-24 w-24 rounded-2xl object-cover"
                />

                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {item.name}
                  </h2>
                  <p className="mt-1 font-bold text-green-600">
                    ₹{item.price.toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="h-9 w-9 rounded-lg border"
                  >
                    -
                  </button>
                  <span className="w-6 text-center font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="h-9 w-9 rounded-lg border"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeFromCart(item.id)}
                  className="text-sm font-medium text-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <OrderSummary
            showCoupon
            onCheckout={() => navigate("/checkout")}
          />
        </div>
      </div>
    </div>
  );
}
