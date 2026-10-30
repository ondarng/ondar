import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { publicToken: token },
      include: {
        lines: true,
        events: {
          orderBy: { createdAt: "asc" },
        },
        merchant: {
          include: {
            payoutAccount: true,
            businessProfile: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const bankDetails = order.merchant.payoutAccount
      ? {
          bankName: order.merchant.payoutAccount.bankName,
          accountNumber: order.merchant.payoutAccount.accountNumber,
          accountName: order.merchant.payoutAccount.accountName,
        }
      : null;

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        publicToken: order.publicToken,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail,
        deliveryType: order.deliveryType,
        deliveryFeeKobo: order.deliveryFeeKobo.toString(),
        deliveryState: order.deliveryState,
        deliveryArea: order.deliveryArea,
        deliveryAddress: order.deliveryAddress,
        subtotalKobo: order.subtotalKobo.toString(),
        totalKobo: order.totalKobo.toString(),
        processingFeeKobo: order.processingFeeKobo.toString(),
        paymentRoute: order.paymentRoute,
        holdExpiresAt: order.holdExpiresAt?.toISOString() ?? null,
        createdAt: order.createdAt.toISOString(),
        items: order.lines.map((l) => ({
          id: l.id,
          name: l.name,
          priceKobo: l.priceKobo.toString(),
          quantity: l.quantity,
          lineTotal: l.lineTotal.toString(),
        })),
        events: order.events.map((e) => ({
          id: e.id,
          fromStatus: e.fromStatus,
          toStatus: e.toStatus,
          note: e.note,
          actor: e.actor,
          createdAt: e.createdAt.toISOString(),
        })),
        bankDetails,
      },
    });
  } catch (err) {
    console.error("Error fetching order tracking:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
