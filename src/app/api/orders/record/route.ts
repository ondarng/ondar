import { NextRequest, NextResponse } from "next/server";
import { getCurrentMerchant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const merchant = await getCurrentMerchant();
    if (!merchant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      items = [], // Array of { productId, name, priceKobo, quantity }
      customerName,
      customerPhone,
      paymentMethod = "Cash", // "Bank transfer" | "Cash" | "POS" | "Other"
      deliveryType = "pickup",
      alreadyHandedOver = true,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "At least one sale item is required" }, { status: 400 });
    }

    // Calculate line totals and subtotal
    let subtotalKobo = BigInt(0);
    const orderLinesData = items.map((item: any) => {
      const priceKobo = BigInt(item.priceKobo);
      const quantity = Number(item.quantity);
      const lineTotal = priceKobo * BigInt(quantity);
      subtotalKobo += lineTotal;
      return {
        productId: item.productId,
        name: item.name || "Item",
        priceKobo,
        quantity,
        lineTotal,
      };
    });

    const now = new Date();
    const finalOrderStatus = alreadyHandedOver ? "COMPLETED" : "TO_FULFIL";

    const newOrder = await prisma.$transaction(async (tx) => {
      // 1. Immediately commit stock for recorded sale - verify product belongs to merchant
      for (const item of items) {
        const product = await tx.product.findFirst({
          where: { id: item.productId, merchantId: merchant.id },
        });
        if (!product) {
          throw new Error(`Product ${item.name || item.productId} not found or does not belong to this store.`);
        }
        if (product.trackStock) {
          const beforeOnHand = product.stockOnHand;
          const beforeReserved = product.stockReserved;
          const beforeAvailable = Math.max(0, beforeOnHand - beforeReserved);

          if (beforeAvailable < item.quantity) {
            throw new Error(`Insufficient stock for ${product.name}. Available: ${beforeAvailable}`);
          }

          const afterOnHand = Math.max(0, beforeOnHand - item.quantity);
          const afterAvailable = Math.max(0, afterOnHand - beforeReserved);

          await tx.product.update({
            where: { id: item.productId },
            data: { stockOnHand: afterOnHand },
          });

          await tx.stockAudit.create({
            data: {
              productId: item.productId,
              changeQty: -item.quantity,
              beforeAvailable,
              afterAvailable,
              beforeOnHand,
              afterOnHand,
              beforeReserved: beforeReserved,
              afterReserved: beforeReserved,
              reason: "COMMIT_SALE",
              referenceId: "Recorded Sale",
              note: `In-person recorded sale (${paymentMethod}). 0% Ondar fee.`,
              actor: "merchant",
            },
          });
        }
      }

      // 2. Allocate order number atomically using per-merchant counter
      const counter = await tx.orderCounter.upsert({
        where: { merchantId: merchant.id },
        create: { merchantId: merchant.id, nextOrderNumber: 1002 },
        update: { nextOrderNumber: { increment: 1 } },
      });
      const orderNumber = counter.nextOrderNumber - 1;

      // 3. Create the recorded order
      const order = await tx.order.create({
        data: {
          merchantId: merchant.id,
          orderNumber,
          orderStatus: finalOrderStatus,
          paymentStatus: "PAID",
          customerName: customerName?.trim() || "Walk-in customer",
          customerPhone: customerPhone?.trim() || "N/A",
          deliveryType,
          subtotalKobo,
          totalKobo: subtotalKobo,
          ondarCutKobo: BigInt(0), // 0% on recorded sales!
          paymentRoute: "RECORDED",
          source: "RECORDED",
          paymentConfirmedAt: now,
          privateNote: `Payment method: ${paymentMethod}. Recorded by merchant.`,
          lines: {
            create: orderLinesData,
          },
        },
      });

      // 4. Log OrderEvent
      await tx.orderEvent.create({
        data: {
          orderId: order.id,
          fromStatus: null,
          toStatus: finalOrderStatus,
          note: `Sale #${orderNumber} recorded by merchant (${paymentMethod}). Stock committed immediately. 0% Ondar cut.`,
          actor: "merchant",
        },
      });

      return order;
    });

    return NextResponse.json({
      success: true,
      orderNumber: newOrder.orderNumber,
      orderId: newOrder.id,
    });
  } catch (error: any) {
    console.error("Recorded sale error:", error);
    return NextResponse.json({ error: error.message || "Failed to record sale" }, { status: 500 });
  }
}
