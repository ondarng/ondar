import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ShippingStateRate } from "@/lib/shipping";
import { StorefrontCheckoutClient } from "@/components/storefront/customer/StorefrontCheckoutClient";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PublicCheckoutPage({ params }: Props) {
  const { slug } = await params;

  const profile = await prisma.businessProfile.findUnique({
    where: { slug },
  });

  if (!profile) {
    notFound();
  }

  // PRD v2 Section 7.1: Query vendor's verified bank account
  const payoutAccount = await prisma.payoutAccount.findUnique({
    where: { merchantId: profile.merchantId },
  });

  const paymentConfig = await prisma.merchantPaymentConfig.findUnique({
    where: { merchantId: profile.merchantId },
  });

  const hasPaystack = !!(paymentConfig && paymentConfig.isActive);

  const bankDetails =
    payoutAccount && payoutAccount.accountNumber
      ? {
          bankName: payoutAccount.bankName,
          accountNumber: payoutAccount.accountNumber,
          accountName: payoutAccount.accountName,
        }
      : null;

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

  return (
    <StorefrontCheckoutClient
      businessName={profile.businessName}
      storeSlug={slug}
      city={profile.city}
      state={profile.state}
      tagline={profile.description}
      pickupAddress={profile.address}
      whatsappNumber={profile.whatsappNumber}
      phoneNumber={profile.phoneNumber || undefined}
      deliveryEnabled={profile.deliveryEnabled}
      pickupEnabled={profile.pickupEnabled}
      shippingRates={stateRates}
      initialBankDetails={bankDetails}
      hasPaystack={hasPaystack}
      feeBearer={paymentConfig?.feeBearer === "CUSTOMER" ? "CUSTOMER" : "MERCHANT"}
    />
  );
}
