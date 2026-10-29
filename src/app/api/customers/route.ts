import { NextRequest, NextResponse } from "next/server";
import { getCurrentMerchant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonSafe } from "@/lib/json";

export async function GET(req: NextRequest) {
  try {
    const merchant = await getCurrentMerchant();
    if (!merchant) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";

    const where: any = {
      merchantId: merchant.id,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      orderBy: [{ totalSpentKobo: "desc" }, { updatedAt: "desc" }],
    });

    // Also get latest order date and recent order preview for each customer
    const customersWithHistory = await Promise.all(
      customers.map(async (c) => {
        const recentOrders = await prisma.order.findMany({
          where: {
            merchantId: merchant.id,
            customerPhone: c.phone,
          },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            orderNumber: true,
            orderStatus: true,
            paymentStatus: true,
            totalKobo: true,
            createdAt: true,
            deliveryType: true,
            deliveryArea: true,
            deliveryState: true,
          },
        });

        const isRepeat = c.totalOrders >= 2;
        const lastOrderAt = recentOrders[0]?.createdAt || c.updatedAt;

        return {
          id: c.id,
          name: c.name,
          phone: c.phone,
          email: c.email,
          totalOrders: c.totalOrders,
          totalSpentKobo: c.totalSpentKobo.toString(),
          isRepeat,
          lastOrderAt,
          recentOrders: recentOrders.map((o) => ({
            ...o,
            totalKobo: o.totalKobo.toString(),
          })),
        };
      })
    );

    return NextResponse.json({
      success: true,
      customers: jsonSafe(customersWithHistory),
      totalCount: customers.length,
    });
  } catch (error: any) {
    console.error("Customers query error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load customers" },
      { status: 500 }
    );
  }
}
