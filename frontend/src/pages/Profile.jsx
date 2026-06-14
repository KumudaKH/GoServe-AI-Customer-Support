
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CreditCardIcon,
  BellIcon,
  ShieldCheckIcon,
  GiftIcon,
  TrophyIcon,
  LinkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronRightIcon,
  StarIcon,
  FireIcon,
  HeartIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/solid";
import { authenticatedFetch } from "../services/api";

export default function Profile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editable, setEditable] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const dropRef = useRef(null);
  const [saveError, setSaveError] = useState(null);
  const [saveMessage, setSaveMessage] = useState(null);

  const [profileData, setProfileData] = useState({
    name: "Kumuda KH",
    email: "kumudagowda56@gmail.com",
    phone: "7338554720",
    address: "123 Main St, City, State 12345",
    dob: "1990-05-15",
    gender: "",
    profile_photo: "https://via.placeholder.com/150",
    loyaltyPoints: 2450,
    cashbackEarned: 1850,
    totalOrders: 42,
    totalSpent: 45500,
    membershipLevel: "Gold",
    referralCode: "KUMUDA123XYZ",
    referrals: 8,
    referralEarnings: 950,
    emailVerified: true,
    phoneVerified: true,
    activeDevices: 2,
  });

  const membershipTiers = [
    { level: "Bronze", emoji: "🥉", minSpend: 0, benefits: ["Free shipping on 1 order", "Basic support"] },
    { level: "Silver", emoji: "🥈", minSpend: 10000, benefits: ["Free shipping on all orders", "Priority support", "5% cashback"] },
    { level: "Gold", emoji: "🥇", minSpend: 50000, benefits: ["Free shipping + free returns", "24/7 support", "10% cashback", "Birthday reward"] },
    { level: "Platinum", emoji: "💎", minSpend: 100000, benefits: ["Concierge service", "15% cashback", "Exclusive deals", "VIP events"] },
  ];

  const badges = [
    { icon: "🏆", title: "First Order", desc: "Completed your first purchase" },
    { icon: "🚚", title: "10 Orders", desc: "Reached 10 successful orders" },
    { icon: "💬", title: "Support Contributor", desc: "Helped 5+ customers" },
    { icon: "👥", title: "Group Buyer", desc: "Joined 3 group orders" },
    { icon: "⭐", title: "Premium Member", desc: "Reached Gold membership" },
  ];

  const paymentMethods = [
    { type: "UPI", value: "kumuda@okhdfcbank", isDefault: true },
    { type: "Debit Card", value: "****1234", last4: "1234", isDefault: false },
    { type: "Credit Card", value: "****5678", last4: "5678", isDefault: false },
    { type: "Wallet", value: "₹500 balance", isDefault: false },
  ];

  const orderStats = [
    { label: "Delivered", count: 38, color: "green", path: "/orders?status=delivered" },
    { label: "Processing", count: 2, color: "blue", path: "/orders?status=processing" },
    { label: "Cancelled", count: 1, color: "red", path: "/orders?status=cancelled" },
    { label: "Refunded", count: 1, color: "purple", path: "/orders?status=refunded" },
  ];

  const supportStats = [
    { label: "Open Tickets", count: 2 },
    { label: "In Progress", count: 1 },
    { label: "Resolved", count: 15 },
  ];

  useEffect(() => {
    // try to fetch from backend; fallback to local profileData
    const load = async () => {
      try {
        const data = await authenticatedFetch("/api/profile");
        if (data) {
          setProfileData((p) => ({ ...p, ...data }));
        }
      } catch (e) {
        // ignore and use defaults
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    if (isEditOpen) return;
    // reset preview when edit closes
    setPhotoPreview(null);
    setPhotoFile(null);
  }, [isEditOpen]);

  const getProfileCompletion = () => {
    let completion = 0;
    if (profileData.profile_photo) completion += 20;
    if (profileData.phone) completion += 20;
    if (profileData.address) completion += 20;
    if (profileData.dob) completion += 20;
    if (profileData.emailVerified) completion += 20;
    return completion;
  };

  const getMembershipInfo = () => {
    return membershipTiers.find((tier) => tier.level === profileData.membershipLevel) || membershipTiers[0];
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSaveMessage("Copied to clipboard!");
  };

  const openEdit = () => {
    setEditable({
      name: profileData.name || "",
      email: profileData.email || "",
      phone: profileData.phone || "",
      address: profileData.address || "",
      dob: profileData.dob || "",
      gender: profileData.gender || "",
    });
    setPhotoPreview(profileData.profile_photo || null);
    setIsEditOpen(true);
  };

  const [isSaving, setIsSaving] = useState(false);

  const validate = (obj) => {
    const errors = {};
    if (!obj.name || obj.name.trim().length < 2) errors.name = "Please enter your full name";
    if (!obj.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(obj.email)) errors.email = "Enter a valid email";
    if (!obj.phone || !/^\d{10}$/.test(obj.phone)) errors.phone = "Enter a 10 digit phone number";
    if (!obj.address || obj.address.trim().length < 5) errors.address = "Enter a valid address";
    return errors;
  };

  const handleFile = (file) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowed.includes(file.type)) {
      setSaveError("Only JPG, JPEG and PNG allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSaveError("Maximum file size is 5MB");
      return;
    }
    // preview
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target.result);
    reader.readAsDataURL(file);
    setPhotoFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const f = e.dataTransfer?.files?.[0];
    if (f) handleFile(f);
  };

  const cropImageToSquare = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const size = Math.min(img.width, img.height);
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        const canvas = document.createElement("canvas");
        const outSize = 500;
        canvas.width = outSize;
        canvas.height = outSize;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, sx, sy, size, size, 0, 0, outSize, outSize);
        canvas.toBlob((blob) => {
          if (blob) resolve(new File([blob], file.name, { type: blob.type }));
          else reject(new Error("Crop failed"));
        }, "image/jpeg", 0.9);
      };
      img.onerror = reject;
      const reader = new FileReader();
      reader.onload = (e) => (img.src = e.target.result);
      reader.readAsDataURL(file);
    });
  };

  const handleSave = async () => {
    const errors = validate(editable || {});
    if (Object.keys(errors).length) {
      setSaveError(Object.values(errors)[0]);
      return;
    }
    setIsSaving(true);
    try {
      // Build JSON payload. If user uploaded a photo, crop and convert to base64 data URL.
      let profile_image = profileData.profile_photo || null;
      if (photoFile) {
        const cropped = await cropImageToSquare(photoFile);
        // convert cropped File to base64
        profile_image = await new Promise((res, rej) => {
          const reader = new FileReader();
          reader.onload = (ev) => res(ev.target.result);
          reader.onerror = rej;
          reader.readAsDataURL(cropped);
        });
      }

      const payload = {
        name: editable.name,
        email: editable.email,
        phone: editable.phone,
        address: editable.address,
        dob: editable.dob || "",
        gender: editable.gender || "",
        profile_image,
      };

      console.log("Sending:", payload);
      setSaveError(null);
      setSaveMessage(null);
      const url = "/api/profile";
      const method = "PUT";

      const headers = {
        "Content-Type": "application/json",
      };

      console.log("Request URL:", url);
      console.log("Method:", method);
      console.log("Headers:", headers);
      console.log("Payload:", payload);

      const result = await authenticatedFetch(url, {
        method,
        headers,
        body: JSON.stringify(payload),
      }, navigate);

      console.log("API result:", result);

      if (!result || result.success === false) {
        const errMsg = result?.message || result?.error || "Failed to update profile";
        throw new Error(errMsg);
      }

      const userObj = result.user || result;

      setProfileData((p) => ({ ...p, ...userObj }));
      setSaveMessage("✅ Profile Updated Successfully");
      setIsEditOpen(false);
    } catch (e) {
      console.error(e);
      setSaveError(e.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-lg font-semibold text-slate-600">Loading profile...</div>
      </div>
    );
  }

  const currentMembership = getMembershipInfo();
  const profileCompletion = getProfileCompletion();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-28">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-white/20 border-4 border-white flex items-center justify-center text-5xl">
              👤
            </div>
            <div>
              <h1 className="text-4xl font-bold">{profileData.name}</h1>
              <p className="mt-2 text-white/80">{profileData.membershipLevel} Member</p>
              <p className="text-sm text-white/70">{profileData.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        {/* Tab Navigation */}
        <div className="flex gap-4 flex-wrap">
          {["overview", "account", "payments", "security", "preferences"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-200 ${
                activeTab === tab
                  ? "bg-violet-600 text-white shadow-lg"
                  : "bg-white text-slate-700 hover:bg-slate-100 shadow"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Profile Completion Meter */}
            <div className="rounded-3xl bg-white p-8 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-900">Profile Completion</h2>
                <span className="text-3xl font-bold text-violet-600">{profileCompletion}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-violet-600 to-fuchsia-600 h-full transition-all duration-500"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
              <p className="mt-4 text-slate-600">Complete your profile to unlock rewards and exclusive benefits.</p>
            </div>

            {/* Membership Level */}
            <div className="rounded-3xl bg-white p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Membership Level</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {membershipTiers.map((tier) => (
                  <div
                    key={tier.level}
                    className={`rounded-3xl p-6 transition-all duration-300 ${
                      tier.level === profileData.membershipLevel
                        ? "bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-xl scale-105"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-900"
                    }`}
                  >
                    <div className="text-4xl mb-2">{tier.emoji}</div>
                    <h3 className="font-bold text-lg">{tier.level}</h3>
                    <p className="text-xs opacity-80 mt-1">From ₹{tier.minSpend.toLocaleString()}</p>
                    {tier.level === profileData.membershipLevel && (
                      <div className="mt-3 text-sm font-semibold">✓ Your Level</div>
                    )}
                  </div>
                ))}
              </div>
              {currentMembership && (
                <div className="mt-6 p-4 bg-violet-50 rounded-2xl">
                  <h3 className="font-bold text-slate-900 mb-3">Benefits</h3>
                  <ul className="space-y-2">
                    {currentMembership.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-slate-700">
                        <CheckCircleIcon className="h-5 w-5 text-violet-600" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Loyalty & Rewards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Loyalty Points", value: profileData.loyaltyPoints, icon: StarIcon, color: "from-yellow-500 to-orange-500" },
                { label: "Cashback Earned", value: `₹${profileData.cashbackEarned}`, icon: GiftIcon, color: "from-green-500 to-emerald-500" },
                { label: "Rewards Redeemed", value: "₹450", icon: TrophyIcon, color: "from-purple-500 to-fuchsia-500" },
              ].map((item) => (
                <div key={item.label} className={`rounded-3xl bg-gradient-to-br ${item.color} text-white p-8 shadow-lg`}>
                  <item.icon className="h-8 w-8 mb-3" />
                  <p className="text-sm opacity-90 mb-1">{item.label}</p>
                  <p className="text-3xl font-bold">{item.value}</p>
                </div>
              ))}
            </div>
            <button className="w-full bg-violet-600 text-white py-4 rounded-3xl font-bold hover:bg-violet-700 transition-all duration-200 shadow-lg">
              🎁 Redeem Rewards
            </button>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Premium status", value: profileData.membershipLevel, description: "Exclusive access to offers" },
                { label: "Next reward", value: "₹500 off", description: "Spend more to unlock" },
                { label: "Group orders", value: 3, description: "Active social buys" },
                { label: "Saved cards", value: paymentMethods.length, description: "Checkout faster" },
              ].map((item) => (
                <div key={item.label} className="rounded-3xl bg-white p-6 shadow-sm">
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-500">{item.label}</p>
                  <p className="mt-3 text-2xl font-bold text-slate-900">{item.value}</p>
                  <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>

            {/* Achievement Badges */}
            <div className="rounded-3xl bg-white p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Achievement Badges</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {badges.map((badge) => (
                  <div
                    key={badge.title}
                    className="rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 p-6 text-center hover:shadow-lg transition-all duration-300"
                  >
                    <div className="text-5xl mb-3">{badge.icon}</div>
                    <h3 className="font-bold text-slate-900 text-sm">{badge.title}</h3>
                    <p className="text-xs text-slate-500 mt-2">{badge.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Spending Analytics */}
            <div className="rounded-3xl bg-white p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Spending Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                  { label: "Total Orders", value: profileData.totalOrders },
                  { label: "Amount Spent", value: `₹${profileData.totalSpent}` },
                  { label: "Average Order", value: `₹${Math.round(profileData.totalSpent / profileData.totalOrders)}` },
                  { label: "Biggest Purchase", value: "₹2,450" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-6">
                    <p className="text-sm text-slate-600 mb-2">{stat.label}</p>
                    <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                  </div>
                ))}
              </div>
              <div className="h-48 bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-2xl flex items-center justify-center text-slate-500">
                📊 Monthly spending chart (placeholder)
              </div>
            </div>

            {/* Order Statistics */}
            <div className="rounded-3xl bg-white p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Order Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {orderStats.map((stat) => (
                  <button
                    key={stat.label}
                    onClick={() => navigate(stat.path)}
                    className="rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 p-6 hover:shadow-lg transition-all duration-300 text-left group"
                  >
                    <p className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{stat.label}</p>
                    <p className="text-4xl font-bold text-slate-900 mt-2">{stat.count}</p>
                    <ChevronRightIcon className="h-5 w-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>
            </div>

            {/* Wishlist Summary */}
            <div className="rounded-3xl bg-white p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Wishlist Summary</h2>
                <HeartIcon className="h-6 w-6 text-red-500" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {[
                  { label: "Total Items", value: "24" },
                  { label: "Recently Added", value: "3 this week" },
                  { label: "Price Drops", value: "5 alerts" },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl bg-slate-50 p-6">
                    <p className="text-sm text-slate-600 mb-2">{item.label}</p>
                    <p className="text-2xl font-bold text-slate-900">{item.value}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate("/wishlist")}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-4 rounded-3xl font-bold hover:shadow-lg transition-all duration-200"
              >
                ❤️ View Wishlist
              </button>
            </div>

            {/* Group Orders */}
            <div className="rounded-3xl bg-white p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Group Orders</h2>
                <span className="text-3xl">👥</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Created", count: 2 },
                  { label: "Joined", count: 8 },
                  { label: "Active", count: 3 },
                  { label: "Completed", count: 7 },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl bg-slate-50 p-6 text-center">
                    <p className="text-sm text-slate-600 mb-2">{stat.label}</p>
                    <p className="text-3xl font-bold text-slate-900">{stat.count}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate("/group-orders")}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 rounded-3xl font-bold hover:shadow-lg transition-all duration-200"
              >
                👥 Manage Group Orders
              </button>
            </div>

            {/* Support Center */}
            <div className="rounded-3xl bg-white p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Support Center</h2>
                <span className="text-3xl">💬</span>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {supportStats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl bg-slate-50 p-6 text-center">
                    <p className="text-sm text-slate-600 mb-2">{stat.label}</p>
                    <p className="text-3xl font-bold text-slate-900">{stat.count}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "My Tickets", path: "/tickets", icon: "🎫" },
                  { label: "Contact Support", path: "/tickets", icon: "📞" },
                  { label: "AI Support", path: "/chat", icon: "🤖" },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    onClick={() => navigate(btn.path)}
                    className="rounded-3xl bg-slate-50 hover:bg-slate-100 py-3 font-semibold text-slate-900 transition-all duration-200"
                  >
                    {btn.icon} {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Referral Program */}
            <div className="rounded-3xl bg-white p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Referral Program</h2>
                <span className="text-3xl">🎁</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {[
                  { label: "Referral Code", value: profileData.referralCode, action: "copy" },
                  { label: "Total Referrals", value: profileData.referrals },
                  { label: "Referral Earnings", value: `₹${profileData.referralEarnings}` },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl bg-gradient-to-br from-violet-50 to-fuchsia-50 p-6">
                    <p className="text-sm text-slate-600 mb-2">{item.label}</p>
                    <p className="text-2xl font-bold text-slate-900">{item.value}</p>
                    {item.action === "copy" && (
                      <button
                        onClick={() => copyToClipboard(item.value)}
                        className="mt-3 text-sm text-violet-600 font-semibold hover:text-violet-700"
                      >
                        📋 Copy
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-4 rounded-3xl font-bold hover:shadow-lg transition-all duration-200">
                👋 Invite Friends
              </button>
            </div>

            {/* AI Shopping Insights */}
            <div className="rounded-3xl bg-white p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">AI Shopping Insights</h2>
                <span className="text-3xl">🤖</span>
              </div>
              <p className="text-slate-600 mb-6">Based on your activity, you may like...</p>
              <div className="h-48 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl flex items-center justify-center text-slate-500">
                🛍️ Personalized product recommendations (placeholder)
              </div>
            </div>

            {/* Recently Viewed */}
            <div className="rounded-3xl bg-white p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Recently Viewed Products</h2>
              <div className="h-40 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl flex items-center justify-center text-slate-500">
                📚 Recently viewed product carousel (placeholder)
              </div>
            </div>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === "account" && (
          <div className="rounded-3xl bg-white p-8 shadow-lg space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Account Information</h2>
            {[
              { label: "Full Name", value: profileData.name, icon: UserIcon },
              { label: "Email", value: profileData.email, icon: EnvelopeIcon },
              { label: "Phone", value: profileData.phone, icon: PhoneIcon },
              { label: "Address", value: profileData.address, icon: MapPinIcon },
            ].map((field) => (
              <div key={field.label} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                <field.icon className="h-6 w-6 text-violet-600" />
                <div className="flex-1">
                  <p className="text-sm text-slate-600">{field.label}</p>
                  <p className="font-semibold text-slate-900">{field.value}</p>
                </div>
                <button onClick={openEdit} className="text-violet-600 font-semibold hover:text-violet-700">Edit</button>
              </div>
            ))}
            <button onClick={openEdit} className="w-full bg-violet-600 text-white py-4 rounded-3xl font-bold hover:bg-violet-700 transition-all duration-200">
              ✏️ Edit Profile
            </button>
          </div>
        )}

        {/* Edit Modal */}
        {isEditOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setIsEditOpen(false)} />
            <div className="relative z-70 w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Edit Profile</h3>
                <button onClick={() => setIsEditOpen(false)} className="text-slate-500">✕</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="md:col-span-1">
                  <div
                    ref={dropRef}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="flex h-40 w-full items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50"
                  >
                    {photoPreview ? (
                      <div className="relative">
                        <img src={photoPreview} alt="preview" className="h-36 w-36 rounded-full object-cover" />
                        <div className="mt-2 flex gap-2">
                          <label className="cursor-pointer rounded-full bg-violet-600 text-white px-3 py-2 text-sm">
                            Upload
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleFile(e.target.files[0])}
                            />
                          </label>
                          <button onClick={handleRemovePhoto} className="rounded-full bg-red-100 text-red-600 px-3 py-2 text-sm">Remove</button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="mb-2">Upload or drag & drop</p>
                        <label className="cursor-pointer rounded-full bg-violet-600 text-white px-3 py-2 text-sm">
                          Choose File
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2 space-y-3">
                  <div>
                    <label className="block text-sm text-slate-600">Full Name</label>
                    <input value={editable?.name || ""} onChange={(e) => setEditable((s) => ({ ...s, name: e.target.value }))} className="mt-1 w-full rounded-2xl border p-3" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-slate-600">Email</label>
                      <input value={editable?.email || ""} onChange={(e) => setEditable((s) => ({ ...s, email: e.target.value }))} className="mt-1 w-full rounded-2xl border p-3" />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600">Phone</label>
                      <input value={editable?.phone || ""} onChange={(e) => setEditable((s) => ({ ...s, phone: e.target.value }))} className="mt-1 w-full rounded-2xl border p-3" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-slate-600">Date of Birth</label>
                      <input type="date" value={editable?.dob || ""} onChange={(e) => setEditable((s) => ({ ...s, dob: e.target.value }))} className="mt-1 w-full rounded-2xl border p-3" />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600">Gender</label>
                      <select value={editable?.gender || ""} onChange={(e) => setEditable((s) => ({ ...s, gender: e.target.value }))} className="mt-1 w-full rounded-2xl border p-3">
                        <option value="">Prefer not to say</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600">Address</label>
                    <textarea value={editable?.address || ""} onChange={(e) => setEditable((s) => ({ ...s, address: e.target.value }))} className="mt-1 w-full rounded-2xl border p-3" rows={3} />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 justify-end mt-4">
                <div className="flex-1 text-left">
                  {saveError && <div className="text-sm text-red-600">{saveError}</div>}
                  {saveMessage && <div className="text-sm text-green-600">{saveMessage}</div>}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setIsEditOpen(false)} className="px-6 py-3 rounded-2xl border">Cancel</button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`px-6 py-3 rounded-2xl bg-violet-600 text-white flex items-center gap-3 ${isSaving ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    {isSaving ? (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                      </svg>
                    ) : null}
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === "payments" && (
          <div className="rounded-3xl bg-white p-8 shadow-lg space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Saved Payment Methods</h2>
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.value} className="flex items-center justify-between p-4 border-2 border-slate-200 rounded-2xl hover:border-violet-400 transition-colors">
                  <div className="flex items-center gap-4">
                    <CreditCardIcon className="h-8 w-8 text-violet-600" />
                    <div>
                      <p className="font-semibold text-slate-900">{method.type}</p>
                      <p className="text-sm text-slate-600">{method.value}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {method.isDefault && <span className="text-xs bg-violet-100 text-violet-700 px-3 py-1 rounded-full font-semibold">Default</span>}
                    <button className="text-red-600 font-semibold hover:text-red-700">Remove</button>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-4 rounded-3xl font-bold hover:shadow-lg transition-all duration-200">
              ➕ Add Payment Method
            </button>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="rounded-3xl bg-white p-8 shadow-lg space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Security Center</h2>
            <div className="space-y-4">
              {[
                { label: "Email Verified", status: profileData.emailVerified, icon: EnvelopeIcon },
                { label: "Phone Verified", status: profileData.phoneVerified, icon: PhoneIcon },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <item.icon className="h-6 w-6 text-violet-600" />
                    <p className="font-semibold text-slate-900">{item.label}</p>
                  </div>
                  {item.status ? (
                    <CheckCircleIcon className="h-6 w-6 text-green-500" />
                  ) : (
                    <XCircleIcon className="h-6 w-6 text-red-500" />
                  )}
                </div>
              ))}
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl">
              <p className="font-semibold text-slate-900 mb-3">Active Devices: {profileData.activeDevices}</p>
              <button className="w-full text-slate-700 font-semibold hover:text-slate-900 mb-4">📱 View All Devices</button>
              <button className="w-full text-slate-700 font-semibold hover:text-slate-900">📋 View Login History</button>
            </div>
            <button className="w-full bg-gradient-to-r from-slate-600 to-slate-700 text-white py-4 rounded-3xl font-bold hover:shadow-lg transition-all duration-200">
              🔐 Change Password
            </button>
            <button className="w-full bg-red-600 text-white py-4 rounded-3xl font-bold hover:bg-red-700 transition-all duration-200">
              🚪 Logout from All Devices
            </button>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === "preferences" && (
          <div className="rounded-3xl bg-white p-8 shadow-lg space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Notification Preferences</h2>
            <div className="space-y-4">
              {[
                { label: "Order Updates", icon: ShoppingBagIcon },
                { label: "Offers", icon: FireIcon },
                { label: "Cashback Alerts", icon: GiftIcon },
                { label: "Ticket Updates", icon: BellIcon },
                { label: "Group Order Updates", icon: UserIcon },
              ].map((pref) => (
                <div key={pref.label} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <pref.icon className="h-6 w-6 text-violet-600" />
                    <p className="font-semibold text-slate-900">{pref.label}</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-6 h-6 rounded cursor-pointer" />
                </div>
              ))}
            </div>
            <button className="w-full bg-violet-600 text-white py-4 rounded-3xl font-bold hover:bg-violet-700 transition-all duration-200">
              💾 Save Preferences
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

