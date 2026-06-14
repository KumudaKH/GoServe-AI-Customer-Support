const CATEGORY_COLORS = {
  Electronics: "6366f1",
  Fashion: "ec4899",
  Groceries: "22c55e",
  Books: "f59e0b",
  "Home & Kitchen": "f97316",
  Beauty: "a855f7",
};

const BROKEN_IMAGE_HOSTS = ["source.unsplash.com", "via.placeholder.com"];

function isBrokenImageUrl(url) {
  return !url || BROKEN_IMAGE_HOSTS.some((host) => url.includes(host));
}

export function getFallbackImage(category = "Product", name = "") {
  const color = CATEGORY_COLORS[category] || "64748b";
  const label = encodeURIComponent((name || category).slice(0, 18));
  return `https://placehold.co/400x300/${color}/ffffff?text=${label}`;
}

export function getProductImage(url, category, name) {
  if (isBrokenImageUrl(url)) {
    return getFallbackImage(category, name);
  }
  return url;
}

export function handleProductImageError(event, category, name) {
  event.currentTarget.onerror = null;
  event.currentTarget.src = getFallbackImage(category, name);
}
