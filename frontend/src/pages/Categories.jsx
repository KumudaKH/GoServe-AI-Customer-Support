import { Link } from "react-router-dom";

const CATEGORIES = [
  "Electronics",
  "Fashion",
  "Groceries",
  "Books",
  "Home & Kitchen",
  "Beauty",
];

export default function Categories() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">Categories</h1>
        <p className="mb-8 text-slate-600">
          Browse all categories and discover products.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {CATEGORIES.map((category) => (
            <Link
              key={category}
              to={`/products?category=${encodeURIComponent(category)}`}
              className="rounded-2xl border border-slate-200 p-5 font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              {category}
            </Link>
          ))}
        </div>

        <Link
          to="/products"
          className="mt-8 inline-block rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white"
        >
          View All Products
        </Link>
      </div>
    </div>
  );
}
