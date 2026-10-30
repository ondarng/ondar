import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { generateCoveragePreview, ShippingStateRate } from "@/lib/shipping";
import { StorefrontCartClient } from "@/components/storefront/customer/StorefrontCartClient";

interface Props {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    previewTemplate?: string;
  }>;
}

export default async function PublicCartPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { previewTemplate } = await searchParams;

  const profile = await prisma.businessProfile.findUnique({
    where: { slug },
  });

  if (!profile) {
    notFound();
  }

  // Fetch shipping configuration for Coverage Preview banner
  const rawRates = await prisma.shippingRate.findMany({
    where: { merchantId: profile.merchantId },
    orderBy: { createdAt: "asc" },
  });

  const stateRateMap = new Map<string, ShippingStateRate>();
  rawRates
    .filter((r) => !r.parentId)
    .forEach((r) => {
      stateRateMap.set(r.id, {
        id: r.id,
        state: r.state,
        deliveryName: r.deliveryName,
        isFree: r.isFree,
        feeKobo: Number(r.feeKobo),
        feeNaira: Number(r.feeKobo) / 100,
        estimatedDelivery: r.estimatedDelivery,
        overrides: [],
      });
    });

  rawRates
    .filter((r) => r.parentId)
    .forEach((r) => {
      const parent = stateRateMap.get(r.parentId!);
      if (parent) {
        parent.overrides.push({
          id: r.id,
          parentId: r.parentId!,
          state: r.state,
          area: r.area || "",
          deliveryName: r.deliveryName,
          isFree: r.isFree,
          feeKobo: Number(r.feeKobo),
          feeNaira: Number(r.feeKobo) / 100,
          estimatedDelivery: r.estimatedDelivery,
        });
      }
    });

  const stateRates = Array.from(stateRateMap.values());
  const coveragePreview = generateCoveragePreview(
    profile.deliveryEnabled,
    profile.pickupEnabled,
    stateRates,
    profile.city,
    profile.state
  );

  return (
    <StorefrontCartClient
      businessName={profile.businessName}
      storeSlug={slug}
      city={profile.city}
      state={profile.state}
      tagline={profile.description}
      whatsappNumber={profile.whatsappNumber}
      phoneNumber={profile.phoneNumber || undefined}
      returnPolicy={profile.returnPolicy}
      coveragePreview={coveragePreview}
      previewTemplate={previewTemplate}
    />
  );
}
