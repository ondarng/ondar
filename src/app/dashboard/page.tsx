import React from "react";
import { getCurrentMerchant } from "@/lib/auth";
import { redirect } from "next/navigation";
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

  const business = merchant.businessProfile;
  const slug = business?.slug || "shop";
  const urls = getStoreUrls(slug);

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

  // 1. Fetch real orders for this merchant
  const orders = await prisma.order.findMany({
    where: { merchantId: merchant.id },
    orderBy: { createdAt: "desc" },
  });

  // 2. Fetch real products for this merchant
  const products = await prisma.product.findMany({
    where: { merchantId: merchant.id },
    include: { images: { orderBy: { position: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  // 3. Paid orders & revenue calculations
  const paidOrders = orders.filter((o) => o.paymentStatus === "PAID");
  const totalPaidKobo = paidOrders.reduce((acc, o) => acc + BigInt(o.totalKobo), BigInt(0));
  const totalPaidNaira = Math.round(Number(totalPaidKobo) / 100);

  // Growth vs previous 7 days
  const paidLast7 = paidOrders.filter((o) => o.createdAt >= sevenDaysAgo);
  const paidPrev7 = paidOrders.filter((o) => o.createdAt >= fourteenDaysAgo && o.createdAt < sevenDaysAgo);
  const salesLast7 = paidLast7.reduce((acc, o) => acc + BigInt(o.totalKobo), BigInt(0));
  const salesPrev7 = paidPrev7.reduce((acc, o) => acc + BigInt(o.totalKobo), BigInt(0));

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
  const pendingOrders = orders.filter((o) => o.paymentStatus === "AWAITING_PAYMENT");
  const pendingKobo = pendingOrders.reduce((acc, o) => acc + BigInt(o.totalKobo), BigInt(0));
  const pendingNaira = Math.round(Number(pendingKobo) / 100);

  // 5. Today's stats
  const todayPaid = paidOrders.filter((o) => o.createdAt >= startOfToday);
  const todayPaidKobo = todayPaid.reduce((acc, o) => acc + BigInt(o.totalKobo), BigInt(0));
  const todayPaidNaira = Math.round(Number(todayPaidKobo) / 100);

  const newOrdersToday = orders.filter((o) => o.createdAt >= startOfToday);

  // 6. Low stock products (stockOnHand <= 2)
  const lowStockProducts = products.filter((p) => p.stockOnHand <= 2 && p.trackStock);

  // 7. Stale orders (orders older than 2 days still not completed or paid)
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const staleOrders = orders.filter(
    (o) => (o.orderStatus === "AWAITING_PAYMENT" || o.orderStatus === "TO_FULFIL") && o.createdAt < twoDaysAgo
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
      subtitle: `#ON-${o.orderNumber} · ₦${Math.round(Number(o.totalKobo) / 100).toLocaleString("en-NG")}`,
      badge: "Pending",
      badgeType: "warning",
    });
  });

  lowStockProducts.slice(0, 2).forEach((p) => {
    attentionItems.push({
      id: `lowstock-${p.id}`,
      type: "low_stock",
      title: "Low stock",
      subtitle: `${p.name} (${p.stockOnHand} left in stock)`,
      badge: "Low stock",
      badgeType: "danger",
    });
  });

  staleOrders.slice(0, 2).forEach((o) => {
    const daysAgo = Math.max(1, Math.round((now.getTime() - o.createdAt.getTime()) / (1000 * 60 * 60 * 24)));
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

    const daySales = paidOrders
      .filter((o) => o.createdAt >= dayStart && o.createdAt <= dayEnd)
      .reduce((sum, o) => sum + BigInt(o.totalKobo), BigInt(0));

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
    const wSales = paidOrders
      .filter((o) => o.createdAt >= wStart && o.createdAt < wEnd)
      .reduce((sum, o) => sum + BigInt(o.totalKobo), BigInt(0));

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
    const mSales = paidOrders
      .filter((o) => o.createdAt >= m && o.createdAt < nextM)
      .reduce((sum, o) => sum + BigInt(o.totalKobo), BigInt(0));

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
    name: p.name,
    slug: p.slug,
    priceKobo: p.priceKobo.toString(),
    stockOnHand: p.stockOnHand,
    status: p.status,
    images: p.images.map((img) => ({ url: img.url })),
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
      products={formattedProducts}
      totalProductsCount={products.length}
    />
  );
}
