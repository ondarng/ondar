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
    deliveryFeeKobo: rawOrder.deliveryFeeKobo.toString(),
    deliveryState: rawOrder.deliveryState,
    deliveryArea: rawOrder.deliveryArea,
    deliveryAddress: rawOrder.deliveryAddress,
    subtotalKobo: rawOrder.subtotalKobo.toString(),
    totalKobo: rawOrder.totalKobo.toString(),
    processingFeeKobo: rawOrder.processingFeeKobo.toString(),
    paymentRoute: rawOrder.paymentRoute,
    holdExpiresAt: rawOrder.holdExpiresAt?.toISOString() ?? null,
    createdAt: rawOrder.createdAt.toISOString(),
    lines: rawOrder.lines.map((l) => ({
      id: l.id,
      name: l.name,
      priceKobo: l.priceKobo.toString(),
      quantity: l.quantity,
      lineTotal: l.lineTotal.toString(),
    })),
    items: rawOrder.lines.map((l) => ({
      id: l.id,
      name: l.name,
      priceKobo: l.priceKobo.toString(),
      quantity: l.quantity,
      lineTotal: l.lineTotal.toString(),
    })),
    events: rawOrder.events.map((e) => ({
      id: e.id,
      fromStatus: e.fromStatus,
      toStatus: e.toStatus,
      note: e.note,
      actor: e.actor,
      createdAt: e.createdAt.toISOString(),
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
      tagline={profile.description}
      whatsappNumber={profile.whatsappNumber}
      phoneNumber={profile.phoneNumber || undefined}
      pickupAddress={pickupAddress || undefined}
      pickupInstructions={pickupInstructions || undefined}
      initialOrder={orderDetails}
      referenceFromUrl={reference || trxref}
    />
  );
}
