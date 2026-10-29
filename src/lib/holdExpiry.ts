import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export interface ReleaseHoldsResult { releasedOrdersCount: number; releasedItemsCount: number; orderIds: string[]; }

async function releaseProductHold(tx: Prisma.TransactionClient, merchantId: string, productId: string, quantity: number, referenceId: string) {
  const product = await tx.product.findFirst({ where: { id: productId, merchantId } });
  if (!product || !product.trackStock) return 0;
  if (product.stockReserved < quantity) throw new Error("Stock reservation is inconsistent; refusing to release.");
  await tx.product.update({ where: { id: product.id }, data: { stockReserved: { decrement: quantity } } });
  await tx.stockAudit.create({ data: { productId, changeQty: quantity, beforeAvailable: product.stockOnHand - product.stockReserved, afterAvailable: product.stockOnHand - (product.stockReserved - quantity), beforeOnHand: product.stockOnHand, afterOnHand: product.stockOnHand, beforeReserved: product.stockReserved, afterReserved: product.stockReserved - quantity, reason: "RELEASE_HOLD", referenceId, note: "Expired hold released.", actor: "hold-expiry" } });
  return quantity;
}

export async function releaseExpiredHolds(): Promise<ReleaseHoldsResult> {
  const now = new Date();
  const candidates = await prisma.order.findMany({ where: { orderStatus: "AWAITING_PAYMENT", holdExpiresAt: { lt: now } }, select: { id: true } });
  const orderIds: string[] = [];
  let releasedItemsCount = 0;
  for (const candidate of candidates) {
    const result = await prisma.$transaction(async (tx) => {
      const claimed = await tx.order.updateMany({ where: { id: candidate.id, orderStatus: "AWAITING_PAYMENT", paymentStatus: "AWAITING_PAYMENT", holdExpiresAt: { lt: now } }, data: { orderStatus: "CANCELLED" } });
      if (!claimed.count) return { released: 0, processed: false };
      const order = await tx.order.findUniqueOrThrow({ where: { id: candidate.id }, include: { lines: true } });
      let released = 0;
      for (const line of order.lines) released += await releaseProductHold(tx, order.merchantId, line.productId, line.quantity, order.id);
      await tx.orderEvent.create({ data: { orderId: order.id, fromStatus: "AWAITING_PAYMENT", toStatus: "CANCELLED", actor: "system", note: "Stock hold expired and was released." } });
      return { released, processed: true };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    if (result.processed) { orderIds.push(candidate.id); releasedItemsCount += result.released; }
  }

  // Custom checkout holds are not orders yet. Claim the link first so this
  // loop is idempotent, then release only its successfully claimed stock.
  const links = await prisma.customCheckoutLink.findMany({ where: { status: "ACTIVE", expiresAt: { lt: now } }, select: { id: true } });
  for (const candidate of links) {
    await prisma.$transaction(async (tx) => {
      const claimed = await tx.customCheckoutLink.updateMany({ where: { id: candidate.id, status: "ACTIVE", expiresAt: { lt: now } }, data: { status: "EXPIRED" } });
      if (!claimed.count) return;
      const link = await tx.customCheckoutLink.findUniqueOrThrow({ where: { id: candidate.id } });
      const items = Array.isArray(link.items) ? link.items : [];
      for (const item of items) {
        if (item && typeof item === "object" && typeof (item as any).productId === "string" && Number.isSafeInteger((item as any).quantity) && (item as any).quantity > 0) {
          releasedItemsCount += await releaseProductHold(tx, link.merchantId, (item as any).productId, (item as any).quantity, link.id);
        }
      }
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }
  return { releasedOrdersCount: orderIds.length, releasedItemsCount, orderIds };
}
