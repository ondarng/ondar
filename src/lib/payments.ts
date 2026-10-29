import { PaymentStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type MarkPaidResult = "paid" | "already_processed" | "mismatch" | "not_found";

/**
 * The sole stock-commit path for a verified payment. The conditional update
 * claims the unpaid order, so webhook retries and return-URL retries are safe.
 */
export async function markOrderPaid(
  orderId: string,
  reference: string,
  amountKobo: bigint,
  currency: string
): Promise<MarkPaidResult> {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { lines: true },
    });
    if (!order) return "not_found";

    if (currency !== "NGN" || amountKobo !== order.totalKobo) {
      await tx.order.updateMany({
        where: { id: orderId, paymentStatus: PaymentStatus.AWAITING_PAYMENT },
        data: {
          flag: "PAYMENT_MISMATCH",
          flagDetails: `Expected ${order.totalKobo.toString()} NGN; received ${amountKobo.toString()} ${currency}.`,
        },
      });
      return "mismatch";
    }

    const nextStatus = order.deliveryType === "pickup" ? "READY_FOR_PICKUP" : "TO_FULFIL";
    const claimed = await tx.order.updateMany({
      where: {
        id: orderId,
        paymentStatus: PaymentStatus.AWAITING_PAYMENT,
        orderStatus: { in: ["AWAITING_PAYMENT", "PAYMENT_SENT"] },
      },
      data: {
        paymentStatus: PaymentStatus.PAID,
        orderStatus: nextStatus,
        paymentReference: reference,
        paymentRoute: "PAYSTACK",
        paymentConfirmedAt: new Date(),
        flag: null,
        flagDetails: null,
      },
    });
    if (claimed.count === 0) return "already_processed";

    for (const line of order.lines) {
      const product = await tx.product.findFirst({
        where: { id: line.productId, merchantId: order.merchantId },
      });
      if (!product || !product.trackStock) continue;
      const beforeAvailable = Math.max(0, product.stockOnHand - product.stockReserved);
      const afterOnHand = product.stockOnHand - line.quantity;
      const afterReserved = product.stockReserved - line.quantity;
      if (afterOnHand < 0 || afterReserved < 0) {
        throw new Error("Order stock reservation is inconsistent; refusing to commit stock.");
      }
      await tx.product.update({
        where: { id: product.id },
        data: { stockOnHand: afterOnHand, stockReserved: afterReserved },
      });
      await tx.stockAudit.create({
        data: {
          productId: product.id,
          changeQty: -line.quantity,
          beforeAvailable,
          afterAvailable: afterOnHand - afterReserved,
          beforeOnHand: product.stockOnHand,
          afterOnHand,
          beforeReserved: product.stockReserved,
          afterReserved,
          reason: "COMMIT_SALE",
          referenceId: reference,
          note: "Verified Paystack payment committed.",
          actor: "payment-service",
        },
      });
    }

    const phone = order.customerPhone.replace(/[^0-9+]/g, "");
    if (phone) {
      await tx.customer.upsert({
        where: { merchantId_phone: { merchantId: order.merchantId, phone } },
        create: { merchantId: order.merchantId, phone, name: order.customerName, email: order.customerEmail, totalOrders: 1, totalSpentKobo: order.totalKobo },
        update: { name: order.customerName, email: order.customerEmail || undefined, totalOrders: { increment: 1 }, totalSpentKobo: { increment: order.totalKobo } },
      });
    }
    await tx.orderEvent.create({
      data: { orderId, fromStatus: order.orderStatus, toStatus: nextStatus, actor: "payment-service", note: `Verified payment ${reference}.` },
    });
    return "paid";
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}
