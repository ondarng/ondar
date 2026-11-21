import React from "react";
import { getCurrentMerchant } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getStoreUrls } from "@/lib/urls";
import { prisma } from "@/lib/prisma";
import { businessInitials } from "@/lib/inventory";
import { InventoryClient, type InventoryProduct } from "./InventoryClient";

export default async function InventoryPage() {
  const merchant = await getCurrentMerchant();

  if (!merchant) {
    redirect("/login");
  }

  if (merchant.onboardingState !== "COMPLETED") {
    redirect("/onboarding");
  }

  const business = merchant.businessProfile;
  const slug = business?.slug || "shop";
  const urls = getStoreUrls(slug);

  const businessName = business?.businessName || "My Store";
  const location = business?.state ? `${business.city ? business.city + ", " : ""}${business.state}` : "Nigeria";
  const initials = businessInitials(businessName);

  // Concurrently fetch real products and pending badge count with fallback resilience
  let rawProducts: any[] = [];
  let pendingCount = 0;

  try {
    const results = await Promise.all([
      prisma.product.findMany({
        where: { merchantId: merchant.id },
        include: {
          images: { orderBy: { position: "asc" } },
          variants: { orderBy: { createdAt: "asc" } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({
        where: {
          merchantId: merchant.id,
          paymentStatus: "AWAITING_PAYMENT",
        },
      }),
    ]);
    rawProducts = results[0] || [];
    pendingCount = results[1] || 0;
  } catch (error) {
    console.error("Inventory database fetch notice:", error);
  }

  const products: InventoryProduct[] = (rawProducts || []).map((p) => ({
    id: p.id,
    name: p.name || "Product",
    slug: p.slug,
    sku: p.sku || null,
    category: p.category || null,
    priceKobo: p.priceKobo ? p.priceKobo.toString() : "0",
    costKobo: p.costKobo ? p.costKobo.toString() : null,
    status: p.status,
    trackStock: p.trackStock ?? true,
    isOutOfStockManual: p.isOutOfStockManual ?? false,
    stockOnHand: p.stockOnHand ?? 0,
    stockReserved: p.stockReserved ?? 0,
    lowStockThreshold: p.lowStockThreshold || null,
    images: (p.images || []).map((img: any) => ({ url: img.url })),
    variants: (p.variants || []).map((v: any) => ({
      ...v,
      priceKobo: v.priceKobo ? v.priceKobo.toString() : null,
      costKobo: v.costKobo ? v.costKobo.toString() : null,
    })),
  }));

  return (
    <InventoryClient
      businessName={businessName}
      location={location}
      initials={initials}
      merchantEmail={merchant.email}
      fullStoreUrl={urls.fullStore}
      products={products}
      pendingBadgeCount={pendingCount}
    />
  );
}
