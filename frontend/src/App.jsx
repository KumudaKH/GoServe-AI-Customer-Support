
import { Routes, Route, useNavigate } from "react-router-dom";
import TrackOrder from "./pages/TrackOrder";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Refund from "./pages/Refund";
import Chat from "./pages/Chat";
import Tickets from "./pages/Tickets";
import TicketDetails from "./pages/TicketDetails";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Categories from "./pages/Categories";
import Offers from "./pages/Offers";
import Discounts from "./pages/Discounts";
import Cashback from "./pages/Cashback";
import Deals from "./pages/Deals";
import Wishlist from "./pages/Wishlist";
import Loyalty from "./pages/Loyalty";
import Vouchers from "./pages/Vouchers";
import Language from "./pages/Language";
import AiShopping from "./pages/AiShopping";
import Group from "./pages/Group";
import MyGroupOrders from "./pages/MyGroupOrders";
import GroupOrders from "./pages/GroupOrders";
import BuyTogether from "./pages/BuyTogether";
import History from "./pages/History";
import Payments from "./pages/Payments";
import Search from "./pages/Search";
import Delivery from "./pages/Delivery";
import TrackOrders from "./pages/TrackOrders";
import SelectLocation from "./pages/SelectLocation";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Bag from "./pages/Bag";
import Checkout from "./pages/Checkout";

function App() {
  const navigate = useNavigate();

  return (
    <>
      <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <Search />
          </ProtectedRoute>
        }
      />
      <Route
        path="/track-orders"
        element={
          <ProtectedRoute>
            <TrackOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/track"
        element={
          <ProtectedRoute>
            <TrackOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/select-location"
        element={
          <ProtectedRoute>
            <SelectLocation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/delivery"
        element={
          <ProtectedRoute>
            <Delivery />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        }
      />

      <Route
        path="/orders/:order_id"
        element={
          <ProtectedRoute>
            <OrderDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/refund"
        element={
          <ProtectedRoute>
            <Refund />
          </ProtectedRoute>
        }
      />

      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-shopping"
        element={
          <ProtectedRoute>
            <AiShopping />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tickets"
        element={
          <ProtectedRoute>
            <Tickets />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tickets/:ticket_id"
        element={
          <ProtectedRoute>
            <TicketDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/categories"
        element={
          <ProtectedRoute>
            <Categories />
          </ProtectedRoute>
        }
      />

      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        }
      />

      <Route
        path="/products/:id"
        element={
          <ProtectedRoute>
            <ProductDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        }
      />

      <Route
        path="/bag"
        element={
          <ProtectedRoute>
            <Bag />
          </ProtectedRoute>
        }
      />

      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        }
      />

      <Route
        path="/offers"
        element={
          <ProtectedRoute>
            <Offers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/discounts"
        element={
          <ProtectedRoute>
            <Discounts />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cashback"
        element={
          <ProtectedRoute>
            <Cashback />
          </ProtectedRoute>
        }
      />

      <Route
        path="/deals"
        element={
          <ProtectedRoute>
            <Deals />
          </ProtectedRoute>
        }
      />

      <Route
        path="/wishlist"
        element={
          <ProtectedRoute>
            <Wishlist />
          </ProtectedRoute>
        }
      />

      <Route
        path="/loyalty"
        element={
          <ProtectedRoute>
            <Loyalty />
          </ProtectedRoute>
        }
      />

      <Route
        path="/vouchers"
        element={
          <ProtectedRoute>
            <Vouchers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/language"
        element={
          <ProtectedRoute>
            <Language />
          </ProtectedRoute>
        }
      />

      <Route
        path="/track/:order_id"
        element={
          <ProtectedRoute>
            <TrackOrder />
          </ProtectedRoute>
        }
      />
      <Route
        path="/group/:code"
        element={
          <ProtectedRoute>
            <Group />
          </ProtectedRoute>
        }
      />

      <Route
        path="/buy-together"
        element={
          <ProtectedRoute>
            <BuyTogether />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-groups"
        element={
          <ProtectedRoute>
            <MyGroupOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/group-orders"
        element={
          <ProtectedRoute>
            <GroupOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments"
        element={
          <ProtectedRoute>
            <Payments />
          </ProtectedRoute>
        }
      />
    </Routes>

      {/* Floating AI chat button removed per request */}
    </>
    
  );
}

export default App;
