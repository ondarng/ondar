"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Download,
  Eye,
  Globe,
  HelpCircle,
  MessageCircle,
  Percent,
  Search,
  Share2,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import { MerchantBottomNav } from "@/components/merchant/MerchantBottomNav";
import { formatNairaFromKobo } from "@/lib/inventory";

interface VisitRecord {
  id: string;
  visitorId: string;
  path: string;
  referrer: string;
  createdAt: string;
}

interface OrderItemRecord {
  id: string;
  productId: string;
  name: string;
  priceKobo: string;
  quantity: number;
  lineTotal: string;
}

interface OrderRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  totalKobo: string;
  subtotalKobo: string;
  paymentStatus: string;
  status: string;
  source: string;
  createdAt: string;
  items: OrderItemRecord[];
}

interface ProductRecord {
  id: string;
  name: string;
  priceKobo: string;
  costKobo: string | null;
  stockOnHand: number;
  status: string;
}

interface AnalyticsClientProps {
  businessName: string;
  storeSlug: string;
  fullStoreUrl: string;
  visits: VisitRecord[];
  orders: OrderRecord[];
  products: ProductRecord[];
}

type TimeRange = "today" | "7d" | "30d" | "all";

export function AnalyticsClient({
  businessName,
  storeSlug,
  fullStoreUrl,
  visits,
  orders,
  products,
}: AnalyticsClientProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [activeTab, setActiveTab] = useState<"overview" | "sources" | "products">("overview");

  // Filter based on selected time range
  const filteredData = useMemo(() => {
    const now = new Date();
    let cutoff: Date | null = null;

    if (timeRange === "today") {
      cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (timeRange === "7d") {
      cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeRange === "30d") {
      cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const filteredVisits = cutoff
      ? visits.filter((v) => new Date(v.createdAt) >= cutoff!)
      : visits;

    const filteredOrders = cutoff
      ? orders.filter((o) => new Date(o.createdAt) >= cutoff!)
      : orders;

    // Filter paid/valid orders
    const paidOrders = filteredOrders.filter(
      (o) =>
        o.paymentStatus === "PAID" ||
        ["COMPLETED", "TO_FULFIL", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY"].includes(o.status)
    );

    // Total sales
    const totalSalesKobo = paidOrders.reduce(
      (acc, o) => acc + BigInt(o.totalKobo || "0"),
      BigInt(0)
    );

    // Product cost mapping for profit
    const productCostMap = new Map<string, bigint>();
    products.forEach((p) => {
      if (p.costKobo) {
        productCostMap.set(p.id, BigInt(p.costKobo));
      }
    });

    let totalCostKobo = BigInt(0);
    paidOrders.forEach((o) => {
      o.items.forEach((item) => {
        const cost = productCostMap.get(item.productId);
        if (cost !== undefined) {
          totalCostKobo += cost * BigInt(item.quantity);
        }
      });
    });

    const netProfitKobo =
      totalSalesKobo > totalCostKobo && totalCostKobo > BigInt(0)
        ? totalSalesKobo - totalCostKobo
        : totalSalesKobo;

    const profitMargin =
      totalSalesKobo > BigInt(0) && totalCostKobo > BigInt(0)
        ? Math.round(Number((netProfitKobo * BigInt(100)) / totalSalesKobo))
        : null;

    // Unique visitors
    const uniqueVisitorIds = new Set(filteredVisits.map((v) => v.visitorId));
    const uniqueVisitorsCount = uniqueVisitorIds.size;
    const totalPageviews = filteredVisits.length;

    // Conversion rate: paid orders / unique visitors
    const conversionRate =
      uniqueVisitorsCount > 0
        ? ((paidOrders.length / uniqueVisitorsCount) * 100).toFixed(1)
        : "0.0";

    // Referrer distribution
    const sourceMap = new Map<string, { count: number; visitors: Set<string> }>();
    filteredVisits.forEach((v) => {
      const src = v.referrer || "Direct";
      if (!sourceMap.has(src)) {
        sourceMap.set(src, { count: 0, visitors: new Set() });
      }
      const entry = sourceMap.get(src)!;
      entry.count += 1;
      entry.visitors.add(v.visitorId);
    });

    const sourceStats = Array.from(sourceMap.entries())
      .map(([source, data]) => ({
        source,
        pageviews: data.count,
        uniqueVisitors: data.visitors.size,
        percentage:
          totalPageviews > 0
            ? Math.round((data.count / totalPageviews) * 100)
            : 0,
      }))
      .sort((a, b) => b.pageviews - a.pageviews);

    // Top selling products
    const productSalesMap = new Map<
      string,
      { name: string; unitsSold: number; revenueKobo: bigint }
    >();

    paidOrders.forEach((o) => {
      o.items.forEach((item) => {
        const existing = productSalesMap.get(item.productId) || {
          name: item.name,
          unitsSold: 0,
          revenueKobo: BigInt(0),
        };
        existing.unitsSold += item.quantity;
        existing.revenueKobo += BigInt(item.lineTotal || "0");
        productSalesMap.set(item.productId, existing);
      });
    });

    const topProducts = Array.from(productSalesMap.values()).sort(
      (a, b) => Number(b.revenueKobo - a.revenueKobo)
    );

    return {
      filteredVisits,
      filteredOrders,
      paidOrders,
      totalSalesKobo,
      netProfitKobo,
      profitMargin,
      uniqueVisitorsCount,
      totalPageviews,
      conversionRate,
      sourceStats,
      topProducts,
    };
  }, [timeRange, visits, orders, products]);

  // CSV Export
  const handleExportCSV = () => {
    const rows = [
      ["Order Number", "Date", "Customer Name", "Customer Phone", "Payment Status", "Order Status", "Total (NGN)"],
      ...filteredData.paidOrders.map((o) => [
        o.orderNumber,
        new Date(o.createdAt).toLocaleDateString("en-NG"),
        `"${o.customerName}"`,
        `"${o.customerPhone}"`,
        o.paymentStatus,
        o.status,
        (Number(o.totalKobo) / 100).toFixed(2),
      ]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `ondar_sales_${storeSlug}_${timeRange}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderSourceIcon = (source: string) => {
    const s = source.toLowerCase();
    if (s.includes("instagram")) {
      return (
        <span className="w-4 h-4 flex items-center justify-center text-pink-600 font-bold text-xs">
          📷
        </span>
      );
    }
    if (s.includes("whatsapp")) {
      return <MessageCircle className="w-4 h-4 text-emerald-600" />;
    }
    if (s.includes("tiktok")) {
      return <span className="text-xs font-black">🎵</span>;
    }
    if (s.includes("twitter") || s.includes("x")) {
      return <span className="text-xs font-black">𝕏</span>;
    }
    if (s.includes("google")) {
      return <Search className="w-4 h-4 text-blue-500" />;
    }
    return <Globe className="w-4 h-4 text-neutral-500" />;
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] antialiased text-neutral-900 pb-28">
      <div className="w-full max-w-[430px] mx-auto px-4 pt-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Link
              href="/more"
              className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors"
              aria-label="Back to More"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-700" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-neutral-900 tracking-tight leading-tight">
                Sales & Analytics
              </h1>
              <p className="text-xs text-neutral-500">Track visitors, conversion & revenue</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
            title="Download CSV Sales Report"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>

        {/* Time Filter Pills */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-neutral-100 rounded-2xl mb-4 text-xs font-bold">
          {(
            [
              { id: "today", label: "Today" },
              { id: "7d", label: "7 Days" },
              { id: "30d", label: "30 Days" },
              { id: "all", label: "All Time" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTimeRange(t.id)}
              className={`py-2 rounded-xl transition-all cursor-pointer text-center ${
                timeRange === t.id
                  ? "bg-white text-neutral-950 shadow-2xs font-extrabold"
                  : "text-neutral-500 hover:text-neutral-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Primary Metric: Total Revenue & Profit */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-[#064E3B] to-[#043327] text-white shadow-sm mb-4 relative overflow-hidden">
          <div className="absolute right-[-10px] top-[-10px] w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
          
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-200">
              Total Sales Revenue
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
              {filteredData.paidOrders.length} {filteredData.paidOrders.length === 1 ? "order" : "orders"}
            </span>
          </div>

          <p className="text-3xl font-black tracking-tight mb-3">
            {formatNairaFromKobo(filteredData.totalSalesKobo)}
          </p>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <div>
              <p className="text-[10px] uppercase font-bold text-emerald-300/80">Est. Net Profit</p>
              <p className="font-bold text-sm text-white">
                {formatNairaFromKobo(filteredData.netProfitKobo)}
              </p>
            </div>
            {filteredData.profitMargin !== null && (
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-emerald-300/80">Profit Margin</p>
                <p className="font-bold text-sm text-emerald-400">{filteredData.profitMargin}%</p>
              </div>
            )}
          </div>
        </div>

        {/* 2x2 Secondary Metrics: Visitors & Conversion */}
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          {/* Unique Visitors */}
          <div className="p-3.5 rounded-2xl bg-white border border-neutral-200 shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-neutral-500">Store Visitors</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-neutral-900 leading-tight">
              {filteredData.uniqueVisitorsCount.toLocaleString()}
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">
              {filteredData.totalPageviews.toLocaleString()} total pageviews
            </p>
          </div>

          {/* Conversion Rate */}
          <div className="p-3.5 rounded-2xl bg-white border border-neutral-200 shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-neutral-500">Conversion Rate</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-[#00A859]">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-neutral-900 leading-tight">
              {filteredData.conversionRate}%
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">
              {filteredData.paidOrders.length} orders from visitors
            </p>
          </div>
        </div>

        {/* Sub-Tabs: Sources vs Products */}
        <div className="flex border-b border-neutral-200 mb-4 text-xs font-extrabold text-neutral-400">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`pb-2.5 px-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === "overview"
                ? "border-[#00A859] text-neutral-900 font-black"
                : "border-transparent hover:text-neutral-700"
            }`}
          >
            Traffic Sources ({filteredData.sourceStats.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className={`pb-2.5 px-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === "products"
                ? "border-[#00A859] text-neutral-900 font-black"
                : "border-transparent hover:text-neutral-700"
            }`}
          >
            Top Products ({filteredData.topProducts.length})
          </button>
        </div>

        {/* TAB 1: TRAFFIC SOURCES */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="p-4 rounded-3xl bg-white border border-neutral-200/90 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black text-neutral-900">Where Customers Come From</h3>
                <span className="text-xs text-neutral-400 font-medium">
                  {filteredData.totalPageviews} visits logged
                </span>
              </div>

              {filteredData.sourceStats.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-neutral-100 mx-auto flex items-center justify-center text-neutral-400 mb-2">
                    <Globe className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-neutral-800">No visitors recorded yet</p>
                  <p className="text-xs text-neutral-500 max-w-xs mx-auto mt-1 mb-3">
                    Share your store link on your Instagram bio, WhatsApp status, or TikTok to start tracking visitors!
                  </p>
                  <a
                    href={fullStoreUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#E8F8EF] text-[#00A859] text-xs font-bold hover:bg-emerald-100 transition-colors"
                  >
                    <span>Visit storefront</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredData.sourceStats.map((stat) => (
                    <div key={stat.source} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-neutral-50 flex items-center justify-center">
                            {renderSourceIcon(stat.source)}
                          </div>
                          <span className="font-bold text-neutral-800">{stat.source}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-neutral-900">
                            {stat.uniqueVisitors} {stat.uniqueVisitors === 1 ? "visitor" : "visitors"}
                          </span>
                          <span className="text-neutral-400 text-[11px] ml-1.5">
                            ({stat.percentage}%)
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
                        <div
                          className="h-full bg-[#00A859] rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(stat.percentage, 4)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Conversion Funnel Card */}
            <div className="p-4 rounded-3xl bg-white border border-neutral-200/90 shadow-2xs">
              <h3 className="text-sm font-black text-neutral-900 mb-3">Storefront Conversion Funnel</h3>
              
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-2xl bg-neutral-50 border border-neutral-100">
                  <p className="text-[10px] font-bold uppercase text-neutral-400">1. Shoppers</p>
                  <p className="text-lg font-black text-neutral-900 mt-0.5">
                    {filteredData.uniqueVisitorsCount}
                  </p>
                  <p className="text-[10px] text-neutral-500">Visited store</p>
                </div>

                <div className="p-2.5 rounded-2xl bg-neutral-50 border border-neutral-100">
                  <p className="text-[10px] font-bold uppercase text-neutral-400">2. Orders</p>
                  <p className="text-lg font-black text-neutral-900 mt-0.5">
                    {filteredData.filteredOrders.length}
                  </p>
                  <p className="text-[10px] text-neutral-500">Initiated</p>
                </div>

                <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <p className="text-[10px] font-bold uppercase text-emerald-800">3. Paid</p>
                  <p className="text-lg font-black text-[#00A859] mt-0.5">
                    {filteredData.paidOrders.length}
                  </p>
                  <p className="text-[10px] text-emerald-700">Completed</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TOP PRODUCTS */}
        {activeTab === "products" && (
          <div className="p-4 rounded-3xl bg-white border border-neutral-200/90 shadow-2xs">
            <h3 className="text-sm font-black text-neutral-900 mb-3">Top Performing Products</h3>

            {filteredData.topProducts.length === 0 ? (
              <div className="py-8 text-center text-neutral-400 text-xs">
                No product sales recorded in this timeframe yet.
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {filteredData.topProducts.map((p, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between">
                    <div className="min-w-0 pr-3">
                      <p className="text-xs font-bold text-neutral-900 truncate">{p.name}</p>
                      <p className="text-[11px] text-neutral-400">
                        {p.unitsSold} unit{p.unitsSold === 1 ? "" : "s"} sold
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-extrabold text-neutral-900">
                        {formatNairaFromKobo(p.revenueKobo)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <MerchantBottomNav active="more" />
    </div>
  );
}
