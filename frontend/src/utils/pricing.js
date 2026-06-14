export const DELIVERY_FEE = 29;
export const FREE_DELIVERY_MIN = 199;
export const POINTS_TO_RUPEE = 0.25;
export const MAX_POINTS_PERCENT = 0.2;
export const DEFAULT_LOYALTY_POINTS = 2450;

export const UPI_APPS = [
  { id: "gpay", label: "Google Pay", short: "GPay", color: "bg-white text-slate-900 border border-slate-200" },
  { id: "phonepe", label: "PhonePe", short: "Pe", color: "bg-purple-600 text-white" },
  { id: "paytm", label: "Paytm", short: "Pt", color: "bg-blue-500 text-white" },
  { id: "bhim", label: "BHIM UPI", short: "BH", color: "bg-green-700 text-white" },
  { id: "amazonpay", label: "Amazon Pay", short: "Am", color: "bg-slate-900 text-white" },
  { id: "cred", label: "CRED UPI", short: "Cr", color: "bg-black text-white" },
];

export const PAYMENT_METHODS = [
  { id: "upi", label: "UPI", icon: "📱", detail: "Pay with Google Pay, PhonePe, Paytm & more" },
  { id: "wallet", label: "Redeem from Wallet", icon: "👛", detail: "Use your GoServe wallet balance" },
  { id: "cod", label: "Cash on Delivery", icon: "💵", detail: "Pay when your order arrives" },
];

export const DEFAULT_WALLET_BALANCE = 500;

export const COUPONS = {
  SAVE10: {
    code: "SAVE10",
    description: "10% off on orders above ₹299",
    type: "percent",
    value: 10,
    minOrder: 299,
    maxDiscount: 500,
  },
  FLAT50: {
    code: "FLAT50",
    description: "Flat ₹50 off on orders above ₹199",
    type: "flat",
    value: 50,
    minOrder: 199,
  },
  GOSERVE20: {
    code: "GOSERVE20",
    description: "20% off — GoServe welcome offer",
    type: "percent",
    value: 20,
    minOrder: 499,
    maxDiscount: 800,
  },
  QUICK8: {
    code: "QUICK8",
    description: "₹80 off on 8-min express delivery",
    type: "flat",
    value: 80,
    minOrder: 399,
  },
  FREESHIP: {
    code: "FREESHIP",
    description: "Free delivery on orders above ₹149",
    type: "flat",
    value: 29,
    minOrder: 149,
  },
};

export function getDiscountPercent(price, originalPrice) {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

export function calculatePricing(subtotal, couponCode = null, pointsUsed = 0) {
  let deliveryFee = subtotal >= FREE_DELIVERY_MIN ? 0 : DELIVERY_FEE;
  let discount = 0;
  let appliedCoupon = null;
  let message = null;
  let valid = true;

  if (couponCode) {
    const coupon = COUPONS[couponCode.toUpperCase().trim()];
    if (!coupon) {
      return {
        subtotal,
        deliveryFee,
        discount: 0,
        pointsDiscount: 0,
        pointsUsed: 0,
        total: subtotal + deliveryFee,
        appliedCoupon: null,
        message: "Invalid coupon code",
        valid: false,
      };
    }

    if (subtotal < coupon.minOrder) {
      return {
        subtotal,
        deliveryFee,
        discount: 0,
        pointsDiscount: 0,
        pointsUsed: 0,
        total: subtotal + deliveryFee,
        appliedCoupon: null,
        message: `Minimum order ₹${coupon.minOrder} required`,
        valid: false,
      };
    }

    if (coupon.type === "percent") {
      discount = subtotal * (coupon.value / 100);
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else if (coupon.code === "FREESHIP") {
      deliveryFee = 0;
      discount = subtotal < FREE_DELIVERY_MIN ? DELIVERY_FEE : 0;
    } else {
      discount = coupon.value;
    }

    discount = Math.min(discount, subtotal);
    appliedCoupon = coupon.code;
    message = coupon.description;
  }

  let pointsDiscount = 0;
  let actualPointsUsed = 0;
  if (pointsUsed > 0) {
    const maxPointsValue = subtotal * MAX_POINTS_PERCENT;
    pointsDiscount = Math.min(pointsUsed * POINTS_TO_RUPEE, maxPointsValue);
    pointsDiscount = Math.min(pointsDiscount, subtotal - discount);
    actualPointsUsed = Math.ceil(pointsDiscount / POINTS_TO_RUPEE);
  }

  const total = Math.max(subtotal + deliveryFee - discount - pointsDiscount, 0);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    deliveryFee: Math.round(deliveryFee * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    pointsDiscount: Math.round(pointsDiscount * 100) / 100,
    pointsUsed: actualPointsUsed,
    total: Math.round(total * 100) / 100,
    appliedCoupon,
    message,
    valid: couponCode ? appliedCoupon !== null : true,
  };
}

export function getMaxRedeemablePoints(subtotal, couponCode, availablePoints) {
  const base = calculatePricing(subtotal, couponCode, 0);
  const maxValue = subtotal * MAX_POINTS_PERCENT;
  const maxByOrder = Math.floor(maxValue / POINTS_TO_RUPEE);
  return Math.min(availablePoints, maxByOrder);
}
