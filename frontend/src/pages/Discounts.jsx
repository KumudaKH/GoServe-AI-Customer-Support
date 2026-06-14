import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authenticatedFetch } from "../services/api";
import ProductCard from "../components/ProductCard";

const discountLevels = [10, 20, 30, 50, 70];

export default function Discounts() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState(10);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await authenticatedFetch("http://localhost:8000/api/products?limit=50", {}, navigate);
        setProducts(Array.isArray(data) ? data : []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  const filteredProducts = products.filter((product) => {
    const discount = Math.round(((product.original_price || product.price) - product.price) / (product.original_price || product.price) * 100);
    return discount >= activeFilter;
  });

  return (
    <div className="min-h-screen bg-[#F7F3FF] p-6 pb-28">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[2rem] bg-gradient-to-r from-violet-700 to-fuchsia-600 p-8 text-white shadow-2xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold">Today's Discounts</h1>
              <p className="mt-3 max-w-2xl text-sm text-violet-100">Browse top deals sorted by the biggest markdowns.</p>
            </div>
            <button
              onClick={() => navigate("/products")}
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-violet-900 transition hover:bg-violet-100"
            >
              Browse all products
            </button>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-lg border border-slate-200">
          <p className="text-sm uppercase tracking-[0.28em] text-violet-600">Filters</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {discountLevels.map((level) => (
              <button
                key={level}
                onClick={() => setActiveFilter(level)}
                className={`rounded-full px-4 py-3 text-sm font-semibold transition ${
                  activeFilter === level
                    ? "bg-violet-700 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-violet-50"
                }`}
              >
                {level}%+
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            <div className="col-span-full rounded-[2rem] bg-slate-100 p-10 text-center text-slate-500 shadow-lg">Loading discounted products…</div>
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full rounded-[2rem] bg-slate-100 p-10 text-center text-slate-500 shadow-lg">No products found for this discount filter.</div>
          ) : (
            filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
