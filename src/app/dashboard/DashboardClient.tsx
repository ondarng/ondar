"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { OndarLogo } from "@/components/OndarLogo";
import { MerchantBottomNav } from "@/components/merchant/MerchantBottomNav";
import { NotificationsModal } from "@/components/merchant/NotificationsModal";
import { StoreLiveIllustration } from "@/components/StoreLiveIllustration";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Eye,
  Share2,
  Store,
  Wallet,
  Package,
  TrendingUp,
  Info,
  BarChart2,
  Zap,
  ShoppingBag,
  AlertTriangle,
  AlertCircle,
  CreditCard,
  Clock,
  Plus,
  ClipboardList,
  Boxes,
  Link2,
  Settings,
  Check,
  Copy,
  X,
  Upload,
  Loader2,
  LogOut,
  Calendar,
  CheckCircle2,
} from "lucide-react";

export interface AttentionItem {
  id: string;
  type: "payment_pending" | "low_stock" | "stale_order";
  title: string;
  subtitle: string;
  badge: string;
  badgeType: "warning" | "danger" | "info";
}

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  priceKobo: string;
  stockOnHand: number;
  status: string;
  images: { url: string }[];
}

interface DashboardMetrics {
  paidSales: number;
  paidOrdersCount: number;
  salesGrowthPct: number;
  ordersGrowthPct: number;
  estProfit: number;
  pendingPayments: number;
  pendingOrdersCount: number;
  todaySales: number;
  todayTransactionsCount: number;
  newOrdersTodayCount: number;
  lowStockCount: number;
}

interface ChartItem {
  label: string;
  value: number;
}

export interface PeriodStats {
  paidSales: number;
  paidOrdersCount: number;
  estProfit: number;
  transactionsCount: number;
  growthPct: number;
}

interface DashboardClientProps {
  merchantName: string;
  merchantInitial: string;
  merchantEmail: string;
  businessName: string;
  slug: string;
  fullStoreUrl: string;
  displayStoreUrl: string;
  formattedDate: string;
  metrics: DashboardMetrics;
  periodHistory?: Record<"today" | "yesterday" | "7d" | "30d" | "all", PeriodStats>;
  charts: {
    chart7D: ChartItem[];
    chart30D: ChartItem[];
    chart90D: ChartItem[];
  };
  attentionItems: AttentionItem[];
  products: ProductItem[];
  totalProductsCount: number;
}

