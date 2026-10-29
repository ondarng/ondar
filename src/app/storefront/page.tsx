import React from "react";
import { getCurrentMerchant } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getStoreUrls } from "@/lib/urls";
import { prisma } from "@/lib/prisma";
import { StorefrontHub, type StorefrontProduct } from "@/components/storefront/StorefrontHub";

interface PageProps {
  searchParams: Promise<{
    view?: "hub" | "share" | "delivery-returns" | "reviews";
  }>;
}

export default async function StorefrontPage({ searchParams }: PageProps) {
  const merchant = await getCurrentMerchant();

  if (!merchant) {
    redirect("/login");
  }

  if (merchant.onboardingState !== "COMPLETED") {
    redirect("/onboarding");
  }

  const { view } = await searchParams;

  const business = merchant.businessProfile;
  const slug = business?.slug || "shop";
  const urls = getStoreUrls(slug);

  const businessName = business?.businessName || "My Store";
  const state = business?.state || "Lagos";
  const city = business?.city || "Ikeja";
  const returnPolicy = business?.returnPolicy || "";
  const deliveryCoverage = business?.deliveryCoverage || "Lagos - Ikeja, Yaba and Lekki";

  // Fetch active products
  const rawProducts = await prisma.product.findMany({
    where: {
      merchantId: merchant.id,
      status: "ACTIVE",
    },
    include: {
      images: { orderBy: { position: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  const activeProducts: StorefrontProduct[] = rawProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    priceKobo: p.priceKobo.toString(),
    description: p.description,
    images: p.images.map((img) => ({ url: img.url })),
  }));

  const pendingCount = await prisma.order.count({
    where: {
      merchantId: merchant.id,
      paymentStatus: "AWAITING_PAYMENT",
    },
  });

  return (
    <StorefrontHub
      businessName={businessName}
      storeSlug={slug}
      fullStoreUrl={urls.fullStore}
      displayStoreUrl={urls.displayStore}
      state={state}
      city={city}
      returnPolicy={returnPolicy}
      deliveryCoverage={deliveryCoverage}
      activeProducts={activeProducts}
      hasActiveProducts={activeProducts.length > 0}
      pendingBadgeCount={pendingCount}
      initialView={view || "hub"}
    />
  );
}
