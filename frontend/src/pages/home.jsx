
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DeliverToCard from "../components/DeliverToCard";
import {
  ArchiveBoxIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  TagIcon,
  TruckIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  BellIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/solid";
import { useCart } from "../context/CartContext";
import { authenticatedFetch } from "../services/api";
import { HERO_BANNERS, QUICK_CATEGORIES } from "../constants/delivery";
import ProductCard from "../components/ProductCard";

const ServiceCard = ({ icon, title, subtitle, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full rounded-3xl bg-white p-7 text-left shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
  >
    <div className="flex items-center gap-5">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
      </div>
    </div>
  </button>
);

export default function Home() {
  const navigate = useNavigate();
  const [invites, setInvites] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const drawerRef = useRef(null);
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "English"
  );
  const [wishlistCount] = useState(3);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [productsByCategory, setProductsByCategory] = useState({});
  const { cartCount } = useCart();
  const location = useLocation();
  const [userProfile, setUserProfile] = useState(null);
  const [locationStatus, setLocationStatus] = useState(""); // "success", "loading", ""
  const [isLocating, setIsLocating] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [locationErrorMessage, setLocationErrorMessage] = useState("");
  const [addressLookupLoading, setAddressLookupLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [mapCenter, setMapCenter] = useState(null);
  const [currentGpsLocation, setCurrentGpsLocation] = useState(null);
  const [pickerLoading, setPickerLoading] = useState(false);
  const reverseDebounceRef = useRef(null);
  const hasInitializedLocation = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIndex((i) => (i + 1) % HERO_BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const grouped = {};
        await Promise.all(
          QUICK_CATEGORIES.map(async (cat) => {
            const data = await authenticatedFetch(
              `http://localhost:8000/api/products?category=${encodeURIComponent(cat.name)}&limit=8`,
              {},
              navigate
            );
            grouped[cat.name] = Array.isArray(data) ? data : [];
          })
        );
        setProductsByCategory(grouped);
      } catch {
        setProductsByCategory({});
      }
    };
    loadProducts();
  }, [navigate]);

  const activeBanner = HERO_BANNERS[bannerIndex];

  const recommendedProducts = Object.values(productsByCategory)
    .flat()
    .slice(0, 4);

  const aiPrompts = [
    { query: "Best phone under ₹20000", label: "Best phone under ₹20000" },
    { query: "Healthy breakfast items", label: "Healthy breakfast items" },
    { query: "Gift suggestions", label: "Gift suggestions" },
    { query: "Cheapest products", label: "Cheapest products" },
    { query: "Best deals today", label: "Best deals today" },
  ];

  const renderCategoryIcon = (category) => {
    const base = "h-10 w-10 text-slate-900";
    switch (category) {
      case "Groceries":
        return (
          <svg viewBox="0 0 48 48" className={base} fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 24h20l-3 16H17l-3-16Z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M17 24v-6c0-3 2-5 4-5h6c2 0 4 2 4 5v6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20 18c0-2 1.5-4 4-4s4 2 4 4" strokeLinecap="round" />
            <path d="M19 14l-2-4M29 14l2-4" strokeLinecap="round" />
          </svg>
        );
      case "Electronics":
        return (
          <svg viewBox="0 0 48 48" className={base} fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="10" y="12" width="12" height="24" rx="3" strokeLinecap="round" />
            <path d="M16 38h0" strokeLinecap="round" />
            <rect x="26" y="14" width="12" height="16" rx="2" strokeLinecap="round" />
            <path d="M29 32h6" strokeLinecap="round" />
            <path d="M24 10h14l4 6H24" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case "Fashion":
        return (
          <svg viewBox="0 0 48 48" className={base} fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M24 10c3 0 5 2 5 5v5l4 8H15l4-8v-5c0-3 2-5 5-5Z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M19 15c0-2 1.5-4 5-4s5 2 5 4" strokeLinecap="round" />
            <path d="M24 8v4" strokeLinecap="round" />
          </svg>
        );
      case "Beauty":
        return (
          <svg viewBox="0 0 48 48" className={base} fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="16" y="14" width="16" height="20" rx="4" strokeLinecap="round" />
            <path d="M20 10h8v6H20z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M24 34v4" strokeLinecap="round" />
            <path d="M18 20h12" strokeLinecap="round" />
          </svg>
        );
      case "Home & Kitchen":
        return (
          <svg viewBox="0 0 48 48" className={base} fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 24h24v12a4 4 0 0 1-4 4H16a4 4 0 0 1-4-4V24Z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 24V18a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20 14v-4h8v4" strokeLinecap="round" />
            <path d="M30 30h4" strokeLinecap="round" />
          </svg>
        );
      case "Books":
        return (
          <svg viewBox="0 0 48 48" className={base} fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 12h12v24H10a2 2 0 0 1-2-2V14a2 2 0 0 1 2-2Z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M26 12h12v24H26a2 2 0 0 1-2-2V14a2 2 0 0 1 2-2Z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 14.5c4-1.5 8-1.5 12 0" strokeLinecap="round" />
            <path d="M22 30.5c4-1.5 8-1.5 12 0" strokeLinecap="round" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 48 48" className={base} fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="12" y="12" width="24" height="24" rx="8" />
          </svg>
        );
    }
  };

  const categories = [
    "Electronics",
    "Fashion",
    "Groceries",
    "Mobiles",
    "Home & Kitchen",
    "Beauty",
    "Sports",
    "Books",
    "Toys",
    "Healthcare",
    "Accessories",
    "View All Categories",
  ];

  const offersMenu = [
    "Flash Sale",
    "Buy 1 Get 1",
    "Limited Time Offer",
    "Trending Products",
  ];

  const discountsMenu = [
    "Up to 80% Off",
    "Electronics Sale",
    "Fashion Sale",
    "Grocery Deals",
  ];

  const cashbackMenu = [
    "Cashback Wallet Balance",
    "Active Cashback Offers",
    "Cashback History",
  ];

  const dealsMenu = [
    "Best Deals",
    "Combo Deals",
    "Group Deals",
    "Recommended Deals",
  ];

  const languageOptions = [
    "English",
    "Kannada",
    "Hindi",
    "Tamil",
    "Telugu",
    "Malayalam",
  ];

  const menuItems = [
    {
      label: "Categories",
      emoji: "🛍",
      key: "categories",
      path: "/categories",
      dropdown: categories,
      type: "mega",
    },
    {
      label: "Today's Offers",
      emoji: "🔥",
      key: "offers",
      path: "/offers",
      dropdown: offersMenu,
    },
    {
      label: "Today's Discounts",
      emoji: "💸",
      key: "discounts",
      path: "/discounts",
      dropdown: discountsMenu,
    },
    {
      label: "Cashback",
      emoji: "💰",
      key: "cashback",
      path: "/cashback",
      dropdown: cashbackMenu,
    },
    {
      label: "Deals",
      emoji: "🎯",
      key: "deals",
      path: "/deals",
      dropdown: dealsMenu,
    },
    {
      label: "AI Shopping Assistant ⭐ NEW",
      emoji: "🤖",
      key: "ai-assistant",
      path: "/ai-shopping",
    },
    {
      label: "Smart Cart Saver ⭐ NEW",
      emoji: "🛒",
      key: "smart-saver",
      path: "/bag?highlight=cart-saver",
    },
    {
      label: "Wishlist",
      emoji: "❤️",
      key: "wishlist",
      path: "/wishlist",
      badge: wishlistCount,
    },
    {
      label: "Vouchers",
      emoji: "🎁",
      key: "vouchers",
      path: "/vouchers",
    },
    {
      label: "Loyalty Points",
      emoji: "⭐",
      key: "loyalty",
      path: "/loyalty",
    },
    {
      label: "Language",
      emoji: "🌐",
      key: "language",
      path: "/language",
      dropdown: languageOptions,
      type: "language",
    },
  ];

  const isActive = (path) => {
    const normalizedPath = path.split("?")[0];

    if (normalizedPath === "/home") {
      return location.pathname === "/" || location.pathname === "/home";
    }

    return (
      location.pathname === normalizedPath ||
      location.pathname.startsWith(`${normalizedPath}/`)
    );
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await authenticatedFetch("/api/group/invitations");
        setInvites(res?.count || 0);
      } catch (e) {
        setInvites(0);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await authenticatedFetch("/api/profile", {}, navigate);
        setUserProfile(profile);
      } catch (e) {
        console.warn("Could not load profile:", e.message);
      }
    };
    loadProfile();
  }, [navigate]);

  useEffect(() => {
    if (!selectedLocation && userProfile?.latitude && userProfile?.longitude) {
      const coord = {
        lat: Number(userProfile.latitude),
        lng: Number(userProfile.longitude),
      };
      setSelectedLocation(coord);
      setMapCenter(coord);
      setSelectedAddress(userProfile.address || "");
    }
  }, [userProfile, selectedLocation]);

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const reverseGeocode = async (lat, lng) => {
    try {
      setAddressLookupLoading(true);
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=en`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Reverse geocoding failed");
      }
      const data = await response.json();
      return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
      console.error("Reverse geocode error:", error);
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } finally {
      setAddressLookupLoading(false);
    }
  };

  const getSavedOrFallbackLocation = () => {
    if (currentGpsLocation) return currentGpsLocation;
    if (selectedLocation) return selectedLocation;
    if (userProfile?.latitude && userProfile?.longitude) {
      return {
        lat: Number(userProfile.latitude),
        lng: Number(userProfile.longitude),
      };
    }
    return { lat: 12.9715987, lng: 77.5945627 };
  };

  const initializeLocationPicker = async () => {
    if (hasInitializedLocation.current) return;
    hasInitializedLocation.current = true;
    setPickerLoading(true);
    setIsLocating(true);
    setLocationErrorMessage("");

    if (!navigator.geolocation) {
      const fallbackCenter = getSavedOrFallbackLocation();
      setMapCenter(fallbackCenter);
      setSelectedLocation(fallbackCenter);
      setSelectedAddress(userProfile?.address || "Unable to access location");
      setPickerLoading(false);
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCurrentGpsLocation(coords);
        setMapCenter(coords);
        setSelectedLocation(coords);
        try {
          const address = await reverseGeocode(coords.lat, coords.lng);
          setSelectedAddress(address);
        } catch (error) {
          console.error(error);
          setSelectedAddress(userProfile?.address || "Live location");
        }
        setPickerLoading(false);
        setIsLocating(false);
      },
      (error) => {
        let message = "Unable to access your location. Please enable location permission.";
        if (error.code === 1) {
          message = "Location permission denied. Please enable it in your browser settings.";
        } else if (error.code === 2) {
          message = "Location not available. Please try again.";
        } else if (error.code === 3) {
          message = "Location request timed out. Please try again.";
        }

        const fallbackCenter = getSavedOrFallbackLocation();
        setMapCenter(fallbackCenter);
        setSelectedLocation(fallbackCenter);
        setSelectedAddress(userProfile?.address || "Unable to resolve location");
        setLocationErrorMessage(message);
        setPickerLoading(false);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const handleOpenLocationPicker = () => {
    navigate("/select-location");
  };

  const handleUseLiveLocation = () => {
    navigate("/select-location?mode=live");
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLocationErrorMessage(
        "Unable to access your location. Please enable location permission."
      );
      return;
    }

    setPickerLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCurrentGpsLocation(coords);
        setMapCenter(coords);
        setSelectedLocation(coords);

        const address = await reverseGeocode(coords.lat, coords.lng);
        setSelectedAddress(address);
        setPickerLoading(false);
      },
      (error) => {
        let message = "Unable to access your location. Please enable location permission.";
        if (error.code === 1) {
          message = "Location permission denied. Please enable it in your browser settings.";
        } else if (error.code === 2) {
          message = "Location not available. Please try again.";
        } else if (error.code === 3) {
          message = "Location request timed out. Please try again.";
        }
        setLocationErrorMessage(message);
        setPickerLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const handleSearchAddress = async (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setPickerLoading(true);
    setSearchResults([]);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
        query
      )}&addressdetails=1&limit=5`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Search failed");
      }
      const results = await response.json();
      if (Array.isArray(results)) {
        setSearchResults(results);
        if (results.length === 1) {
          const result = results[0];
          const coords = { lat: Number(result.lat), lng: Number(result.lon) };
          setMapCenter(coords);
          setSelectedLocation(coords);
          setSelectedAddress(result.display_name || query);
          setSearchResults([]);
        }
      }
    } catch (error) {
      console.error("Address search error:", error);
    } finally {
      setPickerLoading(false);
    }
  };

  const handleSelectSearchResult = async (result) => {
    if (!result) return;
    const coords = { lat: Number(result.lat), lng: Number(result.lon) };
    setMapCenter(coords);
    setSelectedLocation(coords);
    setSelectedAddress(result.display_name || searchQuery);
    setSearchResults([]);
    setSearchQuery(result.display_name || "");
  };

  const handleChangeAddress = () => {
    navigate("/select-location");
  };

  const handleMapCenterChange = (center) => {
    setMapCenter(center);
    setSelectedLocation(center);
    setSelectedAddress("Finding address...");

    if (reverseDebounceRef.current) {
      clearTimeout(reverseDebounceRef.current);
    }
    reverseDebounceRef.current = setTimeout(async () => {
      const address = await reverseGeocode(center.lat, center.lng);
      setSelectedAddress(address);
    }, 250);
  };

  const handleConfirmLocation = async () => {
    if (!selectedLocation || !selectedAddress || selectedAddress === "Finding address...") return;
    try {
      const result = await authenticatedFetch(
        "/api/profile",
        {
          method: "PATCH",
          body: JSON.stringify({
            address: selectedAddress,
            latitude: selectedLocation.lat,
            longitude: selectedLocation.lng,
          }),
        },
        navigate
      );

      if (result?.success) {
        setUserProfile((prev) => ({
          ...prev,
          address: selectedAddress,
          latitude: selectedLocation.lat,
          longitude: selectedLocation.lng,
        }));
        localStorage.setItem("delivery_address", selectedAddress);
        localStorage.setItem("delivery_latitude", String(selectedLocation.lat));
        localStorage.setItem("delivery_longitude", String(selectedLocation.lng));
        setLocationStatus("success");
        setTimeout(() => setLocationStatus(""), 2500);
      }
    } catch (error) {
      console.error("Save location failed:", error);
      alert("Could not save location. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("language");

    navigate("/login");
  };

  const handleNavigate = (path) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  useEffect(() => {
    initializeLocationPicker();
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    const handleClickOutside = (event) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className="min-h-screen bg-[#F3F3F3] pb-28 text-slate-900">
      <header className="bg-black text-white shadow-[0_18px_80px_-36px_rgba(0,0,0,0.45)]">
        <div className="mx-auto max-w-7xl px-5 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between relative">
            <div className="flex items-center gap-6">
              <button
                ref={menuButtonRef}
                type="button"
                title="Menu"
                onClick={() => setIsMenuOpen((current) => !current)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition-all duration-200 hover:bg-violet-600/20"
              >
                <span className="text-[1.3rem] leading-none">☰</span>
              </button>

              <div className="text-4xl font-semibold tracking-tight">GoServe</div>
              <div className="hidden lg:block h-8 w-px bg-white/20" />
            </div>

            <div
              className={`fixed inset-0 z-40 transition-opacity duration-300 ${
                isMenuOpen ? "visible opacity-100" : "invisible opacity-0"
              }`}
              aria-hidden={!isMenuOpen}
            >
              <div className="absolute inset-0 bg-black/50" />
            </div>

            <div
              ref={drawerRef}
              className={`fixed left-0 top-0 z-50 h-full w-[320px] max-w-[85vw] transform overflow-hidden bg-slate-950/95 shadow-2xl backdrop-blur-xl transition-transform duration-300 ${
                isMenuOpen ? "translate-x-0" : "-translate-x-full"
              }`}
              role="dialog"
              aria-modal="true"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.28em] text-slate-400">
                    Menu
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-white">
                    GoServe
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-200 hover:bg-white/20"
                  aria-label="Close menu"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-2 px-3 py-4">
                {menuItems.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleNavigate(item.path)}
                    className={`flex w-full items-center gap-3 rounded-3xl px-4 py-4 text-left text-sm font-medium text-white transition-all duration-200 ${
                      isActive(item.path)
                        ? "bg-violet-600/60"
                        : "hover:bg-violet-600/40"
                    }`}
                    style={{ cursor: "pointer" }}
                  >
                    <span className="text-xl">{item.emoji}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                className={`rounded-3xl p-3 ${isActive('/notifications') ? 'bg-white/20 ring-1 ring-white/30' : 'bg-white/10'} hover:scale-[1.03] hover:shadow-xl transition-all duration-200`}
                title="Notifications"
                onClick={() => handleNavigate('/notifications')}
              >
                <BellIcon className="h-8 w-8 text-white" />
              </button>

              <button
                className={`rounded-full p-3 ${isActive('/group-orders') ? 'bg-white/20 ring-1 ring-white/30' : 'bg-white/10'} hover:scale-[1.03] hover:shadow-xl transition-all duration-200`}
                title="Buy Together"
                onClick={() => handleNavigate('/group-orders')}
              >
                <div className="relative">
                  <UserGroupIcon className="h-8 w-8 text-white" />
                  {invites > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold leading-none text-white bg-red-600 rounded-full">
                      {invites}
                    </span>
                  )}
                </div>
              </button>

              <button
                className={`rounded-3xl p-3 ${isActive('/bag') ? 'bg-white/20 ring-1 ring-white/30' : 'bg-white/10'} hover:scale-[1.03] hover:shadow-xl transition-all duration-200`}
                title="My Bag"
                onClick={() => handleNavigate('/bag')}
              >
                <div className="relative">
                  <ShoppingBagIcon className="h-8 w-8 text-white" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold leading-none text-white bg-red-600 rounded-full">
                      {cartCount}
                    </span>
                  )}
                </div>
              </button>

              <button
                className={`rounded-3xl p-3 ${isActive('/chat') ? 'bg-violet-600 text-white' : 'bg-white/10 text-white'} hover:scale-[1.03] hover:shadow-xl transition-all duration-200`}
                title="AI Support"
                onClick={() => handleNavigate('/chat')}
              >
                <ChatBubbleLeftRightIcon className="h-8 w-8" />
              </button>

              <button
                className={`rounded-3xl p-3 ${isActive('/profile') ? 'bg-white/20 ring-1 ring-white/30' : 'bg-white/10'} hover:scale-[1.03] hover:shadow-xl transition-all duration-200`}
                title="Profile"
                onClick={() => handleNavigate('/profile')}
              >
                <UserIcon className="h-8 w-8 text-white" />
              </button>

              <button
                onClick={handleLogout}
                className="ml-2 rounded-2xl bg-red-600 px-3 py-2 text-sm font-semibold hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 pt-6">
        <style>{`
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.6); }
            50% { box-shadow: 0 0 0 10px rgba(168, 85, 247, 0); }
          }
          .animate-pulse-glow {
            animation: pulse-glow 2.2s infinite;
          }
        `}</style>

        {/* Deliver To Section with QuickServe */}
        <div className="flex items-center justify-between gap-4">
          {/* Compact Premium Delivery Card */}
          <div className="flex-1">
            <DeliverToCard
              userProfile={userProfile}
              locationStatus={locationStatus}
              isLocating={isLocating}
              locationErrorMessage={locationErrorMessage}
              onOpenLocationPicker={handleOpenLocationPicker}
              onUseLiveLocation={handleUseLiveLocation}
              onChangeAddress={handleChangeAddress}
            />
          </div>

          {/* QuickServe Badge */}
          <div className="hidden md:flex items-center justify-end flex-shrink-0">
            <div className="animate-pulse-glow rounded-[16px] bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 px-4 py-3 shadow-lg shadow-pink-500/20">
              <div className="flex flex-col items-center justify-center text-center gap-1 min-w-[150px]">
                <div className="text-[10px] font-semibold uppercase tracking-[0.32em] text-white/80">QuickServe</div>
                <div className="flex items-end gap-1">
                  <span className="text-2xl font-extrabold text-yellow-300">8</span>
                  <span className="pb-1 text-sm font-semibold text-white">MIN</span>
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/80">
                  Lightning Fast
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location Picker Panel */}

        <div
          className="mt-4 cursor-pointer rounded-full bg-white px-6 py-4 shadow-lg flex items-center gap-4"
          onClick={() => navigate("/search")}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <MagnifyingGlassIcon className="h-6 w-6 text-slate-500" />
          </div>
          <input
            readOnly
            className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
            placeholder="Search milk, snacks, electronics..."
            onFocus={() => navigate("/search")}
          />
        </div>

        <section className="relative mt-6 overflow-hidden rounded-[32px] shadow-2xl">
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-700"
            style={{ backgroundImage: `url(${activeBanner.image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-transparent" />
          <div className="relative p-8 md:p-12 lg:p-14">
            <span className="inline-block rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white">
              EXPRESS DELIVERY
            </span>
            <h2 className="mt-4 max-w-lg text-3xl font-bold text-white md:text-5xl">
              {activeBanner.title}
            </h2>
            <p className="mt-3 max-w-md text-lg text-white/90">
              {activeBanner.subtitle}
            </p>
            <button
              type="button"
              onClick={() =>
                navigate(`/products?category=${encodeURIComponent(activeBanner.category)}`)
              }
              className="mt-6 rounded-2xl bg-white px-6 py-3 font-bold text-green-700 transition hover:bg-green-50"
            >
              {activeBanner.cta} →
            </button>
            <div className="mt-6 flex gap-2">
              {HERO_BANNERS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setBannerIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === bannerIndex ? "w-8 bg-white" : "w-2 bg-white/50"
                  }`}
                  aria-label={`Banner ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6">
          <h3 className="mb-3 text-lg font-bold text-slate-900">Shop by Category</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {QUICK_CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                type="button"
                onClick={() =>
                  navigate(`/products?category=${encodeURIComponent(cat.name)}`)
                }
                className={`flex min-w-[96px] min-h-[96px] flex-col items-center justify-center gap-3 rounded-[18px] ${cat.color} p-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer`}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-[16px] bg-white/85 shadow-sm">
                  {renderCategoryIcon(cat.name)}
                </div>
                <span className="text-center text-[11px] font-semibold text-slate-900">
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </section>
        <section
          onClick={() => navigate("/vouchers")}
          className="mt-6 cursor-pointer rounded-3xl border-2 border-dashed border-green-400 bg-green-50 p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-green-800">🎁 Coupons & Vouchers</p>
              <p className="text-sm text-green-700">SAVE10 • FLAT50 • QUICK8 — tap to apply</p>
            </div>
            <span className="text-2xl">→</span>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <button
            type="button"
            onClick={() => navigate("/history")}
            className="rounded-[30px] bg-white p-5 text-left shadow-lg transition hover:-translate-y-0.5 hover:shadow-2xl"
          >
            <p className="text-sm uppercase tracking-[0.32em] text-slate-500">Order insights</p>
            <h3 className="mt-3 text-lg font-bold text-slate-900">History</h3>
            <p className="mt-2 text-sm text-slate-600">Track past orders, delivery performance and premium reorder ideas.</p>
          </button>
          <button
            type="button"
            onClick={() => navigate("/payments")}
            className="rounded-[30px] bg-white p-5 text-left shadow-lg transition hover:-translate-y-0.5 hover:shadow-2xl"
          >
            <p className="text-sm uppercase tracking-[0.32em] text-slate-500">Payments</p>
            <h3 className="mt-3 text-lg font-bold text-slate-900">Wallet & cards</h3>
            <p className="mt-2 text-sm text-slate-600">Manage saved methods and choose the fastest checkout option.</p>
          </button>
          <button
            type="button"
            onClick={() => navigate("/group-orders")}
            className="rounded-[30px] bg-white p-5 text-left shadow-lg transition hover:-translate-y-0.5 hover:shadow-2xl"
          >
            <p className="text-sm uppercase tracking-[0.32em] text-slate-500">Buy together</p>
            <h3 className="mt-3 text-lg font-bold text-slate-900">Group savings</h3>
            <p className="mt-2 text-sm text-slate-600">Join shared buys, invite friends and unlock better pricing.</p>
          </button>
        </section>

        {QUICK_CATEGORIES.map((cat) => {
          const products = productsByCategory[cat.name] || [];
          if (products.length === 0) return null;
          return (
            <section key={cat.name} className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">
                  {cat.emoji} {cat.name}
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/products?category=${encodeURIComponent(cat.name)}`)
                  }
                  className="text-sm font-semibold text-green-600 hover:underline"
                >
                  View all →
                </button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {products.map((product) => (
                  <div key={product.id} className="min-w-[200px] max-w-[220px] flex-shrink-0">
                    <ProductCard product={product} compact />
                  </div>
                ))}
              </div>
            </section>
          );
        })}

      </main>
      <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/95 backdrop-blur-xl shadow-[0_-20px_50px_-30px_rgba(15,23,42,0.18)]">
        <div className="mx-auto grid max-w-7xl grid-cols-6 gap-2 px-5 py-4">
          <button
            type="button"
            onClick={() => navigate("/home")}
            className={`flex flex-col items-center gap-1 transition-all duration-200 ease-out ${isActive("/home") ? "text-violet-600" : "text-slate-900 hover:text-violet-600"}`}
          >
            <HomeIcon className="h-8 w-8" />
            <span className="text-[12px] font-semibold">Home</span>
            {isActive('/home') && <div className="mt-1 h-1 w-6 rounded-full bg-violet-600 transition-all" />}
          </button>

          <button
            type="button"
            onClick={() => navigate("/search")}
            className={`flex flex-col items-center gap-1 transition-all ${isActive("/search") ? "text-violet-600" : "text-gray-900"}`}
          >
            <MagnifyingGlassIcon className="h-8 w-8" />
            <span className="text-[12px] font-semibold">Search</span>
            {isActive('/search') && <div className="mt-1 h-1 w-6 rounded-full bg-violet-600 transition-all" />}
          </button>

          <button
            type="button"
            onClick={() => navigate("/track")}
            className={`flex flex-col items-center gap-1 transition-all ${isActive("/track") ? "text-violet-600" : "text-gray-900"}`}
          >
            <TruckIcon className="h-8 w-8" />
            <span className="text-[12px] font-semibold">Track</span>
            {isActive('/track') && <div className="mt-1 h-1 w-6 rounded-full bg-violet-600 transition-all" />}
          </button>

          <button
            type="button"
            onClick={() => navigate("/orders")}
            className={`flex flex-col items-center gap-1 transition-all ${isActive("/orders") ? "text-violet-600" : "text-gray-900"}`}
          >
            <ClipboardDocumentListIcon className="h-8 w-8" />
            <span className="text-[12px] font-semibold">Orders</span>
            {isActive('/orders') && <div className="mt-1 h-1 w-6 rounded-full bg-violet-600 transition-all" />}
          </button>

          <button
            type="button"
            onClick={() => navigate("/refund")}
            className={`flex flex-col items-center gap-1 transition-all duration-200 ease-out ${isActive("/refund") ? "text-violet-600" : "text-slate-900 hover:text-violet-600"}`}
          >
            <TagIcon className="h-8 w-8" />
            <span className="text-[12px] font-semibold">Refund</span>
            {isActive('/refund') && <div className="mt-1 h-1 w-6 rounded-full bg-violet-600 transition-all" />}
          </button>

          <button
            type="button"
            onClick={() => navigate("/profile")}
            className={`flex flex-col items-center gap-1 transition-all ${isActive("/profile") ? "text-violet-600" : "text-gray-900"}`}
          >
            <UserIcon className="h-8 w-8" />
            <span className="text-[12px] font-semibold">Profile</span>
            {isActive('/profile') && <div className="mt-1 h-1 w-6 rounded-full bg-violet-600 transition-all" />}
          </button>
        </div>
      </nav>
    </div>
  );
}
