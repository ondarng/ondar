import { NextRequest, NextResponse } from "next/server";
import { getCurrentMerchant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const merchant = await getCurrentMerchant();
    if (!merchant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tab = searchParams.get("tab") || "all"; // "all" | "needs_attention"
    const search = searchParams.get("search")?.trim() || "";
    const orderStatuses = searchParams.getAll("orderStatus");
    const paymentStatuses = searchParams.getAll("paymentStatus");
    const sources = searchParams.getAll("source");
    const deliveryTypes = searchParams.getAll("deliveryType");
    const dateRange = searchParams.get("dateRange"); // "today" | "last_7_days" | "custom"
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Base query
    const where: any = {
      merchantId: merchant.id,
    };

    // Needs attention filter
    if (tab === "needs_attention") {
      where.OR = [
        { flag: { not: null } },
        { paymentRoute: "BANK_TRANSFER", paymentStatus: "AWAITING_PAYMENT", paymentSentAt: { not: null } },
        {
          orderStatus: "TO_FULFIL",
          createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      ];
    }

    // Search by order number, customer name, phone
    if (search) {
      const isNum = !isNaN(Number(search.replace("#", "")));
      where.AND = where.AND || [];
      const searchConditions: any[] = [
        { customerName: { contains: search, mode: "insensitive" } },
        { customerPhone: { contains: search } },
      ];
      if (isNum) {
        searchConditions.push({ orderNumber: Number(search.replace("#", "")) });
      }
      where.AND.push({ OR: searchConditions });
    }

    // Filters from drawer
    if (orderStatuses.length > 0) {
      where.orderStatus = { in: orderStatuses };
    }

    if (paymentStatuses.length > 0) {
      where.paymentStatus = { in: paymentStatuses };
    }

    if (sources.length > 0) {
      where.source = { in: sources };
    }

    if (deliveryTypes.length > 0) {
      where.deliveryType = { in: deliveryTypes };
    }

    // Date range filter
    if (dateRange === "today") {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      where.createdAt = { gte: startOfDay };
    } else if (dateRange === "last_7_days") {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      where.createdAt = { gte: sevenDaysAgo };
    } else if (dateRange === "custom" && startDate) {
      const start = new Date(startDate);
      const end = endDate ? new Date(endDate) : new Date();
      end.setHours(23, 59, 59, 999);
      where.createdAt = { gte: start, lte: end };
    }

    // Fetch orders with lines and events
    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        lines: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                stockOnHand: true,
                stockReserved: true,
              },
            },
          },
        },
        events: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // Count for needs attention badge
    const needsAttentionCount = await prisma.order.count({
      where: {
        merchantId: merchant.id,
        OR: [
          { flag: { not: null } },
          { paymentRoute: "BANK_TRANSFER", paymentStatus: "AWAITING_PAYMENT", paymentSentAt: { not: null } },
          {
            orderStatus: "TO_FULFIL",
            createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
        ],
      },
    });

    const totalOrdersCount = await prisma.order.count({
      where: { merchantId: merchant.id },
    });

    return NextResponse.json({
      success: true,
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        publicToken: o.publicToken,
        orderStatus: o.orderStatus,
        paymentStatus: o.paymentStatus,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        customerEmail: o.customerEmail,
        customerNote: o.customerNote,
        deliveryType: o.deliveryType,
        deliveryFeeKobo: o.deliveryFeeKobo.toString(),
        deliveryState: o.deliveryState,
        deliveryArea: o.deliveryArea,
        deliveryAddress: o.deliveryAddress,
        deliveryInstructions: o.deliveryInstructions,
        subtotalKobo: o.subtotalKobo.toString(),
        discountKobo: o.discountKobo.toString(),
        processingFeeKobo: o.processingFeeKobo.toString(),
        totalKobo: o.totalKobo.toString(),
        ondarCutKobo: o.ondarCutKobo.toString(),
        paymentRoute: o.paymentRoute,
        source: o.source,
        flag: o.flag,
        flagDetails: o.flagDetails,
        privateNote: o.privateNote,
        paymentReference: o.paymentReference || null,
        refundedKobo: o.refundedKobo ? o.refundedKobo.toString() : "0",
        holdExpiresAt: o.holdExpiresAt?.toISOString() || null,
        paymentSentAt: o.paymentSentAt?.toISOString() || null,
        paymentConfirmedAt: o.paymentConfirmedAt?.toISOString() || null,
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt.toISOString(),
        lines: o.lines.map((l) => ({
          id: l.id,
          productId: l.productId,
          name: l.name,
          priceKobo: l.priceKobo.toString(),
          quantity: l.quantity,
          lineTotal: l.lineTotal.toString(),
        })),
        events: o.events.map((e) => ({
          id: e.id,
          fromStatus: e.fromStatus,
          toStatus: e.toStatus,
          actor: e.actor,
          note: e.note,
          createdAt: e.createdAt.toISOString(),
        })),
      })),
      counts: {
        total: totalOrdersCount,
        needsAttention: needsAttentionCount,
      },
    });
  } catch (error: any) {
    console.error("Orders query error:", error);
    return NextResponse.json({ error: error.message || "Failed to load orders" }, { status: 500 });
  }
}
