import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BellIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  ShoppingBagIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartCount } = useCart();

  const navItems = [
    {
      key: "notifications",
      icon: <BellIcon className="h-6 w-6 text-white" />,
      label: "Notifications",
      onClick: () => navigate("/notifications"),
    },
    {
      key: "buy-together",
      icon: <UserGroupIcon className="h-6 w-6 text-white" />,
      label: "Buy Together",
      onClick: () => navigate("/group-orders"),
    },
    {
      key: "bag",
      icon: <ShoppingBagIcon className="h-6 w-6 text-white" />,
      label: "Bag",
      onClick: () => navigate("/bag"),
    },
    {
      key: "chat",
      icon: <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />,
      label: "AI Support",
      onClick: () => navigate("/chat"),
    },
    {
      key: "profile",
      icon: <UserIcon className="h-6 w-6 text-white" />,
      label: "Profile",
      onClick: () => navigate("/profile"),
    },
    {
      key: "logout",
      icon: <ArrowRightOnRectangleIcon className="h-6 w-6 text-white" />,
      label: "Logout",
      onClick: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      },
    },
  ];

  const isActive = (pathOrKey) => {
    if (pathOrKey === "group") return location.pathname.startsWith("/group");
    if (pathOrKey === "chat") return location.pathname === "/chat";
    return false;
  };

  return (
    <header className="w-full bg-slate-900 text-white border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}
              aria-label="GoServe Home">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-violet-700 font-black shadow-lg">
                GS
              </div>
              <div>
                <div className="text-sm uppercase tracking-[0.35em] text-slate-400">GoServe</div>
                <div className="text-2xl font-bold">GoServe</div>
              </div>
            </div>
          </div>

          {/* Desktop icons */}
          <div className="hidden md:flex items-center gap-4">
            {navItems.map((it) => (
              <button
                key={it.key}
                title={it.key === 'bag' ? 'My Bag' : it.label}
                aria-label={it.key === 'bag' ? 'My Bag' : it.label}
                onClick={it.onClick}
                className={`cursor-pointer flex items-center gap-2 px-3 py-2 rounded-full transition-all transform hover:scale-105 hover:bg-violet-700/80 ${
                  isActive(it.key) ? "bg-violet-700/90 ring-1 ring-violet-500" : ""
                }`}
              >
                <div className="relative">
                  {it.icon}
                  {it.key === "bag" && cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full" aria-live="polite" aria-label={`${cartCount} items in bag`}>
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-white">{it.label}</span>
              </button>
            ))}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(true)}
              className="p-2 rounded-md hover:bg-slate-100"
              title="Menu"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/40 z-50">
          <div className="absolute right-0 w-64 h-full bg-white p-4 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-semibold">Menu</div>
              <button onClick={() => setMenuOpen(false)} className="p-2 rounded-md hover:bg-slate-100">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2">
              

              {navItems.map((it) => (
                <button
                  key={it.key}
                  onClick={() => {
                    setMenuOpen(false);
                    it.onClick();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-slate-50"
                  title={it.label}
                >
                  {it.icon}
                  <span className="text-sm font-medium">{it.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
