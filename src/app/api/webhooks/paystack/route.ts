import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { decryptSecretKey } from "@/lib/encryption";
import { markOrderPaid } from "@/lib/payments";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  let event: any;
  try { event = JSON.parse(rawBody); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (event?.event !== "charge.success" || typeof event?.data?.reference !== "string") return NextResponse.json({ received: true });

  // The reference is stored at initialization. Metadata is deliberately not
  // used to choose a tenant or signing key because it is sender-controlled.
  const order = await prisma.order.findUnique({ where: { paymentReference: event.data.reference }, include: { merchant: { include: { paymentConfig: true } } } });
  if (!order || !order.merchant.paymentConfig?.isActive) return NextResponse.json({ error: "Unknown payment reference" }, { status: 404 });
  try {
    const config = order.merchant.paymentConfig;
    const secret = decryptSecretKey(config.encryptedSecretKey, config.secretKeyIv, config.secretKeyTag);
    const expected = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
    const valid = expected.length === signature.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    if (!valid) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    const result = await markOrderPaid(order.id, event.data.reference, BigInt(event.data.amount), event.data.currency);
    if (result === "mismatch") return NextResponse.json({ error: "Payment mismatch" }, { status: 400 });
    return NextResponse.json({ received: true, alreadyProcessed: result === "already_processed" });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
