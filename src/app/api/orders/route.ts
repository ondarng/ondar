import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { computeOndarCutKobo } from "@/lib/paystack";

type RequestedItem = { productId?: unknown; variantId?: unknown; quantity?: unknown };

function validQuantity(value: unknown): number | null {
  const quantity = typeof value === "number" ? value : Number(value);
  return Number.isSafeInteger(quantity) && quantity > 0 ? quantity : null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { storeSlug, customerName, customerPhone, customerEmail, customerNote, deliveryType, deliveryState, deliveryArea, deliveryAddress, deliveryInstructions, paymentRoute, items } = body;
    if (typeof storeSlug !== "string" || typeof customerName !== "string" || !customerName.trim() || typeof customerPhone !== "string" || !customerPhone.trim() || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "A store, customer name, phone number, and at least one item are required." }, { status: 400 });
    }
    if (deliveryType !== "pickup" && deliveryType !== "delivery") return NextResponse.json({ error: "Choose pickup or delivery." }, { status: 400 });

    const cleanSlug = storeSlug.trim().toLowerCase();
    const profile = await prisma.businessProfile.findUnique({
      where: { slug: cleanSlug },
      include: { merchant: { include: { payoutAccount: true } } },
    });
    if (!profile) {
      return NextResponse.json({ error: "Store not found." }, { status: 404 });
    }
    if (!profile.merchant.payoutAccount?.isVerified) {
      return NextResponse.json({ error: "This store cannot accept orders yet. Payout account is not verified." }, { status: 400 });
    }

    const requested = new Map<string, { productId: string; variantId?: string; quantity: number }>();
    for (const raw of items as RequestedItem[]) {
      if (typeof raw.productId !== "string" || !raw.productId || (raw.variantId !== undefined && typeof raw.variantId !== "string")) return NextResponse.json({ error: "Each item must identify a product." }, { status: 400 });
      const quantity = validQuantity(raw.quantity);
      if (!quantity) return NextResponse.json({ error: "Item quantities must be whole numbers above zero." }, { status: 400 });
      const key = `${raw.productId}:${raw.variantId || ""}`;
      const current = requested.get(key);
      requested.set(key, { productId: raw.productId, variantId: raw.variantId as string | undefined, quantity: (current?.quantity || 0) + quantity });
    }

    let deliveryFeeKobo = BigInt(0);
    if (deliveryType === "pickup") {
      if (!profile.pickupEnabled && !profile.address) {
        return NextResponse.json({ error: "Pickup is not available for this store." }, { status: 400 });
      }
    } else {
      if (typeof deliveryAddress !== "string" || !deliveryAddress.trim()) {
        return NextResponse.json({ error: "Please enter your delivery street address." }, { status: 400 });
      }

      // Check merchant configured shipping rates
      const merchantRates = await prisma.shippingRate.findMany({
        where: { merchantId: profile.merchantId },
      });

      if (merchantRates.length > 0) {
        const stateStr = typeof deliveryState === "string" ? deliveryState.trim() : "";
        const stateRates = stateStr
          ? merchantRates.filter((rate) => rate.state.toLowerCase() === stateStr.toLowerCase())
          : [];

        if (stateRates.length > 0) {
          const areaStr = typeof deliveryArea === "string" ? deliveryArea.trim().toLowerCase() : "";
          const chosen = areaStr
            ? stateRates.find((rate) => rate.area?.toLowerCase() === areaStr) ||
              stateRates.find((rate) => rate.parentId === null) ||
              stateRates[0]
            : stateRates.find((rate) => rate.parentId === null) || stateRates[0];

          deliveryFeeKobo = chosen.isFree ? BigInt(0) : chosen.feeKobo;
        } else {
          // If merchant has rates for other states but not this state, use fallback client fee if reasonable
          const clientDeliveryFee = typeof body.deliveryFeeKobo === "number" || typeof body.deliveryFeeKobo === "string"
            ? BigInt(Math.max(0, Math.round(Number(body.deliveryFeeKobo))))
            : BigInt(0);
          deliveryFeeKobo = clientDeliveryFee;
        }
      } else {
        // Merchant has not configured custom database rates yet.
        // Use client-calculated standard/fallback fee or 0
        const clientDeliveryFee = typeof body.deliveryFeeKobo === "number" || typeof body.deliveryFeeKobo === "string"
          ? BigInt(Math.max(0, Math.round(Number(body.deliveryFeeKobo))))
          : BigInt(0);
        deliveryFeeKobo = clientDeliveryFee;
      }
    }

    const processingFeeKobo = typeof body.processingFeeKobo === "number" || typeof body.processingFeeKobo === "string"
      ? BigInt(Math.max(0, Math.round(Number(body.processingFeeKobo))))
      : BigInt(0);

    const holdMinutes = paymentRoute === "PAYSTACK" ? 30 : 6 * 60;
    const order = await prisma.$transaction(async (tx) => {
      const lines: { productId: string; name: string; priceKobo: bigint; quantity: number; lineTotal: bigint }[] = [];
      let subtotalKobo = BigInt(0);
      for (const selection of requested.values()) {
        const product = await tx.product.findFirst({ where: { id: selection.productId, merchantId: profile.merchantId, status: "ACTIVE" }, include: { variants: true } });
        if (!product) throw new Error("One or more products are unavailable.");
        const variant = selection.variantId ? product.variants.find((entry) => entry.id === selection.variantId) : undefined;
        if (selection.variantId && !variant) throw new Error("Selected product variant is unavailable.");
        if (product.trackStock && product.stockOnHand - product.stockReserved < selection.quantity) throw new Error(`${product.name} does not have enough stock.`);
        if (product.trackStock) await tx.product.update({ where: { id: product.id }, data: { stockReserved: { increment: selection.quantity } } });
        const priceKobo = variant?.priceKobo ?? product.priceKobo;
        const lineTotal = priceKobo * BigInt(selection.quantity);
        subtotalKobo += lineTotal;
        lines.push({ productId: product.id, name: variant ? `${product.name} — ${variant.title}` : product.name, priceKobo, quantity: selection.quantity, lineTotal });
      }
      const counter = await tx.orderCounter.upsert({ where: { merchantId: profile.merchantId }, create: { merchantId: profile.merchantId, nextOrderNumber: 1002 }, update: { nextOrderNumber: { increment: 1 } } });
      const totalKobo = subtotalKobo + deliveryFeeKobo + processingFeeKobo;
      const created = await tx.order.create({
        data: {
          merchantId: profile.merchantId,
          orderNumber: counter.nextOrderNumber - 1,
          orderStatus: "AWAITING_PAYMENT",
          paymentStatus: "AWAITING_PAYMENT",
          paymentRoute: paymentRoute === "PAYSTACK" ? "PAYSTACK" : "BANK_TRANSFER",
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: typeof customerEmail === "string" ? customerEmail.trim() || null : null,
          customerNote: typeof customerNote === "string" ? customerNote.trim() || null : null,
          deliveryType,
          deliveryFeeKobo,
          processingFeeKobo,
          deliveryState: deliveryType === "delivery" && typeof deliveryState === "string" ? deliveryState.trim() || null : null,
          deliveryArea: deliveryType === "delivery" && typeof deliveryArea === "string" ? deliveryArea.trim() || null : null,
          deliveryAddress: deliveryType === "delivery" && typeof deliveryAddress === "string" ? deliveryAddress.trim() || null : null,
          deliveryInstructions: typeof deliveryInstructions === "string" ? deliveryInstructions.trim() || null : null,
          subtotalKobo,
          totalKobo,
          ondarCutKobo: computeOndarCutKobo(subtotalKobo),
          holdExpiresAt: new Date(Date.now() + holdMinutes * 60_000),
          lines: { create: lines }
        }
      });
      for (const line of lines) {
        const product = await tx.product.findUniqueOrThrow({ where: { id: line.productId } });
        if (product.trackStock) await tx.stockAudit.create({ data: { productId: product.id, changeQty: line.quantity, beforeAvailable: product.stockOnHand - product.stockReserved + line.quantity, afterAvailable: product.stockOnHand - product.stockReserved, beforeOnHand: product.stockOnHand, afterOnHand: product.stockOnHand, beforeReserved: product.stockReserved - line.quantity, afterReserved: product.stockReserved, reason: "RESERVE_HOLD", referenceId: created.id, note: "Checkout stock hold.", actor: "checkout" } });
      }
      await tx.orderEvent.create({ data: { orderId: created.id, toStatus: "AWAITING_PAYMENT", actor: "customer", note: "Order created and stock reserved." } });
      return created;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      orderId: order.id,
      publicToken: order.publicToken,
      holdExpiresAt: order.holdExpiresAt,
      bankDetails: profile.merchant.payoutAccount
        ? {
            bankName: profile.merchant.payoutAccount.bankName,
            accountNumber: profile.merchant.payoutAccount.accountNumber,
            accountName: profile.merchant.payoutAccount.accountName,
          }
        : null,
    });
  } catch (error: any) {
    const message = error?.code === "P2034" ? "Inventory changed while checking out. Please try again." : error?.message || "Failed to create order";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
