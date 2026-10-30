import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { computeOndarCutKobo, initializePaystackTransaction } from "@/lib/paystack";
import { getRequestOrigin } from "@/lib/urls";

const REUSABLE_ATTEMPT_MS = 25 * 60_000;

type PayableOrder = {
  id: string;
  merchantId: string;
  orderNumber: number;
  publicToken: string;
  orderStatus: string;
  paymentStatus: string;
  paymentReference: string | null;
  holdExpiresAt: Date | null;
  totalKobo: bigint;
  subtotalKobo: bigint;
  customerEmail: string | null;
  customerPhone: string;
  merchant: {
    businessProfile: { slug: string } | null;
    payoutAccount: { isVerified: boolean; paystackSubaccountCode: string } | null;
  };
};

function isPayable(order: PayableOrder) {
  return order.paymentStatus === "AWAITING_PAYMENT" &&
    order.orderStatus === "AWAITING_PAYMENT" &&
    (!order.holdExpiresAt || order.holdExpiresAt > new Date());
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const publicToken = body.publicToken;
    if (typeof publicToken !== "string" || !publicToken) {
      return NextResponse.json({ success: false, error: "Order identifier is required" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { publicToken },
      include: { merchant: { include: { businessProfile: true, payoutAccount: true } } },
    }) as PayableOrder | null;
    if (!order) return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    if (!isPayable(order)) {
      return NextResponse.json({ success: false, error: "This order can no longer be paid online." }, { status: 409 });
    }

    const payout = order.merchant.payoutAccount;
    if (!payout?.isVerified || !payout.paystackSubaccountCode.startsWith("ACCT_")) {
      return NextResponse.json({ success: false, fallbackToBankTransfer: true, error: "Instant card payment is not enabled for this store. Please pay via bank transfer." }, { status: 400 });
    }

    let attempt = order.paymentReference
      ? await prisma.paymentAttempt.findUnique({ where: { reference: order.paymentReference } })
      : null;

    if (!attempt) {
      const reference = `OND-${order.id}-${crypto.randomUUID()}`;
      const claimed = await prisma.order.updateMany({
        where: { id: order.id, paymentReference: null, paymentStatus: "AWAITING_PAYMENT", orderStatus: "AWAITING_PAYMENT", holdExpiresAt: { gt: new Date() } },
        data: { paymentReference: reference, paymentRoute: "PAYSTACK" },
      });
      if (!claimed.count) {
        return NextResponse.json({ success: false, error: "Payment is being prepared. Please try again." }, { status: 409 });
      }
      attempt = await prisma.paymentAttempt.create({
        data: {
          orderId: order.id,
          merchantId: order.merchantId,
          reference,
          chargedKobo: order.totalKobo,
          orderTotalKobo: order.totalKobo,
          ondarShareKobo: computeOndarCutKobo(order.subtotalKobo),
          subaccountCode: payout.paystackSubaccountCode,
        },
      });
    }

    if (attempt.authorizationUrl && attempt.createdAt > new Date(Date.now() - REUSABLE_ATTEMPT_MS)) {
      return NextResponse.json({ success: true, authorizationUrl: attempt.authorizationUrl, reference: attempt.reference });
    }
    if (attempt.status !== "PENDING") {
      return NextResponse.json({ success: false, error: "This payment attempt is no longer payable." }, { status: 409 });
    }

    const storeSlug = order.merchant.businessProfile?.slug || "shop";
    const callbackUrl = `${getRequestOrigin(req)}/s/${storeSlug}/order/${order.publicToken}`;
    const email = order.customerEmail?.includes("@")
      ? order.customerEmail.trim()
      : `customer.${order.customerPhone.replace(/\D/g, "") || order.orderNumber}@orders.ondar.ng`;
    const initialized = await initializePaystackTransaction({
      email,
      amountKobo: attempt.chargedKobo,
      callbackUrl,
      reference: attempt.reference,
      subaccount: attempt.subaccountCode,
      transactionChargeKobo: attempt.ondarShareKobo,
      bearer: "subaccount",
      metadata: { orderId: order.id, merchantId: order.merchantId, orderNumber: order.orderNumber },
    });
    await prisma.paymentAttempt.update({ where: { id: attempt.id }, data: { authorizationUrl: initialized.authorization_url } });
    return NextResponse.json({ success: true, authorizationUrl: initialized.authorization_url, accessCode: initialized.access_code, reference: attempt.reference });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ success: false, error: "Payment is being prepared. Please try again." }, { status: 409 });
    }
    console.error("Central Paystack payment initialization error:", error);
    return NextResponse.json({ success: false, error: "Failed to initialize payment" }, { status: 500 });
  }
}
