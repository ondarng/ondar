import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPaystackTransaction } from "@/lib/paystack";
import { decryptSecretKey } from "@/lib/encryption";
import { markOrderPaid } from "@/lib/payments";

export async function GET(req: NextRequest) {
  return verifyReference(new URL(req.url).searchParams.get("reference"));
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return verifyReference(body.reference);
}

async function verifyReference(reference: unknown) {
  if (typeof reference !== "string" || !reference) return NextResponse.json({ success: false, error: "Payment reference is required" }, { status: 400 });
  const order = await prisma.order.findUnique({
    where: { paymentReference: reference },
    include: { merchant: { include: { paymentConfig: true } } },
  });
  if (!order || !order.merchant.paymentConfig?.isActive) return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
  try {
    const config = order.merchant.paymentConfig;
    const secret = decryptSecretKey(config.encryptedSecretKey, config.secretKeyIv, config.secretKeyTag);
    const transaction = await verifyPaystackTransaction(reference, secret);
    if (transaction.reference !== reference) return NextResponse.json({ success: false, error: "Payment reference mismatch" }, { status: 400 });
    const result = await markOrderPaid(order.id, reference, BigInt(transaction.amount), transaction.currency);
    if (result === "mismatch") return NextResponse.json({ success: false, error: "Payment amount or currency does not match this order." }, { status: 400 });
    if (result === "not_found") return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    return NextResponse.json({ success: true, verified: true, alreadyProcessed: result === "already_processed", order: { id: order.id, orderNumber: order.orderNumber, publicToken: order.publicToken } });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ success: false, error: "Payment verification failed" }, { status: 502 });
  }
}
