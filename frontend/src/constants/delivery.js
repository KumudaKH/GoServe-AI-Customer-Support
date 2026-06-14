export const DELIVERY_SLOTS = [
  { id: "express-8", label: "Express — 8 mins", eta: "8 min", express: true },
  { id: "slot-15", label: "In 15 minutes", eta: "15 min", express: false },
  { id: "slot-30", label: "In 30 minutes", eta: "30 min", express: false },
  { id: "slot-60", label: "In 1 hour", eta: "60 min", express: false },
];

export const HERO_BANNERS = [
  {
    title: "Groceries in 8 minutes",
    subtitle: "Fresh fruits, snacks & daily essentials",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80",
    cta: "Shop Groceries",
    category: "Groceries",
  },
  {
    title: "Electronics Flash Sale",
    subtitle: "Up to 40% off — limited time",
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&q=80",
    cta: "Grab Deals",
    category: "Electronics",
  },
  {
    title: "Beauty & Personal Care",
    subtitle: "Delivered before your coffee gets cold",
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1200&q=80",
    cta: "Shop Beauty",
    category: "Beauty",
  },
];

export const QUICK_CATEGORIES = [
  {
    name: "Groceries",
    emoji: "🥬",
    color: "bg-gradient-to-br from-emerald-100 via-lime-100 to-emerald-50",
  },
  {
    name: "Electronics",
    emoji: "📱",
    color: "bg-gradient-to-br from-sky-100 via-blue-100 to-cyan-100",
  },
  {
    name: "Fashion",
    emoji: "👕",
    color: "bg-gradient-to-br from-pink-100 via-rose-100 to-fuchsia-100",
  },
  {
    name: "Beauty",
    emoji: "💄",
    color: "bg-gradient-to-br from-violet-100 via-fuchsia-100 to-pink-100",
  },
  {
    name: "Home & Kitchen",
    emoji: "🏠",
    color: "bg-gradient-to-br from-orange-100 via-amber-100 to-amber-50",
  },
  {
    name: "Books",
    emoji: "📚",
    color: "bg-gradient-to-br from-yellow-100 via-amber-100 to-amber-50",
  },
];
