import { NextRequest, NextResponse } from "next/server";
import { getCurrentMerchant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isWholePositiveQuantity(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

function canRunOrderAction(order: {
  orderStatus: string;
  paymentStatus: string;
  deliveryType: string;
}, action: unknown) {
  switch (action) {
    case "CONFIRM_PAYMENT":
      return order.paymentStatus === "AWAITING_PAYMENT" &&
        (order.orderStatus === "AWAITING_PAYMENT" || order.orderStatus === "PAYMENT_SENT");
    case "MARK_READY_FOR_PICKUP":
      return order.paymentStatus === "PAID" && order.deliveryType === "pickup" && order.orderStatus === "TO_FULFIL";
    case "MARK_OUT_FOR_DELIVERY":
      return order.paymentStatus === "PAID" && order.deliveryType !== "pickup" && order.orderStatus === "TO_FULFIL";
    case "MARK_COMPLETED":
      return order.paymentStatus === "PAID" && (order.orderStatus === "OUT_FOR_DELIVERY" || order.orderStatus === "READY_FOR_PICKUP");
    case "RECORD_REFUND":
      return ["PAID", "PARTIALLY_REFUNDED"].includes(order.paymentStatus);
    case "CANCEL_ORDER":
      return !["CANCELLED", "COMPLETED"].includes(order.orderStatus);
    default:
      return true;
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const merchant = await getCurrentMerchant();
    if (!merchant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { action, note, cancelReason } = body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { lines: true },
    });

    if (!order || order.merchantId !== merchant.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!canRunOrderAction(order, action)) {
      return NextResponse.json(
        { error: `Cannot ${String(action).toLowerCase().replaceAll("_", " ")} from this order state.` },
        { status: 409 }
      );
    }

    const now = new Date();

    if (action === "ADD_NOTE") {
      const updated = await prisma.order.update({
        where: { id },
        data: { privateNote: note || "" },
      });
      return NextResponse.json({ success: true, order: updated });
    }

    if (action === "EDIT_DELIVERY") {
      const { recipientName, recipientPhone, deliveryAddress, deliveryArea, deliveryInstructions } = body;
      const updated = await prisma.order.update({
        where: { id },
        data: {
          customerName: recipientName ?? order.customerName,
          customerPhone: recipientPhone ?? order.customerPhone,
          deliveryAddress: deliveryAddress ?? order.deliveryAddress,
          deliveryArea: deliveryArea ?? order.deliveryArea,
          deliveryInstructions: deliveryInstructions ?? order.deliveryInstructions,
        },
      });

      await prisma.orderEvent.create({
        data: {
          orderId: id,
          fromStatus: order.orderStatus,
          toStatus: order.orderStatus,
          note: "Delivery contact and address details updated by merchant.",
          actor: "vendor",
        },
      });

      return NextResponse.json({ success: true, order: updated });
    }

    if (action === "RECORD_REFUND") {
      const { refundKobo, reason, returnItems = [] } = body;
      let amountKobo: bigint;
      try {
        amountKobo = BigInt(refundKobo);
      } catch {
        return NextResponse.json({ error: "Invalid refund amount" }, { status: 400 });
      }
      if (amountKobo <= 0) {
        return NextResponse.json({ error: "Invalid refund amount" }, { status: 400 });
      }

      const currentRefunded = order.refundedKobo || BigInt(0);
      const newTotalRefunded = currentRefunded + amountKobo;
      if (newTotalRefunded > order.totalKobo) {
        return NextResponse.json({ error: "Refund cannot exceed the order total." }, { status: 400 });
      }

      const orderedQuantities = new Map(order.lines.map((line) => [line.productId, line.quantity]));
      if (!Array.isArray(returnItems) || returnItems.some((item) =>
        !item || typeof item.productId !== "string" || !isWholePositiveQuantity(item.quantity) ||
        item.quantity > (orderedQuantities.get(item.productId) || 0)
      )) {
        return NextResponse.json({ error: "Returned items must be products and quantities from this order." }, { status: 400 });
      }

      const newPaymentStatus =
        newTotalRefunded >= order.totalKobo ? "REFUNDED" : "PARTIALLY_REFUNDED";

      await prisma.$transaction(async (tx) => {
        // Restock returned items if requested
        for (const ret of returnItems) {
          const product = await tx.product.findFirst({ where: { id: ret.productId, merchantId: merchant.id } });
          if (product && isWholePositiveQuantity(ret.quantity)) {
            const beforeOnHand = product.stockOnHand;
            const beforeReserved = product.stockReserved;
            const beforeAvailable = Math.max(0, beforeOnHand - beforeReserved);

            const afterOnHand = beforeOnHand + ret.quantity;
            const afterAvailable = Math.max(0, afterOnHand - beforeReserved);

            await tx.product.update({
              where: { id: product.id },
              data: { stockOnHand: afterOnHand },
            });

            await tx.stockAudit.create({
              data: {
                productId: ret.productId,
                changeQty: ret.quantity,
                beforeAvailable,
                afterAvailable,
                beforeOnHand,
                afterOnHand,
                beforeReserved,
                afterReserved: beforeReserved,
                reason: "MANUAL_RESTOCK",
                referenceId: `#${order.orderNumber}`,
                note: `Refund restock for order #${order.orderNumber} (${ret.quantity} unit returned)`,
                actor: "merchant",
              },
            });
          }
        }

        await tx.order.update({
          where: { id },
          data: {
            refundedKobo: newTotalRefunded,
            paymentStatus: newPaymentStatus,
          },
        });

        await tx.orderEvent.create({
          data: {
            orderId: id,
            fromStatus: order.orderStatus,
            toStatus: order.orderStatus,
            note: `Refund of ₦${(Number(amountKobo) / 100).toLocaleString()} recorded outside Ondar. Reason: ${reason || "Not specified"}`,
            actor: "vendor",
          },
        });
      });

      return NextResponse.json({ success: true, paymentStatus: newPaymentStatus });
    }

    if (action === "CONFIRM_PAYMENT") {
      // Manual bank transfer confirmation by vendor
      await prisma.$transaction(async (tx) => {
        // 1. Commit stock reduction from reserved
        for (const line of order.lines) {
          const product = await tx.product.findFirst({ where: { id: line.productId, merchantId: merchant.id } });
          if (product) {
            const beforeOnHand = product.stockOnHand;
            const beforeReserved = product.stockReserved;
            const beforeAvailable = Math.max(0, beforeOnHand - beforeReserved);

            const afterOnHand = Math.max(0, beforeOnHand - line.quantity);
            const afterReserved = Math.max(0, beforeReserved - line.quantity);
            const afterAvailable = Math.max(0, afterOnHand - afterReserved);

            await tx.product.update({
            where: { id: product.id },
              data: {
                stockOnHand: afterOnHand,
                stockReserved: afterReserved,
              },
            });

            await tx.stockAudit.create({
              data: {
                productId: line.productId,
                changeQty: -line.quantity,
                beforeAvailable,
                afterAvailable,
                beforeOnHand,
                afterOnHand,
                beforeReserved,
                afterReserved,
                reason: "COMMIT_SALE",
                referenceId: `#${order.orderNumber}`,
                note: `Bank transfer payment confirmed by merchant for order #${order.orderNumber}`,
                actor: "merchant",
              },
            });
          }
        }

        // 2. Update order to PAID and TO_FULFIL
        await tx.order.update({
          where: { id },
          data: {
            paymentStatus: "PAID",
            orderStatus: "TO_FULFIL",
            paymentConfirmedAt: now,
            flag: null,
            flagDetails: null,
          },
        });

        // 3. Log event
        await tx.orderEvent.create({
          data: {
            orderId: id,
            fromStatus: order.orderStatus,
            toStatus: "TO_FULFIL",
            note: "Bank transfer payment verified and confirmed by merchant.",
            actor: "vendor",
          },
        });
      });

      return NextResponse.json({ success: true, message: "Payment confirmed" });
    }

    if (action === "MARK_READY_FOR_PICKUP") {
      await prisma.$transaction([
        prisma.order.update({
          where: { id },
          data: { orderStatus: "READY_FOR_PICKUP" },
        }),
        prisma.orderEvent.create({
          data: {
            orderId: id,
            fromStatus: order.orderStatus,
            toStatus: "READY_FOR_PICKUP",
            note: "Order marked ready for pickup by merchant.",
            actor: "vendor",
          },
        }),
      ]);
      return NextResponse.json({ success: true });
    }

    if (action === "MARK_OUT_FOR_DELIVERY") {
      await prisma.$transaction([
        prisma.order.update({
          where: { id },
          data: { orderStatus: "OUT_FOR_DELIVERY" },
        }),
        prisma.orderEvent.create({
          data: {
            orderId: id,
            fromStatus: order.orderStatus,
            toStatus: "OUT_FOR_DELIVERY",
            note: "Parcel dispatched for delivery.",
            actor: "vendor",
          },
        }),
      ]);
      return NextResponse.json({ success: true });
    }

    if (action === "MARK_COMPLETED") {
      await prisma.$transaction([
        prisma.order.update({
          where: { id },
          data: { orderStatus: "COMPLETED" },
        }),
        prisma.orderEvent.create({
          data: {
            orderId: id,
            fromStatus: order.orderStatus,
            toStatus: "COMPLETED",
            note: "Order marked completed.",
            actor: "vendor",
          },
        }),
      ]);
      return NextResponse.json({ success: true });
    }

    if (action === "CANCEL_ORDER") {
      const { itemsToRestock = [] } = body; // Array of { productId, quantity }
      const orderedQuantities = new Map(order.lines.map((line) => [line.productId, line.quantity]));
      if (!Array.isArray(itemsToRestock) || itemsToRestock.some((item) =>
        !item || typeof item.productId !== "string" || !isWholePositiveQuantity(item.quantity) ||
        item.quantity > (orderedQuantities.get(item.productId) || 0)
      )) {
        return NextResponse.json({ error: "Restocked items must be products and quantities from this order." }, { status: 400 });
      }

      await prisma.$transaction(async (tx) => {
        // If stock was reserved and unpaid, release reserved
        if (order.paymentStatus === "AWAITING_PAYMENT") {
          for (const line of order.lines) {
            const product = await tx.product.findFirst({ where: { id: line.productId, merchantId: merchant.id } });
            if (product) {
              const beforeOnHand = product.stockOnHand;
              const beforeReserved = product.stockReserved;
              const beforeAvailable = Math.max(0, beforeOnHand - beforeReserved);

              const afterReserved = Math.max(0, beforeReserved - line.quantity);
              const afterAvailable = Math.max(0, beforeOnHand - afterReserved);

              await tx.product.update({
                where: { id: product.id },
                data: { stockReserved: afterReserved },
              });

              await tx.stockAudit.create({
                data: {
                  productId: line.productId,
                  changeQty: line.quantity,
                  beforeAvailable,
                  afterAvailable,
                  beforeOnHand,
                  afterOnHand: beforeOnHand,
                  beforeReserved,
                  afterReserved,
                  reason: "RELEASE_HOLD",
                  referenceId: `#${order.orderNumber}`,
                  note: `Order #${order.orderNumber} cancelled by merchant. Stock reservation released.`,
                  actor: "merchant",
                },
              });
            }
          }
        } else {
          // Order was PAID: Return selected items back to onHand
          for (const item of itemsToRestock) {
            const product = await tx.product.findFirst({ where: { id: item.productId, merchantId: merchant.id } });
            if (product && isWholePositiveQuantity(item.quantity)) {
              const beforeOnHand = product.stockOnHand;
              const beforeReserved = product.stockReserved;
              const beforeAvailable = Math.max(0, beforeOnHand - beforeReserved);

              const afterOnHand = beforeOnHand + item.quantity;
              const afterAvailable = Math.max(0, afterOnHand - beforeReserved);

              await tx.product.update({
                where: { id: product.id },
                data: { stockOnHand: afterOnHand },
              });

              await tx.stockAudit.create({
                data: {
                  productId: item.productId,
                  changeQty: item.quantity,
                  beforeAvailable,
                  afterAvailable,
                  beforeOnHand,
                  afterOnHand: beforeOnHand,
                  beforeReserved,
                  afterReserved: beforeReserved,
                  reason: "MANUAL_RESTOCK",
                  referenceId: `#${order.orderNumber}`,
                  note: `Cancellation restock: ${item.quantity} units returned to inventory for order #${order.orderNumber}.`,
                  actor: "merchant",
                },
              });
            }
          }
        }

        await tx.order.update({
          where: { id },
          data: {
            orderStatus: "CANCELLED",
          },
        });

        await tx.orderEvent.create({
          data: {
            orderId: id,
            fromStatus: order.orderStatus,
            toStatus: "CANCELLED",
            note: cancelReason || "Order cancelled by merchant.",
            actor: "vendor",
          },
        });
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Order action error:", error);
    return NextResponse.json({ error: error.message || "Action failed" }, { status: 500 });
  }
}
