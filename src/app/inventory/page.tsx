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

  // 1. Fetch real products for this merchant
  const rawProducts = await prisma.product.findMany({
    where: { merchantId: merchant.id },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  const products: InventoryProduct[] = rawProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    category: p.category,
    priceKobo: p.priceKobo.toString(),
    costKobo: p.costKobo ? p.costKobo.toString() : null,
    status: p.status,
    trackStock: p.trackStock,
    isOutOfStockManual: p.isOutOfStockManual,
    stockOnHand: p.stockOnHand,
    stockReserved: p.stockReserved,
    lowStockThreshold: p.lowStockThreshold,
    images: p.images.map((img) => ({ url: img.url })),
    variants: p.variants.map((v) => ({
      ...v,
      priceKobo: v.priceKobo ? v.priceKobo.toString() : null,
      costKobo: v.costKobo ? v.costKobo.toString() : null,
    })),
  }));

  // 2. Pending orders count for bottom nav badge
  const pendingCount = await prisma.order.count({
    where: {
      merchantId: merchant.id,
      paymentStatus: "AWAITING_PAYMENT",
    },
  });

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
