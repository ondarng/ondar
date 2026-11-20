import { redirect } from "next/navigation";
import { getCurrentMerchant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrdersClient } from "@/components/orders/OrdersClient";

export default async function OrdersPage() {
  const merchant = await getCurrentMerchant();
  if (!merchant) {
    redirect("/login");
  }

  // Fetch business profile, initial page of orders, and order counts concurrently in a single roundtrip
  const [profile, orders, totalOrdersCount, needsAttentionCount] = await Promise.all([
    prisma.businessProfile.findUnique({
      where: { merchantId: merchant.id },
      select: { slug: true },
    }),
    prisma.order.findMany({
      where: { merchantId: merchant.id },
      orderBy: { createdAt: "desc" },
      take: 25,
      include: {
        lines: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                stockOnHand: true,
                stockReserved: true,
              },
            },
          },
        },
        events: {
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    prisma.order.count({
      where: { merchantId: merchant.id },
    }),
    prisma.order.count({
      where: {
        merchantId: merchant.id,
        OR: [
          { flag: { not: null } },
          { paymentRoute: "BANK_TRANSFER", paymentStatus: "AWAITING_PAYMENT", paymentSentAt: { not: null } },
          {
            orderStatus: "TO_FULFIL",
            createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
        ],
      },
    }),
  ]);

  const serializedOrders = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    publicToken: o.publicToken,
    orderStatus: o.orderStatus,
    paymentStatus: o.paymentStatus,
    customerName: o.customerName,
    customerPhone: o.customerPhone,
    customerEmail: o.customerEmail,
    customerNote: o.customerNote,
    deliveryType: o.deliveryType,
    deliveryFeeKobo: o.deliveryFeeKobo.toString(),
    deliveryState: o.deliveryState,
    deliveryArea: o.deliveryArea,
    deliveryAddress: o.deliveryAddress,
    deliveryInstructions: o.deliveryInstructions,
    subtotalKobo: o.subtotalKobo.toString(),
    discountKobo: o.discountKobo.toString(),
    processingFeeKobo: o.processingFeeKobo.toString(),
    totalKobo: o.totalKobo.toString(),
    ondarCutKobo: o.ondarCutKobo.toString(),
    paymentRoute: o.paymentRoute,
    source: o.source,
    flag: o.flag,
    flagDetails: o.flagDetails,
    privateNote: o.privateNote,
    paymentReference: o.paymentReference || null,
    refundedKobo: o.refundedKobo ? o.refundedKobo.toString() : "0",
    holdExpiresAt: o.holdExpiresAt?.toISOString() || null,
    paymentSentAt: o.paymentSentAt?.toISOString() || null,
    paymentConfirmedAt: o.paymentConfirmedAt?.toISOString() || null,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    lines: o.lines.map((l) => ({
      id: l.id,
      productId: l.productId,
      name: l.name,
      priceKobo: l.priceKobo.toString(),
      quantity: l.quantity,
      lineTotal: l.lineTotal.toString(),
    })),
    events: o.events.map((e) => ({
      id: e.id,
      fromStatus: e.fromStatus,
      toStatus: e.toStatus,
      actor: e.actor,
      note: e.note,
      createdAt: e.createdAt.toISOString(),
    })),
  }));

  return (
    <OrdersClient
      storeSlug={profile?.slug || ""}
      initialOrders={serializedOrders}
      initialCounts={{
        total: totalOrdersCount,
        needsAttention: needsAttentionCount,
      }}
    />
  );
}
