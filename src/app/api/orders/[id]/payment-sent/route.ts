import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));
    const { publicToken } = body;

    if (!id) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }

    // Verify order exists and matches public token
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        merchant: {
          include: {
            businessProfile: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (publicToken && order.publicToken !== publicToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Must be in AWAITING_PAYMENT to transition to PAYMENT_SENT
    if (order.orderStatus !== "AWAITING_PAYMENT") {
      return NextResponse.json(
        {
          error: `Cannot mark payment sent from status: ${order.orderStatus}`,
          currentStatus: order.orderStatus,
        },
        { status: 400 }
      );
    }

    // Calculate 48-hour locked hold from now (PRD v2 Section 6: stock is never released while claimed payment is waiting)
    const holdUntil = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const now = new Date();

    const [updatedOrder] = await prisma.$transaction([
      prisma.order.update({
        where: { id },
        data: {
          orderStatus: "PAYMENT_SENT",
          paymentSentAt: now,
          holdExpiresAt: holdUntil,
        },
      }),
      prisma.orderEvent.create({
        data: {
          orderId: id,
          fromStatus: "AWAITING_PAYMENT",
          toStatus: "PAYMENT_SENT",
          actor: "customer",
          note: "Customer tapped 'I have sent the payment' via bank transfer.",
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      orderStatus: updatedOrder.orderStatus,
      holdExpiresAt: updatedOrder.holdExpiresAt,
      paymentSentAt: updatedOrder.paymentSentAt,
    });
  } catch (error: any) {
    console.error("Payment sent update error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
