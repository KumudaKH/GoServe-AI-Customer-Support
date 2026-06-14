import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authenticatedFetch } from "../services/api";
import { PAYMENT_METHODS } from "../utils/pricing";
import {
  SiCredly,
  SiGooglepay,
  SiPaytm,
  SiPhonepe,
} from "react-icons/si";
import { FaAmazonPay } from "react-icons/fa";
import { AiOutlineQrcode } from "react-icons/ai";

const savedMethods = [
  { id: "upi", label: "UPI", detail: "kumuda@okhdfcbank", status: "Verified" },
  { id: "card", label: "Debit Card", detail: "**** 1234", status: "Expires 12/26" },
  { id: "wallet", label: "GoServe Wallet", detail: "₹520 balance", status: "Auto top-up enabled" },
];

const UPI_APPS = [
  { id: "gpay", label: "Google Pay", icon: SiGooglepay },
  { id: "phonepe", label: "PhonePe", icon: SiPhonepe },
  { id: "paytm", label: "Paytm", icon: SiPaytm },
  { id: "bhim", label: "BHIM", icon: AiOutlineQrcode },
  { id: "amazonpay", label: "Amazon Pay", icon: FaAmazonPay },
  { id: "cred", label: "CRED", icon: SiCredly },
];

const recentTransactions = [
  { label: "Groceries order", amount: 420, method: "UPI", status: "Paid" },
  { label: "Electronics order", amount: 1_799, method: "Card", status: "Paid" },
  { label: "Home essentials", amount: 239, method: "Wallet", status: "Completed" },
];

export default function Payments() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(520);
  const [selected, setSelected] = useState("upi");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await authenticatedFetch("/api/profile", {}, navigate);
        if (data?.wallet_balance) {
          setBalance(data.wallet_balance);
        }
      } catch (e) {
        console.warn("Unable to load payment profile", e);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [navigate]);

  const selectedMethod = useMemo(
    () => PAYMENT_METHODS.find((method) => method.id === selected) || PAYMENT_METHODS[0],
    [selected]
  );

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[28px] bg-gradient-to-r from-violet-600 to-fuchsia-600 p-8 text-white shadow-2xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-violet-200">Payments</p>
              <h1 className="mt-2 text-4xl font-bold">GoServe Wallet & Cards</h1>
              <p className="mt-3 max-w-2xl text-sm text-violet-100">
                Manage saved payment methods, enable auto-pay, and checkout faster with premium payment offers.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/checkout")}
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
            >
              Checkout now
            </button>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-white/10 p-6 shadow-lg backdrop-blur-sm">
              <p className="text-sm uppercase tracking-[0.28em] text-violet-100">Wallet balance</p>
              <p className="mt-4 text-3xl font-bold">₹{balance.toLocaleString("en-IN")}</p>
              <p className="mt-2 text-sm text-violet-200">Use it for instant checkout and cashback.</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-6 shadow-lg backdrop-blur-sm">
              <p className="text-sm uppercase tracking-[0.28em] text-violet-100">Preferred method</p>
              <p className="mt-4 text-3xl font-bold">{selectedMethod.label}</p>
              <p className="mt-2 text-sm text-violet-200">{selectedMethod.detail}</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-6 shadow-lg backdrop-blur-sm">
              <p className="text-sm uppercase tracking-[0.28em] text-violet-100">Security</p>
              <p className="mt-4 text-3xl font-bold">2FA enabled</p>
              <p className="mt-2 text-sm text-violet-200">Safe payments for every checkout.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Saved Methods</p>
                <h2 className="mt-3 text-2xl font-bold text-slate-900">Choose a payment method</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelected(savedMethods[0].id)}
                className="rounded-full bg-violet-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-violet-700"
              >
                Quick select
              </button>
            </div>
            <div className="mt-6 space-y-3">
              {savedMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelected(method.id)}
                  className={`w-full rounded-3xl border p-4 text-left transition ${
                    selected === method.id ? "border-violet-600 bg-violet-50" : "border-slate-200 bg-white hover:border-violet-200"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{method.label}</p>
                      <p className="text-sm text-slate-500">{method.detail}</p>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">{method.status}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-8 rounded-3xl bg-slate-50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Popular UPI apps</p>
                  <h3 className="mt-3 text-xl font-semibold text-slate-900">Pay with your favorite app</h3>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-6">
                {UPI_APPS.map((app) => {
                  const AppIcon = app.icon;
                  return (
                    <div
                      key={app.id}
                      className="rounded-3xl border border-slate-200 bg-white p-3 text-center shadow-sm"
                    >
                      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">
                        <AppIcon className="h-6 w-6" />
                      </div>
                      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                        {app.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-lg lg:col-span-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Recent payments</p>
                <h2 className="mt-3 text-2xl font-bold text-slate-900">Transaction summary</h2>
              </div>
              <button
                type="button"
                onClick={() => navigate("/history")}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                View history
              </button>
            </div>
            <div className="mt-6 space-y-3">
              {recentTransactions.map((txn) => (
                <div key={txn.label} className="rounded-3xl border border-slate-200 p-4 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{txn.label}</p>
                    <p className="text-sm text-slate-500">Paid with {txn.method}</p>
                  </div>
                  <div className="mt-3 sm:mt-0 text-right">
                    <p className="text-xl font-bold text-slate-900">₹{txn.amount.toLocaleString("en-IN")}</p>
                    <p className="text-sm text-slate-500">{txn.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-violet-900 p-6 text-white shadow-2xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-violet-300">Premium benefits</p>
              <h2 className="mt-3 text-3xl font-bold">Faster payments, higher cashback</h2>
              <p className="mt-3 max-w-2xl text-sm text-slate-300">
                Activate automatic payments for saved cards and wallet balance to get priority checkout and exclusive offers.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/checkout")}
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-violet-900 transition hover:bg-slate-100"
            >
              Use selected method
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-3xl bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}
      </div>
    </div>
  );
}
