import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authenticatedFetch } from "../services/api";
import ProductCard from "../components/ProductCard";
import { useCart } from "../context/CartContext";

const CATEGORIES = [
  "All",
  "Electronics",
  "Fashion",
  "Groceries",
  "Books",
  "Home & Kitchen",
  "Beauty",
];

const PAGE_SIZE = 24;

export default function Products() {
  const [products, setProducts] = useState([]);
  const [totalLoaded, setTotalLoaded] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { cartCount } = useCart();

  const activeCategory = searchParams.get("category") || "All";
  const search = searchParams.get("search") || "";

  const goBack = () => {
    try {
      if (window.history.length > 1) navigate(-1);
      else navigate("/products");
    } catch (e) {
      navigate("/products");
    }
  };

  const goHome = () => navigate("/home");
  const goProducts = () => navigate("/products");

  const buildUrl = (offset) => {
    const params = new URLSearchParams();
    if (activeCategory !== "All") params.set("category", activeCategory);
    if (search) params.set("search", search);
    params.set("limit", String(PAGE_SIZE));
    params.set("offset", String(offset));
    return `http://localhost:8000/api/products?${params.toString()}`;
  };

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError("");
      setProducts([]);
      setTotalLoaded(0);
      setHasMore(true);

      try {
        const data = await authenticatedFetch(buildUrl(0), {}, navigate);
        const list = Array.isArray(data) ? data : [];
        setProducts(list);
        setTotalLoaded(list.length);
        setHasMore(list.length === PAGE_SIZE);
      } catch (err) {
        setError(err.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [activeCategory, search, navigate]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);

    try {
      const data = await authenticatedFetch(
        buildUrl(totalLoaded),
        {},
        navigate
      );
      const list = Array.isArray(data) ? data : [];
      setProducts((prev) => [...prev, ...list]);
      setTotalLoaded((prev) => prev + list.length);
      setHasMore(list.length === PAGE_SIZE);
    } catch (err) {
      setError(err.message || "Failed to load more products");
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <button
                onClick={goBack}
                className="flex transform items-center gap-3 rounded-full border border-violet-600 bg-white px-4 py-2 text-violet-600 transition hover:scale-105 hover:bg-violet-600 hover:text-white"
              >
                <span className="text-lg">←</span>
                <span className="font-medium">Back</span>
              </button>
              <nav
                className="ml-4 flex items-center gap-2 text-sm text-slate-500"
                aria-label="Breadcrumb"
              >
                <button
                  onClick={goHome}
                  className="cursor-pointer transition-colors hover:text-violet-600"
                >
                  🏠 Home
                </button>
                <span className="mx-2 text-slate-400">›</span>
                <button
                  onClick={goProducts}
                  className="cursor-pointer transition-colors hover:text-violet-600"
                >
                  Products
                </button>
              </nav>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Shop Products</h1>
            {!loading && products.length > 0 && (
              <p className="mt-1 text-sm text-slate-500">
                Showing {products.length}
                {hasMore ? "+" : ""} items
                {activeCategory !== "All" ? ` in ${activeCategory}` : ""}
              </p>
            )}
          </div>
          <Link
            to="/bag"
            className="rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Bag ({cartCount})
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 rounded-[2rem] bg-gradient-to-r from-violet-700 via-fuchsia-600 to-pink-500 p-6 text-white shadow-2xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-violet-200">Premium Picks</p>
              <h2 className="mt-3 text-3xl font-bold">Curated deals for faster savings</h2>
              <p className="mt-2 max-w-2xl text-sm text-violet-100">
                Discover handpicked products with express delivery, cashback offers, and Buy Together savings.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate("/wishlist")}
                className="rounded-full border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                View Wishlist
              </button>
              <button
                type="button"
                onClick={() => navigate("/group-orders")}
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-violet-900 transition hover:bg-violet-100"
              >
                Buy Together
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                if (category === "All") next.delete("category");
                else next.set("category", category);
                setSearchParams(next);
              }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeCategory === category
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-700 shadow"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {loading && (
          <div className="py-20 text-center text-lg text-slate-600">
            Loading products...
          </div>
        )}

        {error && (
          <div className="rounded-3xl bg-white p-8 text-center shadow-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="rounded-3xl bg-white p-8 text-center shadow-lg">
            <p className="text-slate-600">No products found.</p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-10 text-center">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="rounded-2xl bg-green-600 px-8 py-3 font-semibold text-white disabled:opacity-60"
                >
                  {loadingMore ? "Loading..." : "Load more products"}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
