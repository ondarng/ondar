"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Store,
  ExternalLink,
  Package,
  ShoppingBag,
  TrendingUp,
  Search,
  Users,
  CheckCircle2,
  Clock,
  LogOut,
  Copy,
  Check,
  RotateCw,
  MessageCircle,
  Building2,
  Lock,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Sparkles,
  Trash2,
} from "lucide-react";
import { OndarLogo } from "@/components/OndarLogo";

interface MerchantSummary {
  totalMerchants: number;
  completedOnboarding: number;
  inProgressOnboarding: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenueNaira: number;
}

interface MerchantItem {
  id: string;
  email: string;
  createdAt: string;
  onboardingStep: number;
  onboardingState: string;
  business: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    whatsappNumber: string;
    phoneNumber: string | null;
    state: string;
    city: string;
    address: string | null;
    deliveryEnabled: boolean;
    pickupEnabled: boolean;
    templateId: string;
    storeUrl: string;
    relativeStoreUrl: string;
    whatsappLink: string | null;
  } | null;
  payout: {
    bankName: string;
    bankCode: string;
    accountNumber: string;
    accountName: string;
    isVerified: boolean;
  } | null;
  stats: {
    productCount: number;
    orderCount: number;
    revenueNaira: number;
  };
  recentProducts: Array<{
    id: string;
    name: string;
    priceNaira: number;
    stockOnHand: number;
    status: string;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: number;
    totalNaira: number;
    orderStatus: string;
    paymentStatus: string;
    paymentRoute: string | null;
    createdAt: string;
  }>;
}

