import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StorefrontOrderClient } from "@/components/storefront/customer/StorefrontOrderClient";

interface Props {
  params: Promise<{
    slug: string;
    token: string;
  }>;
  searchParams: Promise<{
    reference?: string;
    trxref?: string;
  }>;
}

export default async function PublicOrderPage({ params, searchParams }: Props) {
  const { slug, token } = await params;
  const { reference, trxref } = await searchParams;

  const profile = await prisma.businessProfile.findUnique({
    where: { slug },
  });

  if (!profile) {
    notFound();
  }

  const rawOrder = await prisma.order.findUnique({
    where: { publicToken: token },
    include: {
      lines: true,
      events: {
        orderBy: { createdAt: "asc" },
      },
      merchant: {
        include: {
          payoutAccount: true,
        },
      },
    },
  });

  if (!rawOrder) {
    notFound();
  }

  const orderDetails = {
    id: rawOrder.id,
    orderNumber: rawOrder.orderNumber,
    publicToken: rawOrder.publicToken,
    orderStatus: rawOrder.orderStatus,
    paymentStatus: rawOrder.paymentStatus,
    customerName: rawOrder.customerName,
    customerPhone: rawOrder.customerPhone,
    customerEmail: rawOrder.customerEmail,
    deliveryType: rawOrder.deliveryType,
    deliveryFeeKobo: rawOrder.deliveryFeeKobo ? rawOrder.deliveryFeeKobo.toString() : "0",
    deliveryState: rawOrder.deliveryState || null,
    deliveryArea: rawOrder.deliveryArea || null,
    deliveryAddress: rawOrder.deliveryAddress || null,
    subtotalKobo: rawOrder.subtotalKobo ? rawOrder.subtotalKobo.toString() : "0",
    totalKobo: rawOrder.totalKobo ? rawOrder.totalKobo.toString() : "0",
    processingFeeKobo: rawOrder.processingFeeKobo ? rawOrder.processingFeeKobo.toString() : "0",
    paymentRoute: rawOrder.paymentRoute || null,
    holdExpiresAt: rawOrder.holdExpiresAt?.toISOString() ?? null,
    createdAt: rawOrder.createdAt ? rawOrder.createdAt.toISOString() : new Date().toISOString(),
    lines: (rawOrder.lines || []).map((l: any) => ({
      id: l.id,
      name: l.name || "Item",
      priceKobo: l.priceKobo ? l.priceKobo.toString() : "0",
      quantity: l.quantity || 1,
      lineTotal: l.lineTotal ? l.lineTotal.toString() : "0",
    })),
    items: (rawOrder.lines || []).map((l: any) => ({
      id: l.id,
      name: l.name || "Item",
      priceKobo: l.priceKobo ? l.priceKobo.toString() : "0",
      quantity: l.quantity || 1,
      lineTotal: l.lineTotal ? l.lineTotal.toString() : "0",
    })),
    events: (rawOrder.events || []).map((e: any) => ({
      id: e.id,
      fromStatus: e.fromStatus || null,
      toStatus: e.toStatus,
      note: e.note || null,
      actor: e.actor || "system",
      createdAt: e.createdAt ? e.createdAt.toISOString() : new Date().toISOString(),
    })),
    bankDetails: rawOrder.merchant.payoutAccount
      ? {
          bankName: rawOrder.merchant.payoutAccount.bankName,
          accountNumber: rawOrder.merchant.payoutAccount.accountNumber,
          accountName: rawOrder.merchant.payoutAccount.accountName,
        }
      : null,
  };

  const pickupAddress =
    rawOrder.deliveryType === "pickup" && rawOrder.paymentStatus === "PAID"
      ? profile.address
      : null;

  const pickupInstructions =
    rawOrder.deliveryType === "pickup" && rawOrder.paymentStatus === "PAID"
      ? profile.pickupInstructions
      : null;

  return (
    <StorefrontOrderClient
      businessName={profile.businessName}
      storeSlug={slug}
      city={profile.city}
      state={profile.state}
      tagline={profile.description}
      whatsappNumber={profile.whatsappNumber}
      phoneNumber={profile.phoneNumber || undefined}
      instagram={profile.instagram}
      tiktok={profile.tiktok}
      twitter={profile.twitter}
      returnPolicy={profile.returnPolicy}
      pickupAddress={pickupAddress || undefined}
      pickupInstructions={pickupInstructions || undefined}
      logoUrl={profile.logoUrl}
      initialOrder={orderDetails}
      referenceFromUrl={reference || trxref}
    />
  );
}
