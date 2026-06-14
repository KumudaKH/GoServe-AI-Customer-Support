import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const wishlistProducts = [
  { name: "Wireless Earbuds", price: 1299, saved: "2 days ago", status: "Price dropped" },
  { name: "Organic Almonds 1kg", price: 799, saved: "1 week ago", status: "Trending" },
  { name: "Running Shoes", price: 2499, saved: "Yesterday", status: "Best deal" },
];

export default function Wishlist() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F7F3FF] p-6 pb-28">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[2rem] bg-gradient-to-r from-violet-700 to-fuchsia-600 p-8 text-white shadow-2xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-violet-200">Wishlist</p>
              <h1 className="mt-3 text-4xl font-bold">Saved for later</h1>
              <p className="mt-3 max-w-2xl text-sm text-violet-100">Your favorite finds, price drops, and one-click actions in a premium layout.</p>
            </div>
            <button
              onClick={() => navigate("/products")}
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-violet-900 transition hover:bg-violet-100"
            >
              Browse products
            </button>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-lg border border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">List</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Saved products</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/bag")}
                className="rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
              >
                Move to Bag
              </button>
              <button
                onClick={() => navigate("/checkout")}
                className="rounded-full bg-violet-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-800"
              >
                Buy Now
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {wishlistProducts.map((product) => (
              <div key={product.name} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{product.name}</p>
                    <p className="mt-1 text-sm text-slate-500">Saved {product.saved}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-700">{product.status}</span>
                    <p className="text-lg font-bold text-slate-900">₹{product.price.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