export function AdminDashboardClient({ initialAuthenticated }: { initialAuthenticated: boolean }) {
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuthenticated);
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<MerchantSummary | null>(null);
  const [merchants, setMerchants] = useState<MerchantItem[]>([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [expandedMerchantId, setExpandedMerchantId] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [merchantToDelete, setMerchantToDelete] = useState<MerchantItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteMerchant = async () => {
    if (!merchantToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/merchants/${merchantToDelete.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMerchants((prev) => prev.filter((m) => m.id !== merchantToDelete.id));
        setMerchantToDelete(null);
        fetchMerchants();
      }
    } catch (err) {
      console.error("Failed to delete merchant:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const fetchMerchants = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (activeFilter !== "all") params.set("filter", activeFilter);

      const res = await fetch(`/api/admin/merchants?${params.toString()}`);
      if (res.status === 401) {
        setIsAuthenticated(false);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setSummary(data.summary);
        setMerchants(data.merchants || []);
      }
    } catch (err) {
      console.error("Failed to load merchants:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMerchants();
    }
  }, [isAuthenticated, activeFilter]);

  // Debounced search
  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = setTimeout(() => {
      fetchMerchants();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setPassword("");
      } else {
        setLoginError(data.error || "Invalid admin passcode.");
      }
    } catch {
      setLoginError("Network error. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
      setIsAuthenticated(false);
      setMerchants([]);
      setSummary(null);
    } catch {
      // Ignore
    }
  };

  // --------------------------------------------------------------------------
  // LOGIN SCREEN
  // --------------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center px-4 py-12 text-white selection:bg-[#00A859] selection:text-white">
        <div className="w-full max-w-md bg-neutral-900/90 border border-neutral-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[#00A859]">
                <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  Ondar Admin
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Internal
                  </span>
                </h1>
                <p className="text-xs text-neutral-400">Merchant Directory & Stores</p>
              </div>
            </div>
            <Link href="/" className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors">
              Back to site ↗
            </Link>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-2">
                Admin Security Passcode
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter passcode"
                  autoFocus
                  required
                  className="w-full h-12 bg-neutral-800/80 border border-neutral-700/80 rounded-2xl pl-10 pr-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#00A859] focus:ring-1 focus:ring-[#00A859] transition-all"
                />
              </div>
            </div>

            {loginError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl p-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn || !password}
              className="w-full h-12 bg-[#00A859] hover:bg-[#00924c] disabled:opacity-50 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950/40 cursor-pointer"
            >
              {isLoggingIn ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Access Admin Portal</span>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-neutral-800/80 text-center">
            <p className="text-[11px] text-neutral-500">
              Default passcode: <code className="text-neutral-400 bg-neutral-800 px-1.5 py-0.5 rounded">ondar-admin-2026</code>
            </p>
            <p className="text-[10px] text-neutral-600 mt-1">
              Configure <code className="text-neutral-500">ADMIN_PASSWORD</code> in your environment variables to change it.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // AUTHENTICATED DASHBOARD
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-[#00A859] selection:text-white pb-20">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white">ondar</span>
            </Link>
            <div className="h-4 w-px bg-neutral-700" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-200">Admin Directory</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Live Overview
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchMerchants}
              disabled={isLoading}
              title="Refresh merchant list"
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#00A859]" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl text-xs font-bold text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* KPI Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-4.5">
              <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold mb-2">
                <span>Total Merchants</span>
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white">{summary.totalMerchants}</div>
              <div className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1">
                <span className="text-emerald-400 font-semibold">{summary.completedOnboarding} live</span>
                <span>·</span>
                <span>{summary.inProgressOnboarding} onboarding</span>
              </div>
            </div>

            <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-4.5">
              <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold mb-2">
                <span>Active Stores</span>
                <Store className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-black text-white">{summary.completedOnboarding}</div>
              <div className="text-[11px] text-neutral-400 mt-1">
                Stores with link ready
              </div>
            </div>

            <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-4.5">
              <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold mb-2">
                <span>Products Listed</span>
                <Package className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-black text-white">{summary.totalProducts}</div>
              <div className="text-[11px] text-neutral-400 mt-1">
                Across all catalogs
              </div>
            </div>

            <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-4.5">
              <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold mb-2">
                <span>Total Orders</span>
                <ShoppingBag className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white">{summary.totalOrders}</div>
              <div className="text-[11px] text-neutral-400 mt-1">
                Platform-wide sales
              </div>
            </div>

            <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-4.5 col-span-2 md:col-span-1">
              <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold mb-2">
                <span>Platform GMV</span>
                <TrendingUp className="w-4 h-4 text-[#00A859]" />
              </div>
              <div className="text-2xl font-black text-white">
                ₦{summary.totalRevenueNaira.toLocaleString()}
              </div>
              <div className="text-[11px] text-neutral-400 mt-1">
                Gross sales volume
              </div>
            </div>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search store name, slug, email, phone or bank..."
                className="w-full h-11 bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#00A859] transition-colors"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: "all", label: "All Users" },
                { id: "completed", label: "Active Stores" },
                { id: "in_progress", label: "In Progress" },
                { id: "has_products", label: "With Products" },
                { id: "has_orders", label: "With Orders" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeFilter === f.id
                      ? "bg-[#00A859] text-white shadow-sm"
                      : "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800/80"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-neutral-400 font-medium">
            Showing <strong className="text-white">{merchants.length}</strong> merchant{merchants.length === 1 ? "" : "s"}
          </div>
        </div>

        {/* Merchant Cards List */}
        {isLoading && merchants.length === 0 ? (
          <div className="p-16 text-center text-neutral-500 space-y-3">
            <RotateCw className="w-6 h-6 animate-spin mx-auto text-[#00A859]" />
            <p className="text-xs">Loading merchant directory...</p>
          </div>
        ) : merchants.length === 0 ? (
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-12 text-center space-y-2">
            <p className="text-sm font-bold text-white">No merchants found</p>
            <p className="text-xs text-neutral-500">
              {search ? "Try clearing your search query or filters." : "No merchants have signed up yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {merchants.map((m) => {
              const isExpanded = expandedMerchantId === m.id;
              const hasLiveStore = Boolean(m.business?.slug);
              const isCompleted = m.onboardingState === "COMPLETED";

              return (
                <div
                  key={m.id}
                  className="bg-neutral-900 border border-neutral-800/90 hover:border-neutral-700/80 rounded-2xl overflow-hidden transition-all shadow-sm"
                >
                  {/* Card Header Row */}
                  <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Store identity & credentials */}
                    <div className="flex items-start gap-3.5 min-w-0">
                      {/* Avatar */}
                      <div className="w-11 h-11 rounded-2xl bg-neutral-800 border border-neutral-700/60 flex items-center justify-center font-bold text-emerald-400 text-sm shrink-0 overflow-hidden">
                        {m.business?.logoUrl ? (
                          <img
                            src={m.business.logoUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          (m.business?.name?.slice(0, 2) || m.email.slice(0, 2)).toUpperCase()
                        )}
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-sm font-bold text-white truncate">
                            {m.business?.name || "Unnamed Store (In Setup)"}
                          </h2>

                          {isCompleted ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
                              <Clock className="w-3 h-3" />
                              Step {m.onboardingStep} · Onboarding
                            </span>
                          )}

                          {m.business?.state && (
                            <span className="text-[10px] text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded-full">
                              {m.business.city ? `${m.business.city}, ` : ""}{m.business.state}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-400">
                          <span className="text-neutral-300 font-mono text-[11px]">{m.email}</span>
                          <span>·</span>
                          <span className="text-neutral-500">
                            Joined {new Date(m.createdAt).toLocaleDateString("en-NG", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Store link & WhatsApp action */}
                    <div className="flex flex-wrap items-center gap-2">
                      {hasLiveStore ? (
                        <>
                          <a
                            href={m.business?.relativeStoreUrl || `/s/${m.business?.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-9 px-3.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                          >
                            <Store className="w-3.5 h-3.5" />
                            <span>Visit Storefront</span>
                            <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                          </a>

                          <button
                            type="button"
                            onClick={() => handleCopy(m.business?.storeUrl || "", m.id)}
                            className="h-9 px-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                            title="Copy Store URL"
                          >
                            {copiedText === m.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-[11px] text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-neutral-400" />
                                <span className="text-[11px] font-mono">/{m.business?.slug}</span>
                              </>
                            )}
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-neutral-500 italic bg-neutral-800/60 px-3 py-1.5 rounded-xl">
                          No storefront link yet
                        </span>
                      )}

                      {m.business?.whatsappLink && (
                        <a
                          href={m.business.whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-9 px-3 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 text-[#25D366] text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => setMerchantToDelete(m)}
                        title="Delete merchant account"
                        className="h-9 w-9 rounded-xl bg-neutral-800/80 hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 border border-neutral-700/60 transition-colors flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Secondary info bar: Bank account & catalog metrics */}
                  <div className="bg-neutral-950/60 px-4 sm:px-5 py-3 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                    {/* Bank Info */}
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                      {m.payout ? (
                        <div className="flex items-center gap-2 text-neutral-300">
                          <span className="font-semibold text-white">{m.payout.bankName}</span>
                          <span className="font-mono text-neutral-400">
                            {m.payout.accountNumber}
                          </span>
                          <span className="text-neutral-500">({m.payout.accountName})</span>
                          {m.payout.isVerified && (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          )}
                        </div>
                      ) : (
                        <span className="text-neutral-500 italic">No settlement bank added</span>
                      )}
                    </div>

                    {/* Stats & Expand Toggle */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3 text-neutral-400 font-medium">
                        <span>
                          <strong className="text-white">{m.stats.productCount}</strong> products
                        </span>
                        <span>·</span>
                        <span>
                          <strong className="text-white">{m.stats.orderCount}</strong> orders
                        </span>
                        {m.stats.revenueNaira > 0 && (
                          <>
                            <span>·</span>
                            <span className="text-emerald-400 font-bold">
                              ₦{m.stats.revenueNaira.toLocaleString()}
                            </span>
                          </>
                        )}
                      </div>

                      <button
                        onClick={() =>
                          setExpandedMerchantId(isExpanded ? null : m.id)
                        }
                        className="text-neutral-400 hover:text-white flex items-center gap-1 font-semibold text-xs transition-colors"
                      >
                        <span>{isExpanded ? "Hide Details" : "View Details"}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Section: Products & Orders details */}
                  {isExpanded && (
                    <div className="bg-neutral-950/90 border-t border-neutral-800 p-4 sm:p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Products list */}
                        <div className="space-y-3">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                            <Package className="w-3.5 h-3.5 text-purple-400" />
                            Recent Products ({m.stats.productCount})
                          </h3>
                          {m.recentProducts.length === 0 ? (
                            <p className="text-xs text-neutral-500 italic">No products added yet.</p>
                          ) : (
                            <div className="space-y-2">
                              {m.recentProducts.map((p) => (
                                <div
                                  key={p.id}
                                  className="bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 flex items-center justify-between text-xs"
                                >
                                  <div>
                                    <span className="font-semibold text-white block truncate max-w-[220px]">
                                      {p.name}
                                    </span>
                                    <span className="text-[11px] text-neutral-400">
                                      {p.stockOnHand} in stock · {p.status}
                                    </span>
                                  </div>
                                  <span className="font-bold text-emerald-400">
                                    ₦{p.priceNaira.toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Orders list */}
                        <div className="space-y-3">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                            Recent Orders ({m.stats.orderCount})
                          </h3>
                          {m.recentOrders.length === 0 ? (
                            <p className="text-xs text-neutral-500 italic">No orders received yet.</p>
                          ) : (
                            <div className="space-y-2">
                              {m.recentOrders.map((o) => (
                                <div
                                  key={o.id}
                                  className="bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 flex items-center justify-between text-xs"
                                >
                                  <div>
                                    <span className="font-bold text-white block">
                                      Order #{o.orderNumber}
                                    </span>
                                    <span className="text-[11px] text-neutral-400">
                                      {o.orderStatus} · {o.paymentRoute || "DIRECT"}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <span className="font-bold text-white block">
                                      ₦{o.totalNaira.toLocaleString()}
                                    </span>
                                    <span className={`text-[10px] font-bold ${o.paymentStatus === "PAID" ? "text-emerald-400" : "text-amber-400"}`}>
                                      {o.paymentStatus}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {merchantToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
              <Trash2 className="w-6 h-6 stroke-[2]" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-white">
                Delete Merchant Account?
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Are you sure you want to permanently delete{" "}
                <strong className="text-white">
                  {merchantToDelete.business?.name || merchantToDelete.email}
                </strong>{" "}
                ({merchantToDelete.email})?
              </p>
              <p className="text-[11px] text-rose-400/90 pt-1">
                This will delete their storefront, products, and order records. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMerchantToDelete(null)}
                disabled={isDeleting}
                className="flex-1 h-11 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteMerchant}
                disabled={isDeleting}
                className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-rose-950/40"
              >
                {isDeleting ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Yes, Delete Account</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
