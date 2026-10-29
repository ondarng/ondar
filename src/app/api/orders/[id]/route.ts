import { NextRequest, NextResponse } from "next/server";
import { getCurrentMerchant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
      const amountKobo = BigInt(refundKobo || 0);
      if (amountKobo <= 0) {
        return NextResponse.json({ error: "Invalid refund amount" }, { status: 400 });
      }

      const currentRefunded = order.refundedKobo || BigInt(0);
      const newTotalRefunded = currentRefunded + amountKobo;

      const newPaymentStatus =
        newTotalRefunded >= order.totalKobo ? "REFUNDED" : "PARTIALLY_REFUNDED";

      await prisma.$transaction(async (tx) => {
        // Restock returned items if requested
        for (const ret of returnItems) {
          const product = await tx.product.findUnique({ where: { id: ret.productId } });
          if (product && ret.quantity > 0) {
            const beforeOnHand = product.stockOnHand;
            const beforeReserved = product.stockReserved;
            const beforeAvailable = Math.max(0, beforeOnHand - beforeReserved);

            const afterOnHand = beforeOnHand + ret.quantity;
            const afterAvailable = Math.max(0, afterOnHand - beforeReserved);

            await tx.product.update({
              where: { id: ret.productId },
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
          const product = await tx.product.findUnique({ where: { id: line.productId } });
          if (product) {
            const beforeOnHand = product.stockOnHand;
            const beforeReserved = product.stockReserved;
            const beforeAvailable = Math.max(0, beforeOnHand - beforeReserved);

            const afterOnHand = Math.max(0, beforeOnHand - line.quantity);
            const afterReserved = Math.max(0, beforeReserved - line.quantity);
            const afterAvailable = Math.max(0, afterOnHand - afterReserved);

            await tx.product.update({
              where: { id: line.productId },
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

      await prisma.$transaction(async (tx) => {
        // If stock was reserved and unpaid, release reserved
        if (order.paymentStatus === "AWAITING_PAYMENT") {
          for (const line of order.lines) {
            const product = await tx.product.findUnique({ where: { id: line.productId } });
            if (product) {
              const beforeOnHand = product.stockOnHand;
              const beforeReserved = product.stockReserved;
              const beforeAvailable = Math.max(0, beforeOnHand - beforeReserved);

              const afterReserved = Math.max(0, beforeReserved - line.quantity);
              const afterAvailable = Math.max(0, beforeOnHand - afterReserved);

              await tx.product.update({
                where: { id: line.productId },
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
            const product = await tx.product.findUnique({ where: { id: item.productId } });
            if (product && item.quantity > 0) {
              const beforeOnHand = product.stockOnHand;
              const beforeReserved = product.stockReserved;
              const beforeAvailable = Math.max(0, beforeOnHand - beforeReserved);

              const afterOnHand = beforeOnHand + item.quantity;
              const afterAvailable = Math.max(0, afterOnHand - beforeReserved);

              await tx.product.update({
                where: { id: item.productId },
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
