import React from "react";
import { getCurrentMerchant } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getStoreUrls } from "@/lib/urls";
import { prisma } from "@/lib/prisma";
import { AnalyticsClient } from "@/components/analytics/AnalyticsClient";

export default async function AnalyticsPage() {
  const merchant = await getCurrentMerchant();

  if (!merchant) {
    redirect("/login");
  }

  if (merchant.onboardingState !== "COMPLETED") {
    redirect("/onboarding");
  }

  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host") || "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");

  const business = merchant.businessProfile;
  const slug = business?.slug || "shop";
  const urls = getStoreUrls(slug, undefined, host, proto);

  // Fetch all store visits for merchant
  const visits = await prisma.storeVisit.findMany({
    where: { merchantId: merchant.id },
    orderBy: { createdAt: "desc" },
    take: 5000,
  });

  // Fetch orders with order lines
  const orders = await prisma.order.findMany({
    where: { merchantId: merchant.id },
    include: {
      lines: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch products for margin / profit calculation
  const products = await prisma.product.findMany({
    where: { merchantId: merchant.id },
    select: {
      id: true,
      name: true,
      priceKobo: true,
      costKobo: true,
      stockOnHand: true,
      status: true,
    },
  });

  // Map to clean client-safe format (handling BigInts)
  const serializedVisits = visits.map((v) => ({
    id: v.id,
    visitorId: v.visitorId,
    path: v.path,
    referrer: v.referrer || "Direct",
    createdAt: v.createdAt.toISOString(),
  }));

  const serializedOrders = orders.map((o) => ({
    id: o.id,
    orderNumber: String(o.orderNumber),
    customerName: o.customerName,
    customerPhone: o.customerPhone,
    totalKobo: o.totalKobo ? o.totalKobo.toString() : "0",
    subtotalKobo: o.subtotalKobo ? o.subtotalKobo.toString() : "0",
    paymentStatus: o.paymentStatus,
    status: o.orderStatus,
    source: o.source,
    createdAt: o.createdAt.toISOString(),
    items: o.lines.map((it) => ({
      id: it.id,
      productId: it.productId,
      name: it.name,
      priceKobo: it.priceKobo ? it.priceKobo.toString() : "0",
      quantity: it.quantity,
      lineTotal: it.lineTotal ? it.lineTotal.toString() : "0",
    })),
  }));

  const serializedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    priceKobo: p.priceKobo ? p.priceKobo.toString() : "0",
    costKobo: p.costKobo ? p.costKobo.toString() : null,
    stockOnHand: p.stockOnHand,
    status: p.status,
  }));

  return (
    <AnalyticsClient
      businessName={business?.businessName || "My Store"}
      storeSlug={slug}
      fullStoreUrl={urls.fullStore}
      visits={serializedVisits}
      orders={serializedOrders}
      products={serializedProducts}
    />
  );
}
