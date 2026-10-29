"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  Plus,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Package,
  RotateCcw,
  WifiOff,
  CheckCircle2,
  Share2,
} from "lucide-react";
import { MerchantBottomNav } from "@/components/merchant/MerchantBottomNav";
import { OrderFiltersDrawer, OrderFilterState } from "./OrderFiltersDrawer";
import { OrderDetailView, OrderDetailData } from "./OrderDetailView";

interface OrdersClientProps {
  storeSlug: string;
}

export function OrdersClient({ storeSlug }: OrdersClientProps) {
  const [activeTab, setActiveTab] = useState<"all" | "needs_attention">("all");
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState<OrderDetailData[]>([]);
  const [counts, setCounts] = useState({ total: 0, needsAttention: 0 });
  const [loading, setLoading] = useState(true);
  const [hasNetworkError, setHasNetworkError] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetailData | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [copiedShopLink, setCopiedShopLink] = useState(false);

  const [filters, setFilters] = useState<OrderFilterState>({
    orderStatus: [],
    paymentStatus: [],
    source: [],
    deliveryType: [],
    datePlaced: "any",
    startDate: "",
    endDate: "",
  });

  const loadOrders = async () => {
    setLoading(true);
    setHasNetworkError(false);
    try {
      const params = new URLSearchParams();
      params.set("tab", activeTab);
      if (search) params.set("search", search);

      filters.orderStatus.forEach((s) => params.append("orderStatus", s));
      filters.paymentStatus.forEach((s) => params.append("paymentStatus", s));
      filters.source.forEach((s) => params.append("source", s));
      filters.deliveryType.forEach((d) => params.append("deliveryType", d));

      if (filters.datePlaced !== "any") {
        params.set("dateRange", filters.datePlaced);
        if (filters.datePlaced === "custom") {
          if (filters.startDate) params.set("startDate", filters.startDate);
          if (filters.endDate) params.set("endDate", filters.endDate);
        }
      }

      const res = await fetch(`/api/orders/list?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setCounts(data.counts || { total: 0, needsAttention: 0 });

        if (selectedOrder) {
          const fresh = data.orders.find((o: OrderDetailData) => o.id === selectedOrder.id);
          if (fresh) setSelectedOrder(fresh);
        }
      } else {
        setHasNetworkError(true);
      }
    } catch (e) {
      setHasNetworkError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [activeTab, filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadOrders();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const activeFiltersCount =
    filters.orderStatus.length +
    filters.paymentStatus.length +
    filters.source.length +
    filters.deliveryType.length +
    (filters.datePlaced !== "any" ? 1 : 0);

  const formatNaira = (koboStr: string) => {
    const val = Math.round(Number(koboStr) / 100);
    return `₦${val.toLocaleString()}`;
  };

  const formatOrderTime = (isoString: string) => {
    const d = new Date(isoString);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();

    const timeStr = d.toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit", hour12: false });
    if (isToday) {
      return `Today, ${timeStr}`;
    }
    return `${d.toLocaleDateString("en-NG", { day: "numeric", month: "short" })}, ${timeStr}`;
  };

  const handleShareShopLink = () => {
    const storeUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/s/${storeSlug}`;
    navigator.clipboard.writeText(storeUrl);
    setCopiedShopLink(true);
    setTimeout(() => setCopiedShopLink(false), 2000);
  };

  const handleClearFilters = () => {
    setSearch("");
    setFilters({
      orderStatus: [],
      paymentStatus: [],
      source: [],
      deliveryType: [],
      datePlaced: "any",
      startDate: "",
      endDate: "",
    });
  };

  if (selectedOrder) {
    return (
      <OrderDetailView
        order={selectedOrder}
        storeSlug={storeSlug}
        onBack={() => setSelectedOrder(null)}
        onRefresh={loadOrders}
      />
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-24 text-neutral-900">
      <div className="max-w-[430px] mx-auto px-4 pt-4 space-y-4">
        {/* Top Header CTA: + Record a sale */}
        <Link
          href="/orders/record"
          className="w-full h-12 bg-[#00A859] hover:bg-[#00924c] text-white rounded-2xl font-bold text-[14px] flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          Record a sale
        </Link>

        {/* Segmented Tabs: All orders vs Needs attention */}
        <div className="bg-neutral-200/70 p-1 rounded-2xl flex items-center">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`flex-1 py-2 text-[13px] font-bold rounded-xl transition-all ${
              activeTab === "all" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            All orders
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("needs_attention")}
            className={`flex-1 py-2 text-[13px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "needs_attention"
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Needs attention {counts.needsAttention > 0 && `· ${counts.needsAttention}`}
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Order number, customer or phone"
            className="w-full h-11 pl-10 pr-4 bg-white border border-neutral-200 rounded-2xl text-[13px] focus:outline-none focus:border-[#00A859] shadow-2xs"
          />
        </div>

        {/* Needs attention explanation banner */}
        {activeTab === "needs_attention" && counts.needsAttention > 0 && (
          <div className="bg-[#FFF9EA] border border-[#FFE8A3] rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-[12px] leading-relaxed">
              <span className="font-bold text-amber-900 block">
                {counts.needsAttention} order{counts.needsAttention === 1 ? "" : "s"} to review
              </span>
              <span className="text-amber-800">
                Flags explain an exception. They do not replace the order status or payment status.
              </span>
            </div>
          </div>
        )}

        {/* Order Count & Filters Button */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[12px] text-neutral-500 font-medium">
            {orders.length} order{orders.length === 1 ? "" : "s"} · newest first
          </span>

          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className={`px-3 py-1.5 rounded-xl border text-[12px] font-bold flex items-center gap-1.5 transition-all ${
              activeFiltersCount > 0
                ? "bg-[#E6F7EF] border-[#00A859] text-[#00A859]"
                : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters · {activeFiltersCount}
          </button>
        </div>

        {/* -------------------------------------------------------- */}
        {/* SCREEN 16: SUPPORTING STATES */}
        {/* -------------------------------------------------------- */}

        {/* 1. Loading Skeletons */}
        {loading ? (
          <div className="space-y-3">
            <p className="text-[12px] text-neutral-400 font-medium pl-1">Loading your orders...</p>
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-4 border border-neutral-200/80 shadow-2xs space-y-3 animate-pulse">
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-neutral-200 rounded w-28"></div>
                  <div className="h-5 bg-neutral-200 rounded w-16"></div>
                </div>
                <div className="h-4 bg-neutral-200 rounded w-40"></div>
                <div className="h-4 bg-neutral-200 rounded w-32"></div>
              </div>
            ))}
            <p className="text-[11px] text-neutral-400 text-center pt-2">
              Loading is announced to assistive technology. Placeholder rows are not actions.
            </p>
          </div>
        ) : hasNetworkError ? (
          /* 2. Network Failure State */
          <div className="bg-white rounded-2xl p-8 border border-neutral-200/80 shadow-2xs text-center space-y-3">
            <WifiOff className="w-8 h-8 text-neutral-400 mx-auto" />
            <h3 className="text-[16px] font-bold text-neutral-900">Couldn't load your orders</h3>
            <p className="text-[12px] text-neutral-500 leading-relaxed">
              Check your connection and try again. Your search and filters have been kept.
            </p>
            <button
              onClick={loadOrders}
              className="w-full h-11 bg-[#00A859] hover:bg-[#00924c] text-white rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Try again
            </button>
          </div>
        ) : counts.total === 0 && !search && activeFiltersCount === 0 ? (
          /* 3. First Use State (0 orders total) */
          <div className="bg-white rounded-2xl p-7 border border-neutral-200/80 shadow-2xs text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EBF3EF] flex items-center justify-center mx-auto text-[#00A859]">
              <Package className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-neutral-900">Your first order starts here</h3>
              <p className="text-[12px] text-neutral-500 mt-1 leading-relaxed">
                Share your shop link to receive orders, or record a sale you've already made elsewhere.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleShareShopLink}
                className="w-full h-11 bg-[#00A859] hover:bg-[#00924c] text-white rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Share2 className="w-4 h-4" />
                {copiedShopLink ? "Shop link copied!" : "Share shop link"}
              </button>
              <Link
                href="/orders/record"
                className="w-full h-11 border border-neutral-200 text-[#00A859] hover:bg-neutral-50 rounded-xl text-[13px] font-bold flex items-center justify-center transition-colors"
              >
                Record a sale
              </Link>
            </div>
          </div>
        ) : orders.length === 0 ? (
          /* 4. No Matching Orders (Search / Filter empty) */
          <div className="bg-white rounded-2xl p-7 border border-neutral-200/80 shadow-2xs text-center space-y-3">
            <h3 className="text-[16px] font-bold text-neutral-900">No matching orders</h3>
            <p className="text-[12px] text-neutral-500 leading-relaxed">
              No orders match "{search || "selected filters"}". Try an order number, customer name or phone.
            </p>
            <button
              onClick={handleClearFilters}
              className="w-full h-11 border border-neutral-200 text-[#00A859] hover:bg-neutral-50 rounded-xl text-[13px] font-bold transition-colors"
            >
              Clear search & reset filters
            </button>
          </div>
        ) : (
          /* Normal Order Cards */
          <div className="space-y-3">
            {orders.map((o) => {
              const isPaid = o.paymentStatus === "PAID";
              const hasFlag = !!o.flag;

              return (
                <div
                  key={o.id}
                  onClick={() => setSelectedOrder(o)}
                  className="bg-white rounded-2xl p-4 border border-neutral-200/80 shadow-2xs hover:border-[#00A859]/50 transition-all cursor-pointer space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-neutral-500 font-medium">
                      #{o.orderNumber} · {formatOrderTime(o.createdAt)}
                    </span>
                    <span className="text-[16px] font-extrabold text-neutral-900">
                      {formatNaira(o.totalKobo)}
                    </span>
                  </div>

                  <h3 className="text-[15px] font-bold text-neutral-900 leading-tight">
                    {o.customerName}
                  </h3>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 font-medium rounded-md">
                      {o.source === "STOREFRONT"
                        ? "Storefront"
                        : o.source === "CUSTOM_CHECKOUT"
                        ? "Custom Checkout"
                        : "Recorded"}
                    </span>
                    <span className="text-neutral-500 font-medium capitalize">
                      {o.deliveryType === "pickup" ? "Pickup" : "Delivery"}
                      {o.deliveryArea ? ` · ${o.deliveryArea}` : ""}
                    </span>
                  </div>

                  <div className="flex items-center gap-6 pt-1">
                    <div>
                      <span className="text-neutral-400 block mb-0.5 text-[9px] font-semibold uppercase tracking-wider">
                        ORDER
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          o.orderStatus === "CANCELLED"
                            ? "bg-red-50 text-red-600"
                            : o.orderStatus === "COMPLETED"
                            ? "bg-green-50 text-green-700"
                            : "bg-neutral-100 text-neutral-800"
                        }`}
                      >
                        {o.orderStatus.replace(/_/g, " ").toLowerCase()}
                      </span>
                    </div>

                    <div>
                      <span className="text-neutral-400 block mb-0.5 text-[9px] font-semibold uppercase tracking-wider">
                        PAYMENT
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isPaid ? "bg-[#E6F7EF] text-[#00A859]" : "bg-amber-100 text-amber-900"
                        }`}
                      >
                        {isPaid ? "Paid" : "Awaiting payment"}
                      </span>
                    </div>
                  </div>

                  {hasFlag && (
                    <div className="bg-[#FFF9EA] border border-[#FFE8A3] rounded-xl p-3 flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div className="text-[11px] leading-tight">
                        <span className="font-bold text-amber-900 block">
                          Flag: {o.flag?.replace(/_/g, " ")}
                        </span>
                        {o.flagDetails && <span className="text-amber-800">{o.flagDetails}</span>}
                      </div>
                    </div>
                  )}

                  {o.source === "RECORDED" && (
                    <p className="text-[11px] text-neutral-400 italic">Payment recorded by merchant</p>
                  )}

                  {activeTab === "needs_attention" && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(o);
                      }}
                      className="w-full h-10 border border-neutral-200 text-[#00A859] hover:bg-neutral-50 rounded-xl text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                      Review order
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <p className="text-[11px] text-neutral-400 text-center leading-relaxed pt-2 pb-6">
          {activeTab === "needs_attention"
            ? 'Online payments are verified automatically. There is no manual "mark as paid" action.'
            : "You're all caught up. All sales sources appear here, including sales you record yourself."}
        </p>
      </div>

      <OrderFiltersDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApply={(newFilters) => setFilters(newFilters)}
        filteredCount={orders.length}
      />

      <MerchantBottomNav active="orders" pendingBadgeCount={counts.needsAttention} />
    </div>
  );
}
