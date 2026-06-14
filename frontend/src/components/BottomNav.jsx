import { useNavigate, useLocation } from "react-router-dom";
import {
  HomeIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  TruckIcon,
} from "@heroicons/react/24/solid";
import { useCart } from "../context/CartContext";

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();

  const isActive = (path) => {
    const normalizedPath = path.split("?")[0];
    if (normalizedPath === "/") {
      return location.pathname === "/" || location.pathname === "/home";
    }
    return location.pathname === normalizedPath || location.pathname.startsWith(`${normalizedPath}/`);
  };

  const navItems = [
    { label: "Home", path: "/", icon: HomeIcon },
    { label: "Search", path: "/search", icon: MagnifyingGlassIcon },
    { label: "Track", path: "/track", icon: TruckIcon },
    { label: "Orders", path: "/orders", icon: ClipboardDocumentListIcon },
    { label: "Profile", path: "/profile", icon: UserIcon },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="grid grid-cols-6 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center cursor-pointer transition-all duration-200 ease-out ${
                active ? "text-violet-600" : "text-black hover:text-violet-600"
              }`}
              title={item.label}
            >
              <div className="relative">
                <Icon className="h-6 w-6" />
                {item.label === "Orders" && cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold leading-none text-white bg-red-600 rounded-full">
                    {cartCount}
                  </span>
                )}
              </div>
              <p className="text-xs font-medium mt-1">{item.label}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default BottomNav;