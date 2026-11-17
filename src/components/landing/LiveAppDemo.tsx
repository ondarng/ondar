"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Store,
  CreditCard,
  Package,
  ShoppingBag,
  CheckCircle2,
  Copy,
  Check,
  Building2,
  ExternalLink,
  MessageCircle,
  Truck,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  Sparkles,
} from "lucide-react";

type InteractiveTab = "catalog" | "checkout" | "tracking" | "merchant";

export function LiveAppDemo() {
  const [activeTab, setActiveTab] = useState<InteractiveTab>("catalog");

  // Catalog interactive state
  const [cartCount, setCartCount] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState({
    name: "Classic Linen Oversized Shirt",
    price: 28500,
    stock: 4,
    color: "Sage Green",
  });

  // Checkout interactive state
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("delivery");
  const [paymentStep, setPaymentStep] = useState<"form" | "bank_transfer">("bank_transfer");
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [paymentSent, setPaymentSent] = useState(false);

  // Merchant interactive state
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText("7031646044");
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-neutral-900 rounded-3xl p-3 sm:p-5 border border-neutral-800 shadow-2xl text-left">
      {/* Top Device Bar */}
      <div className="flex items-center justify-between pb-3 px-2 border-b border-neutral-800/80">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
        </div>

        {/* Live URL Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-800 border border-neutral-700/60 text-[11px] font-mono text-neutral-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>kriss.ondar.ng</span>
        </div>

        <Link
          href="/s/kriss"
          target="_blank"
          className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
        >
          <span>Open live</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Screen Selector Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-neutral-950/80 rounded-2xl my-3 border border-neutral-800">
        <button
          type="button"
          onClick={() => setActiveTab("catalog")}
          className={`py-2 px-1 text-[11px] sm:text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "catalog"
              ? "bg-neutral-800 text-white shadow-xs"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span className="truncate">1. Store</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("checkout")}
          className={`py-2 px-1 text-[11px] sm:text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "checkout"
              ? "bg-neutral-800 text-white shadow-xs"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span className="truncate">2. Checkout</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tracking")}
          className={`py-2 px-1 text-[11px] sm:text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "tracking"
              ? "bg-neutral-800 text-white shadow-xs"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span className="truncate">3. Tracking</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("merchant")}
          className={`py-2 px-1 text-[11px] sm:text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "merchant"
              ? "bg-neutral-800 text-white shadow-xs"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
          <span className="truncate">4. Vendor</span>
        </button>
      </div>

      {/* Screen Frame Container */}
      <div className="bg-white rounded-2xl overflow-hidden border border-neutral-200/90 text-neutral-900 shadow-inner">
        {/* ================================================================= */}
        {/* SCREEN 1: LIVE STOREFRONT CATALOG */}
        {/* ================================================================= */}
        {activeTab === "catalog" && (
          <div className="p-4 sm:p-5 space-y-4 animate-in fade-in duration-150">
            {/* Storefront Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white font-black text-sm flex items-center justify-center shadow-xs">
                  KR
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                    kriss
                    <span className="text-[10px] font-bold text-[#00A859] bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">
                      Verified Store
                    </span>
                  </h3>
                  <p className="text-[11px] text-neutral-500">Ikeja, Lagos · Quick Delivery</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <ShoppingBag className="w-5 h-5 text-neutral-700" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#00A859] text-white text-[10px] font-bold flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Product Card */}
            <div className="bg-[#FAFAFA] rounded-2xl p-3.5 border border-neutral-200/70 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="w-20 h-20 rounded-xl bg-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-500 shrink-0 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-neutral-200 flex items-center justify-center text-neutral-600 text-[11px] font-bold">
                    Item Photo
                  </div>
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#00A859]">
                      In Stock ({selectedProduct.stock} left)
                    </span>
                    <span className="text-xs font-bold text-neutral-400">#01</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-neutral-900 leading-tight">
                    {selectedProduct.name}
                  </h4>
                  <p className="text-sm font-black text-neutral-900">
                    ₦{selectedProduct.price.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setCartCount((c) => c + 1);
                    setActiveTab("checkout");
                  }}
                  className="flex-1 h-9 rounded-xl bg-[#00A859] hover:bg-[#00924c] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Buy Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setCartCount((c) => c + 1)}
                  className="h-9 px-3 rounded-xl bg-white hover:bg-neutral-100 text-neutral-800 text-xs font-bold border border-neutral-200 transition-colors cursor-pointer"
                >
                  Add to cart
                </button>
              </div>
            </div>

            <p className="text-[11px] text-neutral-400 text-center">
              💡 <em>Tap &ldquo;Buy Now&rdquo; to test the real customer checkout flow.</em>
            </p>
          </div>
        )}

        {/* ================================================================= */}
        {/* SCREEN 2: REAL NIGERIAN CHECKOUT FLOW */}
        {/* ================================================================= */}
        {activeTab === "checkout" && (
          <div className="p-4 sm:p-5 space-y-4 animate-in fade-in duration-150">
            {/* Checkout Header */}
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <span className="text-xs font-bold text-neutral-900">
                Checkout (1 item)
              </span>
              <span className="text-xs font-black text-[#00A859]">
                ₦{(selectedProduct.price + (deliveryType === "delivery" ? 2500 : 0)).toLocaleString()}
              </span>
            </div>

            {/* Delivery vs Pickup Selector */}
            <div className="grid grid-cols-2 gap-2 bg-neutral-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setDeliveryType("delivery")}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  deliveryType === "delivery"
                    ? "bg-white text-neutral-900 shadow-2xs"
                    : "text-neutral-500"
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Door Delivery (+₦2,500)</span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType("pickup")}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  deliveryType === "pickup"
                    ? "bg-white text-neutral-900 shadow-2xs"
                    : "text-neutral-500"
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Store Pickup (Free)</span>
              </button>
            </div>

            {/* Bank Transfer Details Box with 1-Click Copy */}
            <div className="bg-[#FFFDF5] border border-amber-200/80 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-700" />
                  Bank Transfer Account
                </span>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  Instant Verification
                </span>
              </div>

              <div className="bg-white rounded-xl p-3 border border-amber-200/60 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">
                    OPay · kriss
                  </p>
                  <p className="text-base font-mono font-black text-neutral-900 tracking-wider">
                    7031646044
                  </p>
                  <p className="text-[11px] text-neutral-500">NNEKA IMMACULATA ASIEGBU</p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyAccount}
                  className="px-2.5 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedAccount ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[11px] text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* 1-Tap Customer Action */}
              <button
                type="button"
                onClick={() => {
                  setPaymentSent(true);
                  setActiveTab("tracking");
                }}
                className="w-full h-10 rounded-xl bg-[#00A859] hover:bg-[#00924c] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>I have sent the payment</span>
              </button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* SCREEN 3: LIVE ORDER TRACKING & STOCK HOLD */}
        {/* ================================================================= */}
        {activeTab === "tracking" && (
          <div className="p-4 sm:p-5 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <span className="text-xs font-bold text-neutral-900 block">
                  Order #1001
                </span>
                <span className="text-[11px] text-neutral-500">
                  {paymentSent ? "Payment reported by buyer" : "Waiting for payment"}
                </span>
              </div>

              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                orderConfirmed
                  ? "bg-emerald-100 text-emerald-800"
                  : paymentSent
                  ? "bg-blue-100 text-blue-800"
                  : "bg-amber-100 text-amber-800"
              }`}>
                {orderConfirmed ? "Payment Confirmed" : paymentSent ? "Under Review" : "Awaiting Transfer"}
              </span>
            </div>

            {/* Stock Hold Alert Banner */}
            <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 flex items-start gap-2.5 text-xs text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-[#00A859] shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Your stock is reserved.</strong>
                <span className="text-emerald-800 text-[11px]">
                  Ondar locks this item so other customers cannot buy it while you verify payment.
                </span>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="space-y-2.5 pt-1 text-xs">
              <div className="flex items-center gap-2.5 text-neutral-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#00A859]" />
                <span>Order placed & stock reserved</span>
              </div>

              <div className="flex items-center gap-2.5 text-neutral-800 font-semibold">
                <CheckCircle2 className={`w-4 h-4 ${paymentSent ? "text-[#00A859]" : "text-neutral-300"}`} />
                <span>Customer clicked &ldquo;I have sent payment&rdquo;</span>
              </div>

              <div className="flex items-center gap-2.5 text-neutral-800 font-semibold">
                <CheckCircle2 className={`w-4 h-4 ${orderConfirmed ? "text-[#00A859]" : "text-neutral-300"}`} />
                <span>Vendor verified alert in bank</span>
              </div>
            </div>

            {/* Next step prompt */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setActiveTab("merchant")}
                className="text-xs font-bold text-[#00A859] hover:underline inline-flex items-center gap-1"
              >
                <span>Switch to Vendor View to confirm this order</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* SCREEN 4: VENDOR MANAGEMENT & 1-TAP CONFIRMATION */}
        {/* ================================================================= */}
        {activeTab === "merchant" && (
          <div className="p-4 sm:p-5 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <span className="text-xs font-bold text-neutral-900 block">
                  Vendor Dashboard
                </span>
                <span className="text-[11px] text-neutral-500">
                  New Order #1001 Needs Review
                </span>
              </div>

              <span className="text-xs font-black text-neutral-900">
                ₦{(selectedProduct.price + 2500).toLocaleString()}
              </span>
            </div>

            {/* Pending Alert Card */}
            <div className="bg-[#FAFAFA] rounded-xl p-3 border border-neutral-200/80 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-neutral-800">Customer: Tunde Adeleke</span>
                <span className="text-neutral-500 font-mono text-[11px]">+234 812 345 6789</span>
              </div>
              <p className="text-neutral-600 text-[11px]">
                Item: {selectedProduct.name} (Qty: 1) · Ikeja Delivery
              </p>
              <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200/60 font-medium">
                Customer says they transferred ₦{(selectedProduct.price + 2500).toLocaleString()} to your OPay account.
              </div>
            </div>

            {/* 1-Tap Merchant Actions */}
            <div className="flex items-center gap-2 pt-1">
              {orderConfirmed ? (
                <div className="w-full py-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00A859]" />
                  <span>Payment confirmed & inventory deducted!</span>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setOrderConfirmed(true);
                      setSelectedProduct((p) => ({ ...p, stock: p.stock - 1 }));
                    }}
                    className="flex-1 h-10 rounded-xl bg-[#00A859] hover:bg-[#00924c] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Payment</span>
                  </button>

                  <a
                    href="https://wa.me/2347041402806?text=Hello%20Tunde,%20regarding%20your%20order%20#1001"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10 px-3 rounded-xl bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                    <span>WhatsApp</span>
                  </a>
                </>
              )}
            </div>

            <p className="text-[11px] text-neutral-400 text-center">
              💡 <em>Tapping &ldquo;Confirm Payment&rdquo; permanently marks the order as paid and updates your stock.</em>
            </p>
          </div>
        )}
      </div>

      {/* Screen Footnote */}
      <div className="flex items-center justify-between text-[11px] text-neutral-400 px-2 pt-1">
        <span>Interactive preview of real Ondar app screens</span>
        <button
          type="button"
          onClick={() => {
            setActiveTab("catalog");
            setCartCount(0);
            setPaymentSent(false);
            setOrderConfirmed(false);
          }}
          className="text-neutral-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset demo</span>
        </button>
      </div>
    </div>
  );
}
