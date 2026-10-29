import React from "react";
import { redirect } from "next/navigation";
import { getCurrentMerchant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCoveragePreview, ShippingStateRate } from "@/lib/shipping";
import { ShippingSettingsClient } from "@/components/shipping/ShippingSettingsClient";

export default async function ShippingSettingsPage() {
  const merchant = await getCurrentMerchant();
  if (!merchant) {
    redirect("/login");
  }

  const profile = await prisma.businessProfile.findUnique({
    where: { merchantId: merchant.id },
  });

  const rawRates = await prisma.shippingRate.findMany({
    where: { merchantId: merchant.id },
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
  const deliveryEnabled = profile?.deliveryEnabled ?? false;
  const pickupEnabled = profile?.pickupEnabled ?? false;
  const city = profile?.city || "Ikeja";
  const state = profile?.state || "Lagos";
  const address = profile?.address || null;

  const coveragePreview = generateCoveragePreview(
    deliveryEnabled,
    pickupEnabled,
    stateRates,
    city,
    state
  );

  return (
    <ShippingSettingsClient
      initialConfig={{
        deliveryEnabled,
        pickupEnabled,
        businessLocation: {
          city,
          state,
          address,
        },
        stateRates,
        coveragePreview,
      }}
      businessName={profile?.businessName || "My Store"}
    />
  );
}
