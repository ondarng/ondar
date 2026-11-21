import { redirect } from "next/navigation";
import { getCurrentMerchant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrdersClient } from "@/components/orders/OrdersClient";

export default async function OrdersPage() {
  const merchant = await getCurrentMerchant();
  if (!merchant) {
    redirect("/login");
  }

  let profile: { slug: string | null } | null = null;
  let orders: any[] = [];
  let totalOrdersCount = 0;
  let needsAttentionCount = 0;

  try {
    const results = await Promise.all([
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
    profile = results[0];
    orders = results[1] || [];
    totalOrdersCount = results[2] || 0;
    needsAttentionCount = results[3] || 0;
  } catch (error) {
    console.error("OrdersPage query notice:", error);
  }

  const serializedOrders = (orders || []).map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    publicToken: o.publicToken,
    orderStatus: o.orderStatus,
    paymentStatus: o.paymentStatus,
    customerName: o.customerName || "Customer",
    customerPhone: o.customerPhone || "",
    customerEmail: o.customerEmail || null,
    customerNote: o.customerNote || null,
    deliveryType: o.deliveryType || "delivery",
    deliveryFeeKobo: o.deliveryFeeKobo ? o.deliveryFeeKobo.toString() : "0",
    deliveryState: o.deliveryState || null,
    deliveryArea: o.deliveryArea || null,
    deliveryAddress: o.deliveryAddress || null,
    deliveryInstructions: o.deliveryInstructions || null,
    subtotalKobo: o.subtotalKobo ? o.subtotalKobo.toString() : "0",
    discountKobo: o.discountKobo ? o.discountKobo.toString() : "0",
    processingFeeKobo: o.processingFeeKobo ? o.processingFeeKobo.toString() : "0",
    totalKobo: o.totalKobo ? o.totalKobo.toString() : "0",
    ondarCutKobo: o.ondarCutKobo ? o.ondarCutKobo.toString() : "0",
    paymentRoute: o.paymentRoute || null,
    source: o.source || "STOREFRONT",
    flag: o.flag || null,
    flagDetails: o.flagDetails || null,
    privateNote: o.privateNote || null,
    paymentReference: o.paymentReference || null,
    refundedKobo: o.refundedKobo ? o.refundedKobo.toString() : "0",
    holdExpiresAt: o.holdExpiresAt?.toISOString() || null,
    paymentSentAt: o.paymentSentAt?.toISOString() || null,
    paymentConfirmedAt: o.paymentConfirmedAt?.toISOString() || null,
    createdAt: o.createdAt ? o.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: o.updatedAt ? o.updatedAt.toISOString() : new Date().toISOString(),
    lines: (o.lines || []).map((l: any) => ({
      id: l.id,
      productId: l.productId,
      name: l.name || "Product",
      priceKobo: l.priceKobo ? l.priceKobo.toString() : "0",
      quantity: l.quantity || 1,
      lineTotal: l.lineTotal ? l.lineTotal.toString() : "0",
    })),
    events: (o.events || []).map((e: any) => ({
      id: e.id,
      fromStatus: e.fromStatus || null,
      toStatus: e.toStatus,
      actor: e.actor || "system",
      note: e.note || null,
      createdAt: e.createdAt ? e.createdAt.toISOString() : new Date().toISOString(),
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
