"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Copy,
  ExternalLink,
  HelpCircle,
  Info,
  Loader2,
  Lock,
  MapPin,
  MessageCircle,
  Package,
  RotateCcw,
  Share2,
  Sparkles,
  Star,
  Store,
  Truck,
  Users,
} from "lucide-react";
import { OndarLogo } from "@/components/OndarLogo";
import { MerchantBottomNav } from "@/components/merchant/MerchantBottomNav";

export interface StorefrontProduct {
  id: string;
  name: string;
  slug: string;
  priceKobo: string;
  description: string | null;
  images: { url: string }[];
}

export interface StorefrontHubProps {
  businessName: string;
  storeSlug: string;
  fullStoreUrl: string;
  displayStoreUrl: string;
  state: string;
  city: string;
  returnPolicy: string;
  deliveryCoverage?: string;
  activeProducts: StorefrontProduct[];
  hasActiveProducts: boolean;
  pendingBadgeCount?: number;
  initialView?: "hub" | "share" | "delivery-returns" | "reviews";
}

interface ReviewItem {
  id: string;
  customerName: string;
  verified: boolean;
  date: string;
  rating: number;
  productName: string;
  reviewText: string;
  reply?: {
    storeName: string;
    date: string;
    text: string;
  };
}

export function StorefrontHub({
  businessName,
  storeSlug,
  fullStoreUrl,
  displayStoreUrl,
  state,
  city,
  returnPolicy: initialReturnPolicy,
  deliveryCoverage = "Lagos - Ikeja, Yaba and Lekki",
  activeProducts,
  hasActiveProducts,
  pendingBadgeCount = 0,
  initialView = "hub",
}: StorefrontHubProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Active view: "hub" | "share" | "delivery-returns" | "reviews"
  const urlView = (searchParams.get("view") as any) || initialView;
  const [currentView, setCurrentView] = useState<"hub" | "share" | "delivery-returns" | "reviews">(urlView);

  // Settings & Toggles
  const [showReviews, setShowReviews] = useState(true);
  const [returnPolicyText, setReturnPolicyText] = useState(
    initialReturnPolicy ||
      "Received a wrong, damaged or faulty item? Contact us on WhatsApp within 48 hours of delivery with your order number and photos. We’ll review the issue and agree a return, replacement or refund. Please keep the item and packaging while we resolve it. Change-of-mind requests are reviewed case by case. We’ll confirm any return delivery costs before you send an item back."
  );
  const [isSavingPolicy, setIsSavingPolicy] = useState(false);
  const [policySavedSuccess, setPolicySavedSuccess] = useState(false);

  // Share Screen State
  const [shareTab, setShareTab] = useState<"store" | "product">("product");
  const [selectedProductId, setSelectedProductId] = useState<string>(
    activeProducts[0]?.id || ""
  );
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedStoreLink, setCopiedStoreLink] = useState(false);

  // Reviews Screen State
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>([
    {
      id: "rev-1",
      customerName: "Amaka O.",
      verified: true,
      date: "12 Oct 2026",
      rating: 5,
      productName: activeProducts[0]?.name || "Everyday mini tote",
      reviewText:
        "The Cocoa colour is even lovelier in person. Fits my phone, wallet and keys without feeling bulky.",
      reply: undefined,
    },
    {
      id: "rev-2",
      customerName: "Chidi N.",
      verified: true,
      date: "8 Oct 2026",
      rating: 5,
      productName: activeProducts[0]?.name || "Everyday mini tote",
      reviewText: "Bought the Black one as a gift. Neat finishing and arrived well packed.",
      reply: {
        storeName: businessName,
        date: "9 Oct",
        text: "Thanks, Chidi. We hope they love their gift!",
      },
    },
  ]);
  const [draftReplyText, setDraftReplyText] = useState(
    "Thank you, Amaka! So glad your everyday essentials have a new home."
  );
  const [isPostingReply, setIsPostingReply] = useState(false);

  const selectedProduct =
    activeProducts.find((p) => p.id === selectedProductId) || activeProducts[0];

  const productPriceNaira = selectedProduct
    ? (Number(selectedProduct.priceKobo) / 100).toLocaleString("en-NG")
    : "18,500";

  const productUrl = `${displayStoreUrl}/p/${selectedProduct?.slug || "product"}`;
  const fullProductShareUrl = `${fullStoreUrl}/p/${selectedProduct?.slug || "product"}`;

  // Handlers
  const handleCopyLink = async (textToCopy: string, isStore = false) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      if (isStore) {
        setCopiedStoreLink(true);
        setTimeout(() => setCopiedStoreLink(false), 2500);
      } else {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      }
    } catch {
      // Fallback
    }
  };

  const handleSavePolicy = async () => {
    setIsSavingPolicy(true);
    setPolicySavedSuccess(false);
    try {
      const res = await fetch("/api/settings/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnPolicy: returnPolicyText }),
      });
      if (res.ok) {
        setPolicySavedSuccess(true);
        setTimeout(() => setPolicySavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Save policy error:", err);
    } finally {
      setIsSavingPolicy(false);
    }
  };

  const handlePostReply = (reviewId: string) => {
    if (!draftReplyText.trim()) return;
    setIsPostingReply(true);
    setTimeout(() => {
      setReviewsList((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? {
                ...r,
                reply: {
                  storeName: businessName,
                  date: "Today",
                  text: draftReplyText.trim(),
                },
              }
            : r
        )
      );
      setIsPostingReply(false);
      setDraftReplyText("");
    }, 400);
  };

  // Nav switcher helper
  const navigateView = (view: "hub" | "share" | "delivery-returns" | "reviews") => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] antialiased text-neutral-900 pb-28">
      <div className="w-full max-w-[430px] mx-auto px-4 pt-4 flex flex-col">
        {/* Top Header */}
        <header className="flex items-center justify-between py-2 mb-3">
          {currentView === "hub" ? (
            <div className="flex items-center justify-between w-full">
              <OndarLogo />
              <Link
                href="/more"
                className="text-xs font-bold text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                Done
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onClick={() => navigateView("hub")}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-700 hover:text-neutral-900 transition-colors py-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-neutral-600" />
                <span>Storefront</span>
              </button>
              <span className="text-xs font-bold text-neutral-400">
                {currentView === "share"
                  ? "Share"
                  : currentView === "delivery-returns"
                  ? "Delivery & returns"
                  : "Reviews"}
              </span>
            </div>
          )}
        </header>

        {/* ============================================================== */}
        {/* VIEW 1 & 2: HUB (SETUP INCOMPLETE vs. LIVE STOREFRONT) */}
        {/* ============================================================== */}
        {currentView === "hub" && (
          <>
            {!hasActiveProducts ? (
              /* SCREEN 1: Setup incomplete */
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] text-[11px] font-bold">
                    Setup incomplete
                  </span>
                  <h1 className="text-2xl font-black text-neutral-900 tracking-tight mt-2.5 leading-tight">
                    Your shop is one step away.
                  </h1>
                  <p className="text-xs text-neutral-500 mt-2 leading-relaxed font-normal">
                    Your storefront goes live automatically when your Business Profile and first active
                    product are ready.
                  </p>
                </div>

                {/* Card 1: YOUR STOREFRONT ADDRESS */}
                <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-2xs">
                  <p className="text-[11px] font-extrabold tracking-wider text-neutral-400 uppercase">
                    YOUR STOREFRONT ADDRESS
                  </p>
                  <p className="text-lg font-black text-neutral-900 mt-1 tracking-tight">
                    {displayStoreUrl}
                  </p>
                  <p className="text-xs text-neutral-400 mt-1 font-normal">
                    Reserved for your business. Not live yet.
                  </p>
                </div>

                {/* Card 2: Business Profile */}
                <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-neutral-900">Business Profile</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#E8F8EF] text-[#00A859] text-[11px] font-bold">
                      Ready
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-600 font-medium">
                      {businessName} · {state}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5 font-normal">
                      Business identity and contact details added.
                    </p>
                  </div>
                  <Link
                    href="/settings/profile"
                    className="pt-2 border-t border-neutral-100 flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-bold text-neutral-900 group-hover:text-[#00A859] transition-colors">
                        View Business Profile
                      </p>
                      <p className="text-[11px] text-neutral-400 font-normal mt-0.5">
                        Manage your identity and contact links
                      </p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-[#00A859] transition-colors flex-shrink-0" />
                  </Link>
                </div>

                {/* Card 3: First active product */}
                <div className="rounded-2xl border border-neutral-200/90 bg-white p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-neutral-900">First active product</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#D97706] text-[11px] font-bold">
                      To do
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 leading-relaxed font-normal">
                    Add a product in Inventory and make it active. Its images, price, variants and stock
                    will appear here automatically.
                  </p>
                  <Link
                    href="/inventory"
                    className="w-full py-3 px-4 rounded-xl bg-[#00A859] hover:bg-[#00964E] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Open Inventory</span>
                  </Link>
                </div>

                {/* Card 4: No publish button callout */}
                <div className="rounded-2xl border border-[#A7F3D0]/60 bg-[#ECFDF5] p-4 flex items-start gap-3 shadow-2xs">
                  <CheckCircle2 className="w-5 h-5 text-[#00A859] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-neutral-900 leading-snug">
                      No publish button. No waiting.
                    </p>
                    <p className="text-xs text-neutral-600 mt-1 leading-relaxed font-normal">
                      As soon as both requirements are met, your link is live. There’s no approval or
                      manual publishing step.
                    </p>
                  </div>
                </div>

                <p className="text-center text-xs text-neutral-400 pt-2 font-normal">
                  Your shop, your link, your rules.
                </p>
              </div>
            ) : (
              /* SCREEN 2: Live Storefront Hub */
              <div className="space-y-5 animate-in fade-in-50 duration-200">
                {/* Top Green Live Card */}
                <div className="rounded-3xl border border-[#A7F3D0]/70 bg-[#ECFDF5] p-5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#00A859] animate-pulse" />
                      <span className="text-xs font-bold text-[#00A859]">Live</span>
                    </div>
                    <span className="text-xs font-medium text-[#00A859]">Ready automatically</span>
                  </div>

                  <p className="text-xl font-black text-neutral-900 mt-2 tracking-tight">
                    {displayStoreUrl}
                  </p>
                  <p className="text-xs text-neutral-600 mt-0.5 font-normal">
                    Your storefront is ready for customers.
                  </p>

                  <div className="grid grid-cols-2 gap-2.5 mt-4">
                    <a
                      href={fullStoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-10 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-[#00A859] font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      <span>View store</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => navigateView("share")}
                      className="h-10 rounded-xl bg-[#00A859] hover:bg-[#00964E] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share link</span>
                    </button>
                  </div>
                </div>

                {/* Section: Your storefront */}
                <div>
                  <h2 className="text-sm font-bold text-neutral-900 mb-2">Your storefront</h2>
                  <div className="rounded-2xl border border-neutral-200/90 bg-white p-3.5 flex items-center gap-3.5 shadow-2xs">
                    <div className="w-14 h-14 rounded-xl bg-[#F4F4F4] overflow-hidden flex-shrink-0 flex items-center justify-center border border-neutral-100">
                      {activeProducts[0]?.images[0]?.url ? (
                        <img
                          src={activeProducts[0].images[0].url}
                          alt="Store template preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Store className="w-6 h-6 text-neutral-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-neutral-900">Ondar default</p>
                        <span className="px-2 py-0.5 rounded-md bg-[#E8F8EF] text-[#00A859] text-[10px] font-bold">
                          Free · In use
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-1 font-normal truncate">
                        One simple, mobile-first template.
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-2 px-1 leading-relaxed font-normal">
                    Presentation is separate from your products, orders, reviews and customers. Your
                    business data stays unchanged.
                  </p>
                </div>

                {/* Section: Customer reviews card */}
                <div className="rounded-2xl border border-neutral-200/90 bg-white divide-y divide-neutral-100 shadow-2xs overflow-hidden">
                  <div className="p-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-neutral-900">Show customer reviews</p>
                      <p className="text-xs text-neutral-400 font-normal mt-0.5">
                        Visible on your storefront
                      </p>
                    </div>
                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => setShowReviews(!showReviews)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        showReviews ? "bg-[#00A859]" : "bg-neutral-200"
                      }`}
                      role="switch"
                      aria-checked={showReviews}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                          showReviews ? "right-0.5" : "left-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigateView("reviews")}
                    className="w-full p-3.5 flex items-center justify-between hover:bg-neutral-50 transition-colors group cursor-pointer text-left"
                  >
                    <p className="text-sm font-bold text-neutral-900 group-hover:text-[#00A859] transition-colors">
                      Manage reviews & replies
                    </p>
                    <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors flex-shrink-0" />
                  </button>
                </div>

                {/* Section: Manage at the source */}
                <div>
                  <h2 className="text-sm font-bold text-neutral-900 mb-2">Manage at the source</h2>
                  <div className="rounded-2xl border border-neutral-200/90 bg-white divide-y divide-neutral-100 shadow-2xs overflow-hidden">
                    {/* Business Profile */}
                    <Link
                      href="/settings/profile"
                      className="p-3.5 flex items-center justify-between hover:bg-neutral-50 transition-colors group cursor-pointer"
                    >
                      <div>
                        <p className="text-sm font-bold text-neutral-900 group-hover:text-[#00A859] transition-colors">
                          Business Profile
                        </p>
                        <p className="text-xs text-neutral-400 font-normal mt-0.5">
                          Store name, identity and all contact links
                        </p>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-[#00A859] transition-colors flex-shrink-0" />
                    </Link>

                    {/* Inventory */}
                    <Link
                      href="/inventory"
                      className="p-3.5 flex items-center justify-between hover:bg-neutral-50 transition-colors group cursor-pointer"
                    >
                      <div>
                        <p className="text-sm font-bold text-neutral-900 group-hover:text-[#00A859] transition-colors">
                          Inventory
                        </p>
                        <p className="text-xs text-neutral-400 font-normal mt-0.5">
                          Products, categories, variants and stock
                        </p>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-[#00A859] transition-colors flex-shrink-0" />
                    </Link>

                    {/* Delivery & returns */}
                    <button
                      type="button"
                      onClick={() => navigateView("delivery-returns")}
                      className="w-full p-3.5 flex items-center justify-between hover:bg-neutral-50 transition-colors group cursor-pointer text-left"
                    >
                      <div>
                        <p className="text-sm font-bold text-neutral-900 group-hover:text-[#00A859] transition-colors">
                          Delivery & returns
                        </p>
                        <p className="text-xs text-neutral-400 font-normal mt-0.5">
                          Shipping information and your return policy
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors flex-shrink-0" />
                    </button>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-2 px-1 leading-relaxed font-normal">
                    Changes to Business Profile and Inventory are reflected here automatically. No
                    separate storefront product copies.
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* ============================================================== */}
        {/* VIEW 3: SCREEN 3: SHARE LINK */}
        {/* ============================================================== */}
        {currentView === "share" && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            <p className="text-xs text-neutral-500 leading-relaxed font-normal">
              Send your whole shop or a specific product. Customers can shop straight from their browser.
            </p>

            {/* Segmented Control */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-neutral-100/80 border border-neutral-200/80">
              <button
                type="button"
                onClick={() => setShareTab("store")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  shareTab === "store"
                    ? "bg-white text-neutral-900 shadow-2xs border border-neutral-200/60"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                Whole store
              </button>
              <button
                type="button"
                onClick={() => setShareTab("product")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  shareTab === "product"
                    ? "bg-[#E8F8EF] text-[#00A859] shadow-2xs border border-[#A7F3D0]/60"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                A product
              </button>
            </div>

            {shareTab === "product" ? (
              /* A Product Tab */
              <div className="space-y-4">
                {/* Product to share selector */}
                <div>
                  <label className="block text-xs font-bold text-neutral-900 mb-1.5">
                    Product to share
                  </label>
                  <div className="relative">
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full p-3 rounded-xl border border-neutral-200 bg-white text-xs font-bold text-neutral-900 appearance-none focus:outline-none focus:border-[#00A859] pr-8 shadow-2xs"
                    >
                      {activeProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <ChevronRight className="w-4 h-4 text-neutral-400 absolute right-3 top-3.5 rotate-90 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1 font-normal">
                    Choose from your active Inventory products.
                  </p>
                </div>

                {/* Product link */}
                <div>
                  <label className="block text-xs font-bold text-neutral-900 mb-1.5">Product link</label>
                  <div className="p-3 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-800 font-mono select-all break-all shadow-2xs">
                    {productUrl}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyLink(fullProductShareUrl, false)}
                    className="w-full mt-2.5 py-2.5 px-4 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900 text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-4 h-4 text-[#00A859] stroke-[3]" />
                        <span className="text-[#00A859]">Copied link!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-neutral-500" />
                        <span>Copy product link</span>
                      </>
                    )}
                  </button>
                </div>

                {/* What customers will see Preview Card */}
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 mb-2">What customers will see</h3>
                  <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-2xs">
                    <div className="w-full h-48 bg-[#F5F5F5] overflow-hidden flex items-center justify-center">
                      {selectedProduct?.images[0]?.url ? (
                        <img
                          src={selectedProduct.images[0].url}
                          alt={selectedProduct.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-10 h-10 text-neutral-300" />
                      )}
                    </div>
                    <div className="p-3.5 space-y-1">
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        {displayStoreUrl.toUpperCase()}
                      </p>
                      <p className="text-sm font-bold text-neutral-900 leading-snug">
                        {selectedProduct?.name} | {businessName}
                      </p>
                      <p className="text-sm font-black text-neutral-900">₦{productPriceNaira}</p>
                      <p className="text-xs text-neutral-500 font-normal leading-relaxed truncate">
                        {selectedProduct?.description || "Your everyday essentials, neatly carried."}
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1.5 px-1 font-normal">
                    Illustrative rich preview for WhatsApp, X and Facebook.
                  </p>
                </div>

                {/* Share action buttons */}
                <div className="space-y-2 pt-1">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `Check out ${selectedProduct?.name} from ${businessName}: ${fullProductShareUrl}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-11 rounded-xl bg-[#00A859] hover:bg-[#00964E] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Share on WhatsApp</span>
                  </a>

                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        `Shop ${selectedProduct?.name} on ${businessName}: ${fullProductShareUrl}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-10 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <span>Share on X</span>
                    </a>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                        fullProductShareUrl
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-10 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <span>Facebook</span>
                    </a>
                  </div>
                </div>

                {/* Bottom Fallback Card */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-3.5 space-y-2.5 shadow-2xs">
                  <p className="text-xs font-bold text-neutral-900">Sharing the whole store instead?</p>
                  <div>
                    <p className="text-xs font-semibold text-neutral-800">
                      {businessName} | Shop bags & everyday accessories
                    </p>
                    <p className="text-[11px] text-neutral-400">{displayStoreUrl}</p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 overflow-hidden flex-shrink-0">
                      {activeProducts[0]?.images[0]?.url ? (
                        <img
                          src={activeProducts[0].images[0].url}
                          alt="Cover"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Store className="w-5 h-5 text-neutral-400 m-auto mt-2.5" />
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400 font-normal leading-tight">
                      Store title and catalogue cover image. No single storewide price.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyLink(fullStoreUrl, true)}
                    className="w-full py-2 px-3 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    {copiedStoreLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#00A859] stroke-[3]" />
                        <span className="text-[#00A859]">Copied store link!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Copy store link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Whole Store Tab */
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-900 mb-1.5">Store link</label>
                  <div className="p-3 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-800 font-mono select-all break-all shadow-2xs">
                    {displayStoreUrl}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyLink(fullStoreUrl, true)}
                    className="w-full mt-2.5 py-2.5 px-4 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-900 text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
                  >
                    {copiedStoreLink ? (
                      <>
                        <Check className="w-4 h-4 text-[#00A859] stroke-[3]" />
                        <span className="text-[#00A859]">Copied store link!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-neutral-500" />
                        <span>Copy store link</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Store Social Preview */}
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 mb-2">What customers will see</h3>
                  <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-2xs">
                    <div className="w-full h-44 bg-[#F5F5F5] overflow-hidden flex items-center justify-center">
                      {activeProducts[0]?.images[0]?.url ? (
                        <img
                          src={activeProducts[0].images[0].url}
                          alt={businessName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Store className="w-10 h-10 text-neutral-300" />
                      )}
                    </div>
                    <div className="p-3.5 space-y-1">
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        {displayStoreUrl.toUpperCase()}
                      </p>
                      <p className="text-sm font-bold text-neutral-900 leading-snug">
                        {businessName} | Verified Store
                      </p>
                      <p className="text-xs text-neutral-500 font-normal leading-relaxed">
                        Shop our latest collection online. Fast dispatch across Nigeria.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `Check out my store ${businessName}: ${fullStoreUrl}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-11 rounded-xl bg-[#00A859] hover:bg-[#00964E] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Share on WhatsApp</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 4: SCREEN 4: DELIVERY & RETURNS */}
        {/* ============================================================== */}
        {currentView === "delivery-returns" && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            <div>
              <h2 className="text-base font-bold text-neutral-900">Delivery information</h2>
              <div className="mt-2.5 rounded-2xl border border-neutral-200/90 bg-white p-4 space-y-2.5 shadow-2xs">
                <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-500 text-[10px] font-bold">
                  From Shipping · Read only
                </span>
                <p className="text-sm font-bold text-neutral-900">{state} delivery</p>
                <p className="text-xs text-neutral-600 leading-relaxed font-normal whitespace-pre-line">
                  {state} delivery · ₦2,500{"\n"}
                  Estimated 2–4 business days after payment. Delivery area and cost are confirmed from
                  your address at checkout.
                </p>
                <Link
                  href="/settings/profile"
                  className="pt-2 border-t border-neutral-100 flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-bold text-neutral-900 group-hover:text-[#00A859] transition-colors">
                      Edit in Shipping
                    </p>
                    <p className="text-[11px] text-neutral-400 font-normal">
                      Areas, rates and delivery estimates
                    </p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-[#00A859] transition-colors flex-shrink-0" />
                </Link>
              </div>
              <p className="text-[11px] text-neutral-400 mt-2 px-1 leading-relaxed font-normal">
                This summary is generated from Shipping settings. Customers see the same information on
                your store and at checkout.
              </p>
            </div>

            {/* Return policy section */}
            <div className="pt-2">
              <h2 className="text-base font-bold text-neutral-900">Return policy</h2>
              <p className="text-xs text-neutral-400 mt-0.5 font-normal">
                Plain language, visible to customers before they buy.
              </p>

              <div className="mt-3">
                <label className="block text-xs font-bold text-neutral-900 mb-1.5">Policy text</label>
                <textarea
                  rows={6}
                  value={returnPolicyText}
                  onChange={(e) => setReturnPolicyText(e.target.value)}
                  className="w-full p-3.5 rounded-2xl border border-neutral-200 bg-white text-neutral-900 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859] shadow-2xs resize-none"
                />
              </div>

              {/* Review before saving card */}
              <div className="mt-3 rounded-2xl border border-[#FDE68A] bg-[#FEF9C3] p-3.5 flex items-start gap-3 shadow-2xs">
                <Info className="w-4 h-4 text-[#B45309] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-[#92400E]">Review before saving</p>
                  <p className="text-[11px] text-[#A16207] mt-0.5 leading-relaxed font-normal">
                    This is a sample default policy. Confirm it matches how your business handles issues
                    before approving it for your store.
                  </p>
                </div>
              </div>

              {/* Approve & save policy CTA */}
              <button
                type="button"
                onClick={handleSavePolicy}
                disabled={isSavingPolicy}
                className="w-full mt-4 h-12 rounded-xl bg-[#00A859] hover:bg-[#00964E] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer disabled:opacity-60"
              >
                {isSavingPolicy ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving policy...</span>
                  </>
                ) : policySavedSuccess ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Policy approved & saved!</span>
                  </>
                ) : (
                  <span>Approve & save policy</span>
                )}
              </button>
              <p className="text-[11px] text-neutral-400 mt-2 px-1 leading-relaxed font-normal">
                Saving updates the policy customers see. It does not change your Shipping settings.
              </p>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 5: SCREEN 5: MANAGE REVIEWS & REPLIES */}
        {/* ============================================================== */}
        {currentView === "reviews" && (
          <div className="space-y-4 animate-in fade-in-50 duration-200">
            {/* Top Toggle Card */}
            <div className="rounded-2xl border border-neutral-200/90 bg-white p-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-neutral-900">Show customer reviews</p>
                  <p className="text-xs text-neutral-400 font-normal mt-0.5">
                    Visible on your storefront
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReviews(!showReviews)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    showReviews ? "bg-[#00A859]" : "bg-neutral-200"
                  }`}
                  role="switch"
                  aria-checked={showReviews}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                      showReviews ? "right-0.5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
              <p className="text-[11px] text-neutral-400 mt-2.5 pt-2.5 border-t border-neutral-100 leading-relaxed font-normal">
                Switching off hides the review section on your storefront. Reviews and replies are kept,
                not deleted. You can show them again.
              </p>
            </div>

            {/* Product Header & Rating */}
            <div className="flex items-center justify-between pt-1">
              <h2 className="text-sm font-bold text-neutral-900 truncate pr-2">
                {activeProducts[0]?.name || "Everyday mini tote"}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-[11px] font-bold flex items-center gap-1 flex-shrink-0">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>4.8 · 12 reviews</span>
              </span>
            </div>

            {/* Reviews List */}
            <div className="space-y-3.5">
              {reviewsList.map((review) => (
                <div
                  key={review.id}
                  className="rounded-2xl border border-neutral-200/90 bg-white p-4 space-y-2.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-neutral-900">{review.customerName}</p>
                      <p className="text-[10px] text-neutral-400">
                        {review.date} {review.productName ? `· ${review.productName}` : ""}
                      </p>
                    </div>
                    {review.verified && (
                      <span className="px-2 py-0.5 rounded-full bg-[#E8F8EF] text-[#00A859] text-[10px] font-bold flex items-center gap-1">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                        <span>Verified purchase</span>
                      </span>
                    )}
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>

                  <p className="text-xs text-neutral-700 leading-relaxed font-normal">
                    {review.reviewText}
                  </p>

                  {/* Public Reply Thread */}
                  {review.reply ? (
                    <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-3 space-y-1 mt-2">
                      <p className="text-[11px] font-bold text-neutral-900">
                        {review.reply.storeName} replied · {review.reply.date}
                      </p>
                      <p className="text-xs text-neutral-600 font-normal leading-relaxed">
                        {review.reply.text}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-2 border-t border-neutral-100">
                      <label className="block text-xs font-bold text-neutral-900">
                        Your public reply
                      </label>
                      <textarea
                        rows={2}
                        value={draftReplyText}
                        onChange={(e) => setDraftReplyText(e.target.value)}
                        placeholder="Write a reply to your customer..."
                        className="w-full p-2.5 rounded-xl border border-neutral-200 bg-white text-xs leading-relaxed focus:outline-none focus:border-[#00A859] resize-none"
                      />
                      <p className="text-[11px] text-neutral-400 font-normal">
                        Your reply appears with your store name.
                      </p>
                      <button
                        type="button"
                        onClick={() => handlePostReply(review.id)}
                        disabled={isPostingReply || !draftReplyText.trim()}
                        className="w-full py-2.5 rounded-xl bg-[#00A859] hover:bg-[#00964E] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isPostingReply ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Posting reply...</span>
                          </>
                        ) : (
                          <span>Post public reply</span>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Integrity Notice Card */}
            <div className="rounded-2xl border border-[#A7F3D0]/60 bg-[#ECFDF5] p-4 flex items-start gap-3 shadow-2xs">
              <CheckCircle2 className="w-5 h-5 text-[#00A859] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-neutral-900 leading-snug">
                  Real customers. Public feedback.
                </p>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed font-normal">
                  Only paid-order customers can review from their private order link after completion. You
                  can reply, but cannot edit or delete their review.
                </p>
              </div>
            </div>

            <p className="text-[11px] text-neutral-400 px-1 leading-relaxed font-normal text-center">
              Public reviews show the customer’s first name and surname initial, rating, text and purchase
              mark. Phone numbers, addresses and order links stay private.
            </p>
          </div>
        )}
      </div>

      {/* 5-Tab Merchant Bottom Nav */}
      <MerchantBottomNav active="more" pendingBadgeCount={pendingBadgeCount} />
    </div>
  );
}
