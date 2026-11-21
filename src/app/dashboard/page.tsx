import React from "react";
import { getCurrentMerchant } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getStoreUrls } from "@/lib/urls";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const merchant = await getCurrentMerchant();

  if (!merchant) {
    redirect("/login");
  }

  // If merchant has not finished onboarding, route to onboarding wizard
  if (merchant.onboardingState !== "COMPLETED") {
    redirect("/onboarding");
  }

  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host") || "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");

  const business = merchant.businessProfile;
  const slug = business?.slug || "shop";
  const urls = getStoreUrls(slug, undefined, host, proto);

  // Derive display first name
  let firstName = "Merchant";
  if (merchant.email) {
    const raw = merchant.email.split("@")[0];
    if (raw.toLowerCase().includes("caleb")) {
      firstName = "Caleb";
    } else if (raw.toLowerCase().includes("ada")) {
      firstName = "Ada";
    } else {
      const match = raw.match(/[a-zA-Z]+/);
      if (match) {
        firstName = match[0].charAt(0).toUpperCase() + match[0].slice(1);
      }
    }
  }

  const initial = firstName.charAt(0).toUpperCase() || "M";

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  function toSafeBigInt(val: unknown): bigint {
    if (val === null || val === undefined) return BigInt(0);
    try {
      return BigInt(val as any);
    } catch {
      return BigInt(0);
    }
  }

  // Concurrently fetch real orders and products with safe error resilience
  let orders: any[] = [];
  let products: any[] = [];

  try {
    const results = await Promise.all([
      prisma.order.findMany({
        where: { merchantId: merchant.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.findMany({
        where: { merchantId: merchant.id },
        include: { images: { orderBy: { position: "asc" } } },
        orderBy: { createdAt: "desc" },
      }),
    ]);
    orders = results[0] || [];
    products = results[1] || [];
  } catch (error) {
    console.error("Dashboard database query notice:", error);
  }

  // 3. Paid orders & revenue calculations
  const paidOrders = orders.filter((o: any) => o.paymentStatus === "PAID");
  const totalPaidKobo: bigint = paidOrders.reduce((acc: bigint, o: any) => acc + toSafeBigInt(o.totalKobo), BigInt(0));
  const totalPaidNaira = Math.round(Number(totalPaidKobo) / 100);

  // Growth vs previous 7 days
  const paidLast7 = paidOrders.filter((o: any) => (o.createdAt ? new Date(o.createdAt) >= sevenDaysAgo : false));
  const paidPrev7 = paidOrders.filter((o: any) => {
    if (!o.createdAt) return false;
    const d = new Date(o.createdAt);
    return d >= fourteenDaysAgo && d < sevenDaysAgo;
  });
  const salesLast7: bigint = paidLast7.reduce((acc: bigint, o: any) => acc + toSafeBigInt(o.totalKobo), BigInt(0));
  const salesPrev7: bigint = paidPrev7.reduce((acc: bigint, o: any) => acc + toSafeBigInt(o.totalKobo), BigInt(0));

  let salesGrowthPct = 0;
  if (salesPrev7 > BigInt(0)) {
    salesGrowthPct = Math.round(Number(((salesLast7 - salesPrev7) * BigInt(100)) / salesPrev7));
  } else if (salesLast7 > BigInt(0)) {
    salesGrowthPct = 100;
  }

  let ordersGrowthPct = 0;
  if (paidPrev7.length > 0) {
    ordersGrowthPct = Math.round(((paidLast7.length - paidPrev7.length) / paidPrev7.length) * 100);
  } else if (paidLast7.length > 0) {
    ordersGrowthPct = 100;
  }

  // Est. profit (settlement is 99% of total paid sales after Ondar 1% split)
  const estProfitNaira = Math.round(totalPaidNaira * 0.99);

  // 4. Pending payments
  const pendingOrders = orders.filter((o: any) => o.paymentStatus === "AWAITING_PAYMENT");
  const pendingKobo: bigint = pendingOrders.reduce((acc: bigint, o: any) => acc + toSafeBigInt(o.totalKobo), BigInt(0));
  const pendingNaira = Math.round(Number(pendingKobo) / 100);

  // 5. Today's stats & History Metrics
  const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const todayPaid = paidOrders.filter((o: any) => (o.createdAt ? new Date(o.createdAt) >= startOfToday : false));
  const todayPaidKobo: bigint = todayPaid.reduce((acc: bigint, o: any) => acc + toSafeBigInt(o.totalKobo), BigInt(0));
  const todayPaidNaira = Math.round(Number(todayPaidKobo) / 100);

  const newOrdersToday = orders.filter((o: any) => (o.createdAt ? new Date(o.createdAt) >= startOfToday : false));

  function getStatsForOrders(orderList: typeof paidOrders, growth = 0) {
    const kobo: bigint = orderList.reduce((acc: bigint, o: any) => acc + toSafeBigInt(o.totalKobo), BigInt(0));
    const paidSales = Math.round(Number(kobo) / 100);
    const paidOrdersCount = orderList.length;
    const estProfit = Math.round(paidSales * 0.99);
    return {
      paidSales,
      paidOrdersCount,
      estProfit,
      transactionsCount: paidOrdersCount,
      growthPct: growth,
    };
  }

  const periodHistory = {
    today: getStatsForOrders(todayPaid, salesGrowthPct),
    yesterday: getStatsForOrders(
      paidOrders.filter((o) => {
        if (!o.createdAt) return false;
        const d = new Date(o.createdAt);
        return d >= startOfYesterday && d < startOfToday;
      }),
      0
    ),
    "7d": getStatsForOrders(paidLast7, salesGrowthPct),
    "30d": getStatsForOrders(
      paidOrders.filter((o) => (o.createdAt ? new Date(o.createdAt) >= thirtyDaysAgo : false)),
      0
    ),
    all: getStatsForOrders(paidOrders, 0),
  };

  // 6. Low stock products (stockOnHand <= 2)
  const lowStockProducts = products.filter((p) => (p.stockOnHand ?? 0) <= 2 && p.trackStock);

  // 7. Stale orders (orders older than 2 days still not completed or paid)
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const staleOrders = orders.filter(
    (o) =>
      (o.orderStatus === "AWAITING_PAYMENT" || o.orderStatus === "TO_FULFIL") &&
      o.createdAt &&
      new Date(o.createdAt) < twoDaysAgo
  );

  // 8. Build real attention items
  const attentionItems: {
    id: string;
    type: "payment_pending" | "low_stock" | "stale_order";
    title: string;
    subtitle: string;
    badge: string;
    badgeType: "warning" | "danger" | "info";
  }[] = [];

  pendingOrders.slice(0, 2).forEach((o) => {
    attentionItems.push({
      id: `pending-${o.id}`,
      type: "payment_pending",
      title: "Payment pending",
      subtitle: `#ON-${o.orderNumber} · ₦${Math.round(Number(o.totalKobo ?? 0) / 100).toLocaleString("en-NG")}`,
      badge: "Pending",
      badgeType: "warning",
    });
  });

  lowStockProducts.slice(0, 2).forEach((p) => {
    attentionItems.push({
      id: `lowstock-${p.id}`,
      type: "low_stock",
      title: "Low stock",
      subtitle: `${p.name} (${p.stockOnHand ?? 0} left in stock)`,
      badge: "Low stock",
      badgeType: "danger",
    });
  });

  staleOrders.slice(0, 2).forEach((o) => {
    const oDate = o.createdAt ? new Date(o.createdAt).getTime() : now.getTime();
    const daysAgo = Math.max(1, Math.round((now.getTime() - oDate) / (1000 * 60 * 60 * 24)));
    attentionItems.push({
      id: `stale-${o.id}`,
      type: "stale_order",
      title: "Stale order",
      subtitle: `#ON-${o.orderNumber} · placed ${daysAgo} day${daysAgo > 1 ? "s" : ""} ago`,
      badge: "Needs review",
      badgeType: "warning",
    });
  });

  // 9. Real Chart Data:
  // 7D: Daily data for the past 7 days
  const chart7D: { label: string; value: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

    const daySales: bigint = paidOrders
      .filter((o: any) => {
        if (!o.createdAt) return false;
        const oD = new Date(o.createdAt);
        return oD >= dayStart && oD <= dayEnd;
      })
      .reduce((sum: bigint, o: any) => sum + toSafeBigInt(o.totalKobo), BigInt(0));

    chart7D.push({
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: Math.round(Number(daySales) / 100),
    });
  }

  // 30D: 4 Weeks
  const chart30D: { label: string; value: number }[] = [];
  for (let i = 3; i >= 0; i--) {
    const wStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
    const wEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    const wSales: bigint = paidOrders
      .filter((o: any) => {
        if (!o.createdAt) return false;
        const oD = new Date(o.createdAt);
        return oD >= wStart && oD < wEnd;
      })
      .reduce((sum: bigint, o: any) => sum + toSafeBigInt(o.totalKobo), BigInt(0));

    chart30D.push({
      label: `W${4 - i}`,
      value: Math.round(Number(wSales) / 100),
    });
  }

  // 90D: 3 Months
  const chart90D: { label: string; value: number }[] = [];
  for (let i = 2; i >= 0; i--) {
    const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextM = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const mSales: bigint = paidOrders
      .filter((o: any) => {
        if (!o.createdAt) return false;
        const oD = new Date(o.createdAt);
        return oD >= m && oD < nextM;
      })
      .reduce((sum: bigint, o: any) => sum + toSafeBigInt(o.totalKobo), BigInt(0));

    chart90D.push({
      label: m.toLocaleDateString("en-US", { month: "short" }),
      value: Math.round(Number(mSales) / 100),
    });
  }

  const formattedDate = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const formattedProducts = products.map((p) => ({
    id: p.id,
    name: p.name || "Product",
    slug: p.slug,
    priceKobo: p.priceKobo ? p.priceKobo.toString() : "0",
    stockOnHand: p.stockOnHand ?? 0,
    status: p.status,
    images: (p.images || []).map((img: any) => ({ url: img.url })),
  }));

  return (
    <DashboardClient
      merchantName={firstName}
      merchantInitial={initial}
      merchantEmail={merchant.email}
      businessName={business?.businessName || "Your Shop"}
      slug={slug}
      fullStoreUrl={urls.fullStore}
      displayStoreUrl={urls.displayStore}
      formattedDate={formattedDate}
      metrics={{
        paidSales: totalPaidNaira,
        paidOrdersCount: paidOrders.length,
        salesGrowthPct,
        ordersGrowthPct,
        estProfit: estProfitNaira,
        pendingPayments: pendingNaira,
        pendingOrdersCount: pendingOrders.length,
        todaySales: todayPaidNaira,
        todayTransactionsCount: todayPaid.length,
        newOrdersTodayCount: newOrdersToday.length,
        lowStockCount: lowStockProducts.length,
      }}
      charts={{
        chart7D,
        chart30D,
        chart90D,
      }}
      attentionItems={attentionItems}
      periodHistory={periodHistory}
      products={formattedProducts}
      totalProductsCount={products.length}
    />
  );
}
