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
    const { items = [], note = "" } = body; // items: Array of { productId, variantId?, name, agreedPriceKobo, quantity }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "At least one item is required" }, { status: 400 });
    }

    // 24-hour expiry for Custom Checkout per PRD CHK-04
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Calculate total agreed price
    let totalKobo = BigInt(0);
    for (const item of items) {
      const price = BigInt(item.agreedPriceKobo);
      const quantity = Number(item.quantity);
      if (price < 0 || !Number.isSafeInteger(quantity) || quantity <= 0) {
        return NextResponse.json({ error: "Custom checkout prices must be non-negative and quantities must be whole numbers above zero." }, { status: 400 });
      }
      totalKobo += price * BigInt(quantity);
    }

    // Transaction: reserve stock for 24 hours & create link
    const link = await prisma.$transaction(async (tx) => {
      // 1. Reserve stock for each item for 24 hours
      for (const item of items) {
        const quantity = Number(item.quantity);
        if (!Number.isSafeInteger(quantity) || quantity <= 0 || typeof item.productId !== "string") {
          throw new Error("Each custom checkout item needs a product and a whole quantity above zero.");
        }
        const product = await tx.product.findFirst({ where: { id: item.productId, merchantId: merchant.id } });
        if (!product) {
          throw new Error("A selected product does not belong to this store.");
        }
        if (product) {
          const beforeOnHand = product.stockOnHand;
          const beforeReserved = product.stockReserved;
          const beforeAvailable = Math.max(0, beforeOnHand - beforeReserved);

          if (product.trackStock && beforeAvailable < quantity) {
            throw new Error(`Insufficient stock for ${item.name}. Available: ${beforeAvailable}`);
          }

          const afterReserved = beforeReserved + quantity;
          const afterAvailable = Math.max(0, beforeOnHand - afterReserved);

          if (product.trackStock) await tx.product.update({ where: { id: item.productId }, data: { stockReserved: afterReserved } });

          if (product.trackStock) await tx.stockAudit.create({
            data: {
              productId: item.productId,
              changeQty: quantity,
              beforeAvailable,
              afterAvailable,
              beforeOnHand,
              afterOnHand: beforeOnHand,
              beforeReserved,
              afterReserved,
              reason: "RESERVE_HOLD",
              referenceId: "Custom Checkout Hold",
              note: `24-hour stock hold for Custom Checkout link.`,
              actor: "merchant",
            },
          });
        }
      }

      // 2. Create CustomCheckoutLink
      return await tx.customCheckoutLink.create({
        data: {
          merchantId: merchant.id,
          note: note.trim() || null,
          totalKobo,
          items,
          expiresAt,
        },
      });
    });

    const profile = await prisma.businessProfile.findUnique({
      where: { merchantId: merchant.id },
      select: { slug: true },
    });

    const storeSlug = profile?.slug || "shop";
    const checkoutUrl = `/s/${storeSlug}/checkout?custom=${link.token}`;

    return NextResponse.json({
      success: true,
      token: link.token,
      checkoutUrl,
      expiresAt: link.expiresAt.toISOString(),
      totalKobo: link.totalKobo.toString(),
    });
  } catch (error: any) {
    console.error("Custom checkout link creation error:", error);
    return NextResponse.json({ error: error.message || "Failed to create custom checkout link" }, { status: 500 });
  }
}
