import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { authenticatedFetch } from "../services/api";
import { useCart } from "../context/CartContext";
import { getDiscountPercent } from "../utils/pricing";
import ProductImage from "../components/ProductImage";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await authenticatedFetch(
          `http://localhost:8000/api/products/${id}`,
          {},
          navigate
        );
        setProduct(data);
      } catch (err) {
        setError(err.message || "Product not found");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, navigate]);

  const handleAddToBag = () => {
    if (!product) return;
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyTogether = () => {
    if (!product) return;
    navigate("/buy-together", { state: { product } });
  };

  const handleBuyNow = () => {
    if (!product) return;

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
            quantity,
          },
        ],
      },
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        Loading product...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
        <p className="text-red-600">{error || "Product not found"}</p>
        <Link to="/products" className="text-slate-900 underline">
          Back to products
        </Link>
      </div>
    );
  }

  const discount = getDiscountPercent(product.price, product.original_price);

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto grid max-w-6xl gap-8 rounded-3xl bg-white p-8 shadow-lg lg:grid-cols-2">
        <div className="relative">
          <ProductImage
            src={product.image_url}
            alt={product.name}
            category={product.category}
            className="h-[420px] w-full rounded-3xl object-cover"
          />
          {discount > 0 && (
            <span className="absolute left-4 top-4 rounded-xl bg-red-500 px-3 py-1 text-sm font-bold text-white">
              {discount}% OFF
            </span>
          )}
        </div>

        <div>
          <Link to="/products" className="text-sm text-slate-500">
            ← Back to products
          </Link>
          <p className="mt-4 text-sm font-medium uppercase tracking-wide text-slate-500">
            {product.category}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{product.name}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p className="text-3xl font-bold text-green-600">
              ₹{product.price.toLocaleString("en-IN")}
            </p>
            {product.original_price && product.original_price > product.price && (
              <>
                <p className="text-xl text-slate-400 line-through">
                  ₹{product.original_price.toLocaleString("en-IN")}
                </p>
                <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">
                  Save ₹{(product.original_price - product.price).toLocaleString("en-IN")}
                </span>
              </>
            )}
          </div>

          <p className="mt-4 text-slate-600">{product.description}</p>
          <p className="mt-4 text-sm text-slate-500">
            {product.stock} items in stock • ⚡ 8 min delivery
          </p>

          <div className="mt-6 flex items-center gap-3">
            <span className="text-sm font-medium text-slate-700">Quantity</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="h-10 w-10 rounded-xl border"
            >
              -
            </button>
            <span className="w-8 text-center font-semibold">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="h-10 w-10 rounded-xl border"
            >
              +
            </button>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={handleAddToBag}
              className={`flex-1 rounded-2xl py-3 font-semibold text-white transition ${
                added ? "bg-green-600" : "bg-slate-900 hover:bg-slate-800"
              }`}
            >
              {added ? "Added to Bag ✓" : "Add to Bag"}
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              className="flex-1 rounded-2xl border border-slate-300 py-3 font-semibold text-slate-900 hover:bg-slate-50"
            >
              Buy Now
            </button>
          </div>

          <button
            type="button"
            onClick={handleBuyTogether}
            className="mt-3 w-full rounded-2xl bg-violet-600 py-3 font-semibold text-white transition hover:bg-violet-700"
          >
            Buy Together
          </button>
          <p className="mt-2 text-sm text-slate-500">Share the invite once your group is ready.</p>

          <button
            type="button"
            onClick={() => navigate("/bag")}
            className="mt-3 w-full text-center text-sm font-medium text-green-600 hover:underline"
          >
            View Bag →
          </button>
        </div>
      </div>

    </div>
  );
}
