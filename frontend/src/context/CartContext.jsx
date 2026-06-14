import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  calculatePricing,
  DEFAULT_LOYALTY_POINTS,
} from "../utils/pricing";

const CartContext = createContext(null);
const STORAGE_KEY = "ecommerce_cart";
const COUPON_KEY = "ecommerce_coupon";
const POINTS_KEY = "ecommerce_points_used";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      return localStorage.getItem(COUPON_KEY) || "";
    } catch {
      return "";
    }
  });

  const [pointsUsed, setPointsUsed] = useState(() => {
    try {
      return parseInt(localStorage.getItem(POINTS_KEY) || "0", 10);
    } catch {
      return 0;
    }
  });

  const [couponMessage, setCouponMessage] = useState("");
  const [loyaltyPoints] = useState(DEFAULT_LOYALTY_POINTS);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (appliedCoupon) localStorage.setItem(COUPON_KEY, appliedCoupon);
    else localStorage.removeItem(COUPON_KEY);
  }, [appliedCoupon]);

  useEffect(() => {
    if (pointsUsed > 0) localStorage.setItem(POINTS_KEY, String(pointsUsed));
    else localStorage.removeItem(POINTS_KEY);
  }, [pointsUsed]);

  const addToCart = (product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);

      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          original_price: product.original_price,
          image_url: product.image_url,
          category: product.category,
          quantity,
        },
      ];
    });
  };

  const removeFromCart = (productId) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon("");
    setCouponMessage("");
    setPointsUsed(0);
  };

  const applyCoupon = (code) => {
    const normalized = code?.trim().toUpperCase();
    if (!normalized) {
      setAppliedCoupon("");
      setCouponMessage("");
      return { valid: false, message: "Enter a coupon code" };
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const result = calculatePricing(subtotal, normalized, pointsUsed);

    if (result.valid) {
      setAppliedCoupon(result.appliedCoupon);
      setCouponMessage(result.message || "Coupon applied!");
    } else {
      setAppliedCoupon("");
      setCouponMessage(result.message || "Invalid coupon");
    }

    return result;
  };

  const removeCoupon = () => {
    setAppliedCoupon("");
    setCouponMessage("");
  };

  const applyPoints = (points) => {
    const capped = Math.min(Math.max(0, points), loyaltyPoints);
    setPointsUsed(capped);
    return capped;
  };

  const cartCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const cartSubtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const productSavings = useMemo(
    () =>
      items.reduce((sum, item) => {
        if (item.original_price && item.original_price > item.price) {
          return sum + (item.original_price - item.price) * item.quantity;
        }
        return sum;
      }, 0),
    [items]
  );

  const pricing = useMemo(
    () => calculatePricing(cartSubtotal, appliedCoupon || null, pointsUsed),
    [cartSubtotal, appliedCoupon, pointsUsed]
  );

  const value = {
    items,
    cartCount,
    cartSubtotal,
    cartTotal: pricing.total,
    pricing,
    productSavings,
    appliedCoupon,
    couponMessage,
    pointsUsed,
    loyaltyPoints,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    applyCoupon,
    removeCoupon,
    applyPoints,
    setPointsUsed,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
