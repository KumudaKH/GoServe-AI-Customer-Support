import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { getDiscountPercent } from "../utils/pricing";
import ProductImage from "./ProductImage";

export default function ProductCard({ product, compact = false }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const discount = getDiscountPercent(product.price, product.original_price);

  const handleAddToBag = (e) => {
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyTogether = (e) => {
    e.stopPropagation();
    navigate("/buy-together", { state: { product } });
  };

  const handleBookNow = (e) => {
    e.stopPropagation();
    navigate("/checkout", {
      state: {
        items: [
          {
            id: product.id,
            name: product.name,
            price: product.price,
            original_price: product.original_price,
            image_url: product.image_url,
            category: product.category,
            quantity: 1,
          },
        ],
      },
    });
  };

  return (
    <div
      className={`rounded-3xl bg-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => navigate(`/products/${product.id}`)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            navigate(`/products/${product.id}`);
          }
        }}
        className="relative w-full cursor-pointer text-left"
      >
        <div className="relative">
          <ProductImage
            src={product.image_url}
            alt={product.name}
            category={product.category}
            className={`w-full rounded-2xl object-cover ${
              compact ? "h-36" : "h-48"
            }`}
          />
          {discount > 0 && (
            <span className="absolute left-2 top-2 rounded-lg bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
              {discount}% OFF
            </span>
          )}
        </div>
        <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          {product.category}
        </p>
        <h3
          className={`mt-1 line-clamp-2 font-semibold text-slate-900 ${
            compact ? "text-sm" : "text-lg"
          }`}
        >
          {product.name}
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <p className="text-xl font-bold text-green-600">
            ₹{product.price.toLocaleString("en-IN")}
          </p>
          {product.original_price && product.original_price > product.price && (
            <p className="text-sm text-slate-400 line-through">
              ₹{product.original_price.toLocaleString("en-IN")}
            </p>
          )}
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
            8 MIN
          </span>
        </div>
      </div>

      <div className={`flex flex-col gap-2 ${compact ? "mt-3" : "mt-4"}`}>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleAddToBag}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition ${
              added
                ? "bg-green-600"
                : "bg-slate-900 hover:bg-slate-800"
            }`}
          >
            {added ? "Added ✓" : "Add to Bag"}
          </button>
          {!compact && (
            <button
              type="button"
              onClick={handleBookNow}
              className="flex-1 rounded-xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              Buy Now
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={handleBuyTogether}
          className="w-full rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
        >
          Buy Together
        </button>
        <p className="mt-2 text-xs text-slate-500">Invite friends with a quick share link.</p>
      </div>

    </div>
  );
}