export function DashboardClient({
  merchantName,
  merchantInitial,
  merchantEmail,
  businessName,
  slug,
  fullStoreUrl,
  displayStoreUrl,
  formattedDate,
  metrics,
  periodHistory,
  charts,
  attentionItems,
  products: initialProducts,
  totalProductsCount,
}: DashboardClientProps) {
  const router = useRouter();

  // Store link client-side adaptation (handles preview, custom domain, and staging)
  const [effectiveFullUrl, setEffectiveFullUrl] = useState(fullStoreUrl);
  const [effectiveDisplayUrl, setEffectiveDisplayUrl] = useState(displayStoreUrl);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.host) {
      const host = window.location.host;
      const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
      const isStaging = host.includes("vercel.app") || host.includes("netlify.app");
      const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "ondar.ng";
      const supportsSub =
        !isLocal && !isStaging && (host === rootDomain || host.endsWith(`.${rootDomain}`));
      if (!supportsSub) {
        setEffectiveFullUrl(`${window.location.protocol}//${host}/s/${slug}`);
        setEffectiveDisplayUrl(`${host}/s/${slug}`);
      }
    }
  }, [slug]);

  // Real-time auto-refresh every 15s to catch new orders
  useEffect(() => {
    const timer = setInterval(() => {
      router.refresh();
    }, 15000);
    return () => clearInterval(timer);
  }, [router]);

  // Timeline / Date filter for past days & history
  const [selectedPeriod, setSelectedPeriod] = useState<
    "today" | "yesterday" | "7d" | "30d" | "all"
  >("today");
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);

  const periodLabels: Record<string, string> = {
    today: "Today",
    yesterday: "Yesterday",
    "7d": "Last 7 Days",
    "30d": "Last 30 Days",
    all: "All Time",
  };

  const periodTitles: Record<string, string> = {
    today: "Today at a glance",
    yesterday: "Yesterday at a glance",
    "7d": "Last 7 days performance",
    "30d": "Last 30 days performance",
    all: "All time performance",
  };

  const activePeriodStats = useMemo(() => {
    if (periodHistory && periodHistory[selectedPeriod]) {
      return periodHistory[selectedPeriod];
    }
    if (selectedPeriod === "today") {
      return {
        paidSales: metrics.todaySales,
        paidOrdersCount: metrics.todayTransactionsCount,
        estProfit: Math.round(metrics.todaySales * 0.99),
        transactionsCount: metrics.todayTransactionsCount,
        growthPct: metrics.salesGrowthPct,
      };
    }
    return {
      paidSales: metrics.paidSales,
      paidOrdersCount: metrics.paidOrdersCount,
      estProfit: metrics.estProfit,
      transactionsCount: metrics.paidOrdersCount,
      growthPct: metrics.salesGrowthPct,
    };
  }, [periodHistory, selectedPeriod, metrics]);

  // Chart Period Filter (7D, 30D, 90D)
  const [chartPeriod, setChartPeriod] = useState<"7D" | "30D" | "90D">("7D");
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(6); // Default highlight latest day

  // User Dropdown Menu
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Notifications Modal
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Share Modal
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Add Product Modal
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductStock, setNewProductStock] = useState("10");
  const [newProductPhoto, setNewProductPhoto] = useState<string | null>(null);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [addProductError, setAddProductError] = useState<string | null>(null);
  const [productsList, setProductsList] = useState<ProductItem[]>(initialProducts);

  // Get dynamic greeting based on current hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const activeChartData =
    chartPeriod === "7D" ? charts.chart7D : chartPeriod === "30D" ? charts.chart30D : charts.chart90D;

  // Compute dynamic chart scale based on actual values
  const maxChartVal = Math.max(...activeChartData.map((d) => d.value), 10000);
  const yAxisTicks = [
    Math.round(maxChartVal),
    Math.round(maxChartVal * 0.6),
    Math.round(maxChartVal * 0.2),
    0,
  ];

  const formatTick = (val: number) => {
    if (val === 0) return "₦0";
    if (val >= 1000) return `₦${Math.round(val / 1000)}k`;
    return `₦${val}`;
  };

  // Handle Copy Store Link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(effectiveFullUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  // Handle Share Store Link
  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: businessName,
          text: `Check out ${businessName} on Ondar!`,
          url: effectiveFullUrl,
        });
        return;
      } catch {
        // Fallback to modal if cancelled or unsupported
      }
    }
    setIsShareModalOpen(true);
  };

  // Handle Logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      setIsLoggingOut(false);
    }
  };

  // Handle Image Upload for New Product
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setAddProductError("Image size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setNewProductPhoto(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle Add Product Submit
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddProductError(null);
    setIsSubmittingProduct(true);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProductName,
          priceNaira: newProductPrice,
          stockQuantity: newProductStock,
          photoUrl: newProductPhoto,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setAddProductError(data.error || "Failed to add product.");
        return;
      }

      setProductsList((prev) => [data.product, ...prev]);
      setIsAddProductOpen(false);
      setNewProductName("");
      setNewProductPrice("");
      setNewProductStock("10");
      setNewProductPhoto(null);
      router.refresh();
    } catch {
      setAddProductError("Network error. Please try again.");
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  const totalPendingBadgeCount = metrics.pendingOrdersCount + metrics.newOrdersTodayCount;

  return (
    <div className="min-h-screen bg-[#F8F9FA] antialiased selection:bg-[#00A859]/20 selection:text-[#00A859] relative pb-28">
      {/* Outer Mobile Frame Container */}
      <div className="w-full max-w-[430px] mx-auto px-4 pt-3 flex flex-col">
        {/* ============================================================== */}
        {/* TOP APP BAR / HEADER */}
        {/* ============================================================== */}
        <header className="flex items-center justify-between py-3 mb-4">
          <OndarLogo />

          <div className="flex items-center gap-2.5 relative">
            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(true)}
              className="p-2 rounded-full hover:bg-neutral-100 transition-colors text-neutral-800 relative cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-neutral-800" />
              {attentionItems.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-500 absolute top-1.5 right-1.5 border border-white" />
              )}
            </button>

            {/* User Profile Avatar with dropdown trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1 p-1 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
                aria-label="User menu"
              >
                <div className="w-8 h-8 rounded-full bg-[#064E3B] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {merchantInitial}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-600" />
              </button>

              {/* User Dropdown Popover */}
              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-11 z-50 w-56 rounded-2xl bg-white border border-neutral-200/80 shadow-xl py-2 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2 border-b border-neutral-100">
                      <p className="text-xs font-bold text-neutral-900 truncate">{businessName}</p>
                      <p className="text-[11px] text-neutral-500 truncate">{merchantEmail}</p>
                    </div>

                    <Link
                      href="/settings/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full px-4 py-2.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-neutral-500" />
                      <span>Business Profile</span>
                    </Link>

                    <Link
                      href="/settings/payouts/reauth/password"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full px-4 py-2.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 transition-colors"
                    >
                      <Wallet className="w-4 h-4 text-neutral-500" />
                      <span>Payout Settings</span>
                    </Link>

                    <Link
                      href="/settings/payments"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full px-4 py-2.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 transition-colors"
                    >
                      <CreditCard className="w-4 h-4 text-neutral-500" />
                      <span>Paystack Gateway (BYOK)</span>
                    </Link>

                    <a
                      href={effectiveFullUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full px-4 py-2.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-neutral-500" />
                      <span>View Storefront</span>
                    </a>

                    <div className="border-t border-neutral-100 mt-1 pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        {isLoggingOut ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <LogOut className="w-4 h-4 text-red-600" />
                        )}
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* ============================================================== */}
        {/* GREETING HEADER */}
        {/* ============================================================== */}
        <section className="mb-5">
          <h1 className="text-[26px] leading-tight font-black tracking-tight text-neutral-900 flex items-center gap-1.5">
            <span>{getGreeting()}, {merchantName}</span>
            <span className="text-2xl">👋</span>
          </h1>
          <p className="text-[13px] text-neutral-500 font-normal mt-0.5">
            Here’s what’s happening with your store today.
          </p>
        </section>

        {/* ============================================================== */}
        {/* "YOUR STORE IS LIVE" HERO CARD */}
        {/* ============================================================== */}
        <section className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-3xl p-4.5 mb-6 relative overflow-hidden shadow-2xs">
          <div className="flex items-start justify-between relative z-10">
            <div className="flex-1 pr-2">
              {/* Badge & Title */}
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-xl bg-[#D1FAE5] text-[#059669]">
                  <Store className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-neutral-900">Your store is live</span>
                  <span className="w-2 h-2 rounded-full bg-[#10B981] inline-block animate-pulse" />
                </div>
              </div>

              <p className="text-xs text-neutral-600 font-normal mb-2.5 pl-0.5">
                Share your link and start selling.
              </p>

              {/* URL Display Link */}
              <a
                href={effectiveFullUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00A859] hover:underline mb-4 pl-0.5"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>{effectiveDisplayUrl}</span>
                <ExternalLink className="w-3 h-3 text-[#00A859]" />
              </a>

              {/* Action Buttons: Preview Store & Share Link */}
              <div className="flex items-center gap-2">
                <a
                  href={effectiveFullUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2.5 rounded-xl bg-white border border-[#00A859] text-[#00A859] hover:bg-emerald-50 text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs transition-all active:scale-[0.98]"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview store</span>
                </a>

                <button
                  type="button"
                  onClick={handleShare}
                  className="px-4 py-2.5 rounded-xl bg-[#00A859] hover:bg-[#00964E] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share link</span>
                </button>
              </div>
            </div>

            {/* Illustration on Right Side */}
            <div className="w-24 h-24 flex-shrink-0 flex items-center justify-center -mr-1 -mt-1 pointer-events-none">
              <StoreLiveIllustration className="w-24 h-24" />
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* "TODAY AT A GLANCE" SECTION */}
        {/* ============================================================== */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-neutral-900 tracking-tight">
              {periodTitles[selectedPeriod]}
            </h2>

            {/* Interactive Date Pill Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-neutral-200 bg-white text-[11px] font-bold text-neutral-700 shadow-2xs hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                <Calendar className="w-3 h-3 text-[#00A859]" />
                <span>{periodLabels[selectedPeriod]}</span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {isDateFilterOpen && (
                <div className="absolute right-0 top-full mt-1.5 z-30 w-44 bg-white rounded-xl border border-neutral-200 shadow-lg py-1 text-xs">
                  {(["today", "yesterday", "7d", "30d", "all"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setSelectedPeriod(p);
                        setIsDateFilterOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left font-bold transition-colors flex items-center justify-between cursor-pointer ${
                        selectedPeriod === p
                          ? "text-[#00A859] bg-[#E8F8EF]"
                          : "text-neutral-700 hover:bg-neutral-50"
                      }`}
                    >
                      <span>{periodLabels[p]}</span>
                      {selectedPeriod === p && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#00A859]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 4 Metric Cards Horizontal Carousel */}
          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none snap-x">
            {/* Card 1: Paid sales */}
            <div className="min-w-[145px] flex-1 p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs snap-start flex flex-col justify-between">
              <div>
                <div className="w-7 h-7 rounded-lg bg-[#ECFDF5] text-[#00A859] flex items-center justify-center mb-2">
                  <Wallet className="w-4 h-4" />
                </div>
                <p className="text-[11px] font-medium text-neutral-500">Paid sales</p>
                <p className="text-lg font-black text-neutral-900 tracking-tight mt-0.5">
                  ₦{activePeriodStats.paidSales.toLocaleString("en-NG")}
                </p>
              </div>
              <div className="mt-2.5 flex items-center gap-1 text-[11px]">
                {activePeriodStats.growthPct > 0 ? (
                  <>
                    <span className="font-bold text-[#00A859]">↑ {activePeriodStats.growthPct}%</span>
                    <span className="text-neutral-400 text-[10px]">vs. 7d</span>
                  </>
                ) : (
                  <span className="text-neutral-400 text-[10px]">
                    {selectedPeriod === "today" ? "today" : periodLabels[selectedPeriod].toLowerCase()}
                  </span>
                )}
              </div>
            </div>

            {/* Card 2: Orders */}
            <div className="min-w-[130px] flex-1 p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs snap-start flex flex-col justify-between">
              <div>
                <div className="w-7 h-7 rounded-lg bg-[#ECFDF5] text-[#00A859] flex items-center justify-center mb-2">
                  <Package className="w-4 h-4" />
                </div>
                <p className="text-[11px] font-medium text-neutral-500">Orders</p>
                <p className="text-lg font-black text-neutral-900 tracking-tight mt-0.5">
                  {activePeriodStats.paidOrdersCount}
                </p>
              </div>
              <div className="mt-2.5 flex items-center gap-1 text-[11px]">
                <span className="text-neutral-400 text-[10px]">
                  {activePeriodStats.paidOrdersCount} completed
                </span>
              </div>
            </div>

            {/* Card 3: Est. profit */}
            <div className="min-w-[155px] flex-1 p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs snap-start flex flex-col justify-between">
              <div>
                <div className="w-7 h-7 rounded-lg bg-[#ECFDF5] text-[#00A859] flex items-center justify-center mb-2">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-1">
                  <p className="text-[11px] font-medium text-neutral-500">Est. profit</p>
                  <Info className="w-3 h-3 text-neutral-400" />
                </div>
                <p className="text-lg font-black text-neutral-900 tracking-tight mt-0.5">
                  ₦{activePeriodStats.estProfit.toLocaleString("en-NG")}
                </p>
                <p className="text-[10px] text-neutral-400">(99% payout split)</p>
              </div>
              <div className="mt-1.5 flex items-center gap-1 text-[11px]">
                <span className="font-bold text-[#00A859]">
                  {activePeriodStats.paidSales > 0 ? "Active" : "—"}
                </span>
              </div>
            </div>

            {/* Card 4: Pending payments */}
            <div className="min-w-[145px] flex-1 p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs snap-start flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="w-7 h-7 rounded-lg bg-[#ECFDF5] text-[#00A859] flex items-center justify-center mb-2">
                  <CreditCard className="w-4 h-4" />
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-neutral-500">Pending payments</p>
                <p className="text-lg font-black text-neutral-900 tracking-tight mt-0.5">
                  ₦{metrics.pendingPayments.toLocaleString("en-NG")}
                </p>
                <p className="text-[10px] text-neutral-400">
                  {metrics.pendingOrdersCount} order{metrics.pendingOrdersCount === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* "SALES OVERVIEW" CHART CARD */}
        {/* ============================================================== */}
        <section className="bg-white border border-neutral-200/80 rounded-3xl p-4.5 mb-6 shadow-2xs">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[#00A859]" />
              <h3 className="text-sm font-bold text-neutral-900">Sales overview</h3>
            </div>

            {/* Period Switcher Pills */}
            <div className="flex items-center bg-neutral-100 p-0.5 rounded-full">
              {(["7D", "30D", "90D"] as const).map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => {
                    setChartPeriod(period);
                    setActiveBarIndex(null);
                  }}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                    chartPeriod === period
                      ? "bg-[#00A859] text-white shadow-2xs"
                      : "text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Bar Chart */}
          <div className="relative pt-4 pb-2">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[9px] text-neutral-400 pl-1 pr-1 pb-6">
              {yAxisTicks.map((tick, i) => (
                <div key={i} className="flex items-center gap-2 border-b border-neutral-100 pb-1">
                  <span className="w-9 font-medium text-right pr-1">{formatTick(tick)}</span>
                  <div className="flex-1 border-b border-dashed border-neutral-200" />
                </div>
              ))}
            </div>

            {/* Bars Column */}
            <div className="h-36 pl-11 flex items-end justify-between gap-2 relative z-10">
              {activeChartData.map((bar, idx) => {
                const isActive = activeBarIndex === idx;
                const heightPct =
                  bar.value > 0
                    ? Math.max(10, Math.round((bar.value / maxChartVal) * 90))
                    : 6; // Clean baseline pill when 0

                return (
                  <div
                    key={bar.label}
                    onClick={() => setActiveBarIndex(idx)}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                  >
                    {/* Tooltip on Active */}
                    {isActive && (
                      <div className="absolute -top-1 bg-neutral-900 text-white text-[10px] font-bold py-0.5 px-2 rounded-md shadow-md animate-in fade-in duration-150 pointer-events-none z-20">
                        ₦{bar.value.toLocaleString("en-NG")}
                      </div>
                    )}

                    {/* Bar Pill */}
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${
                        bar.value > 0
                          ? isActive
                            ? "bg-[#00A859] shadow-sm scale-y-[1.02]"
                            : "bg-[#00A859]/80 hover:bg-[#00A859]"
                          : isActive
                          ? "bg-neutral-300"
                          : "bg-neutral-200 hover:bg-neutral-300"
                      }`}
                    />

                    {/* X-axis date label */}
                    <span
                      className={`text-[10px] mt-2 transition-colors ${
                        isActive ? "font-bold text-neutral-900" : "text-neutral-400 font-medium"
                      }`}
                    >
                      {bar.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* "QUICK STATS" SECTION */}
        {/* ============================================================== */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-[#00A859]" />
            <h2 className="text-sm font-bold text-neutral-900">Quick stats</h2>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {/* Card 1: Payments today */}
            <div className="p-3 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div className="w-6 h-6 rounded-lg bg-[#ECFDF5] text-[#00A859] flex items-center justify-center">
                  <Wallet className="w-3.5 h-3.5" />
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
              </div>
              <div>
                <p className="text-[10px] text-neutral-500 font-medium leading-tight">Payments today</p>
                <p className="text-sm font-black text-neutral-900 mt-0.5">
                  ₦{metrics.todaySales.toLocaleString("en-NG")}
                </p>
                <p className="text-[10px] text-neutral-400 mt-0.5">
                  {metrics.todayTransactionsCount} transaction{metrics.todayTransactionsCount === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            {/* Card 2: New orders */}
            <div className="p-3 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div className="w-6 h-6 rounded-lg bg-[#ECFDF5] text-[#00A859] flex items-center justify-center">
                  <ShoppingBag className="w-3.5 h-3.5" />
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
              </div>
              <div>
                <p className="text-[10px] text-neutral-500 font-medium leading-tight">New orders</p>
                <p className="text-sm font-black text-neutral-900 mt-0.5">
                  {metrics.newOrdersTodayCount}
                </p>
                <p className="text-[10px] text-neutral-400 mt-0.5">View orders</p>
              </div>
            </div>

            {/* Card 3: Low stock */}
            <div className="p-3 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    metrics.lowStockCount > 0
                      ? "bg-[#FEF3C7] text-amber-600"
                      : "bg-[#ECFDF5] text-[#00A859]"
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
              </div>
              <div>
                <p className="text-[10px] text-neutral-500 font-medium leading-tight">Low-stock items</p>
                <p className="text-sm font-black text-neutral-900 mt-0.5">
                  {metrics.lowStockCount}
                </p>
                <p className="text-[10px] text-neutral-400 mt-0.5">
                  {metrics.lowStockCount > 0 ? "Needs restock" : "Stock healthy"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* "NEEDS YOUR ATTENTION" ALERT SECTION */}
        {/* ============================================================== */}
        <section
          className={`rounded-3xl p-4.5 mb-6 shadow-2xs border ${
            attentionItems.length > 0
              ? "bg-[#FFFBEB] border-amber-200/80"
              : "bg-[#ECFDF5] border-emerald-200/80"
          }`}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3.5">
            <div className="flex items-start gap-2.5">
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center mt-0.5 ${
                  attentionItems.length > 0
                    ? "bg-amber-500 text-white"
                    : "bg-[#10B981] text-white"
                }`}
              >
                {attentionItems.length > 0 ? (
                  <AlertCircle className="w-4 h-4" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-neutral-900">
                    {attentionItems.length > 0 ? "Needs your attention" : "All caught up!"}
                  </h3>
                  <span
                    className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${
                      attentionItems.length > 0
                        ? "bg-[#FEF08A] text-amber-900"
                        : "bg-[#D1FAE5] text-[#065F46]"
                    }`}
                  >
                    {attentionItems.length}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {attentionItems.length > 0
                    ? "Keep your store running smoothly."
                    : "Your store is running smoothly with no pending alerts."}
                </p>
              </div>
            </div>

            {attentionItems.length > 0 && (
              <button
                type="button"
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-0.5"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Attention Items Stack or Clean State */}
          {attentionItems.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {attentionItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-white border border-amber-100 flex items-center justify-between shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] text-amber-700 flex items-center justify-center">
                      {item.type === "payment_pending" ? (
                        <CreditCard className="w-4 h-4" />
                      ) : item.type === "low_stock" ? (
                        <Package className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-900">{item.title}</p>
                      <p className="text-[11px] text-neutral-500 mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        item.badgeType === "danger"
                          ? "bg-[#FEE2E2] text-[#DC2626]"
                          : "bg-[#FEF3C7] text-[#D97706]"
                      }`}
                    >
                      {item.badge}
                    </span>
                    <ChevronRight className="w-4 h-4 text-neutral-400" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-white/80 border border-emerald-100 flex items-center justify-between text-xs font-medium text-emerald-800">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#00A859]" />
                <span>All products in stock & orders up to date.</span>
              </span>
            </div>
          )}
        </section>

        {/* ============================================================== */}
        {/* "MANAGE YOUR BUSINESS" QUICK ACTIONS */}
        {/* ============================================================== */}
        <section className="mb-8">
          <h2 className="text-sm font-bold text-neutral-900">Manage your business</h2>
          <p className="text-xs text-neutral-500 mt-0.5 mb-3.5">
            Quick actions to keep your shop running.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {/* Action 1: Add product */}
            <button
              type="button"
              onClick={() => setIsAddProductOpen(true)}
              className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs hover:bg-neutral-50 text-left flex items-center justify-between transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#ECFDF5] text-[#00A859] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900">Add product</p>
                  <p className="text-[10px] text-neutral-500 mt-0.5">List a new product</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </button>

            {/* Action 2: View orders */}
            <Link
              href="/dashboard?tab=orders"
              className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs hover:bg-neutral-50 text-left flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#ECFDF5] text-[#00A859] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900">View orders</p>
                  <p className="text-[10px] text-neutral-500 mt-0.5">
                    {metrics.paidOrdersCount} order{metrics.paidOrdersCount === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </Link>

            {/* Action 3: Inventory */}
            <Link
              href="/inventory"
              className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs hover:bg-neutral-50 text-left flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#ECFDF5] text-[#00A859] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900">Inventory</p>
                  <p className="text-[10px] text-neutral-500 mt-0.5">
                    {totalProductsCount} item{totalProductsCount === 1 ? "" : "s"} listed
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </Link>

            {/* Action 4: Share store link */}
            <button
              type="button"
              onClick={handleShare}
              className="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs hover:bg-neutral-50 text-left flex items-center justify-between transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#ECFDF5] text-[#00A859] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Link2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900">Share store link</p>
                  <p className="text-[10px] text-neutral-500 mt-0.5">Get more customers</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </button>
          </div>
        </section>
      </div>

      {/* ============================================================== */}
      {/* BOTTOM STICKY NAVIGATION BAR */}
      {/* ============================================================== */}
      <MerchantBottomNav
        active="home"
        pendingBadgeCount={totalPendingBadgeCount}
      />

      {/* ============================================================== */}
      {/* SHARE LINK MODAL */}
      {/* ============================================================== */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsShareModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-neutral-900 mb-1">Share your shop</h3>
            <p className="text-xs text-neutral-500 mb-4">
              Send your shop link to customers on WhatsApp, Instagram, or anywhere else.
            </p>

            <div className="p-3 rounded-2xl bg-neutral-100 flex items-center justify-between gap-2 mb-4">
              <span className="text-xs font-bold text-neutral-800 truncate">{effectiveFullUrl}</span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-xl bg-white text-xs font-bold text-[#00A859] border border-neutral-200 shadow-2xs hover:bg-neutral-50 flex items-center gap-1 cursor-pointer flex-shrink-0"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Hello! Check out my shop on Ondar: ${effectiveFullUrl}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20BE5C] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <WhatsAppIcon className="w-4 h-4 fill-white" />
                <span>Share via WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-neutral-500 hover:text-neutral-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* NOTIFICATIONS MODAL */}
      {/* ============================================================== */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      {/* ============================================================== */}
      {/* ADD PRODUCT MODAL */}
      {/* ============================================================== */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsAddProductOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-neutral-900 mb-1">Add new product</h3>
            <p className="text-xs text-neutral-500 mb-4">
              List another item to display on your storefront.
            </p>

            {addProductError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200">
                {addProductError}
              </div>
            )}

            <form onSubmit={handleAddProductSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-900 mb-1.5">
                  Product name
                </label>
                <input
                  type="text"
                  required
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="e.g. Vintage Leather Bag"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-900 mb-1.5">
                  Price (₦)
                </label>
                <input
                  type="text"
                  required
                  value={newProductPrice}
                  onChange={(e) => setNewProductPrice(e.target.value)}
                  placeholder="e.g. 25,000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-900 mb-1.5">
                  Stock quantity
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newProductStock}
                  onChange={(e) => setNewProductStock(e.target.value)}
                  placeholder="10"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A859]/20 focus:border-[#00A859]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-900 mb-1.5">
                  Photo (optional)
                </label>
                <label className="w-full p-3 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 hover:bg-neutral-100 flex items-center justify-center gap-2 cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-neutral-500" />
                  <span className="text-xs font-medium text-neutral-600">
                    {newProductPhoto ? "Change photo" : "Upload photo"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                {newProductPhoto && (
                  <img
                    src={newProductPhoto}
                    alt="Preview"
                    className="w-16 h-16 rounded-xl object-cover mt-2 border border-neutral-200"
                  />
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmittingProduct}
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#00A859] hover:bg-[#00964E] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-60 cursor-pointer"
              >
                {isSubmittingProduct ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Listing product...</span>
                  </>
                ) : (
                  <span>Publish product</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
