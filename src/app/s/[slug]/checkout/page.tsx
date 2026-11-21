import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ShippingStateRate } from "@/lib/shipping";
import { StorefrontCheckoutClient } from "@/components/storefront/customer/StorefrontCheckoutClient";

interface Props {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    custom?: string;
    token?: string;
  }>;
}

export default async function PublicCheckoutPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { custom, token } = await searchParams;
  const customToken = custom || token;

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

  // BYOK is coming soon - no active card checkout
  const hasPaystack = false;

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

  let customCheckoutData: {
    token: string;
    note: string | null;
    status: "ACTIVE" | "EXPIRED" | "USED" | "NOT_FOUND";
    expiresAt: string;
    totalKobo: string;
    items: Array<{
      productId: string;
      name: string;
      priceKobo: number;
      priceNaira: number;
      quantity: number;
      imageUrl?: string;
      slug?: string;
    }>;
  } | null = null;

  if (customToken) {
    try {
      const link = await prisma.customCheckoutLink.findUnique({
        where: { token: customToken },
      });

      if (!link || link.merchantId !== profile.merchantId) {
        customCheckoutData = {
          token: customToken,
          note: null,
          status: "NOT_FOUND",
          expiresAt: new Date().toISOString(),
          totalKobo: "0",
          items: [],
        };
      } else if (link.status !== "ACTIVE" || link.expiresAt <= new Date()) {
        customCheckoutData = {
          token: link.token,
          note: link.note,
          status: link.status === "USED" ? "USED" : "EXPIRED",
          expiresAt: link.expiresAt.toISOString(),
          totalKobo: link.totalKobo.toString(),
          items: [],
        };
      } else {
        // Active custom checkout link!
        const rawItems = (Array.isArray(link.items) ? link.items : []) as Array<{
          productId: string;
          name?: string;
          agreedPriceKobo?: string | number;
          quantity?: number;
        }>;

        const productIds = rawItems.map((it) => it.productId).filter(Boolean);
        const dbProducts = await prisma.product.findMany({
          where: { id: { in: productIds } },
          include: { images: { orderBy: { position: "asc" }, take: 1 } },
        });
        const productMap = new Map(dbProducts.map((p) => [p.id, p]));

        const resolvedItems = rawItems.map((it) => {
          const prod = productMap.get(it.productId);
          const priceKoboNum = Number(it.agreedPriceKobo ?? prod?.priceKobo ?? 0);
          return {
            productId: it.productId,
            name: it.name || prod?.name || "Product",
            priceKobo: priceKoboNum,
            priceNaira: Math.round(priceKoboNum / 100),
            quantity: Number(it.quantity) || 1,
            imageUrl: prod?.images[0]?.url || undefined,
            slug: prod?.slug || undefined,
          };
        });

        customCheckoutData = {
          token: link.token,
          note: link.note,
          status: "ACTIVE",
          expiresAt: link.expiresAt.toISOString(),
          totalKobo: link.totalKobo.toString(),
          items: resolvedItems,
        };
      }
    } catch (err) {
      console.error("Error fetching custom checkout link:", err);
    }
  }

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
      customCheckout={customCheckoutData}
    />
  );
}
