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

    const customerPhones = customers.map((c) => c.phone);
    const recentOrders = customerPhones.length > 0
      ? await prisma.order.findMany({
          where: {
            merchantId: merchant.id,
            customerPhone: { in: customerPhones },
          },
          orderBy: { createdAt: "desc" },
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
            customerPhone: true,
          },
        })
      : [];

    // Group up to 5 latest orders per customer phone
    const ordersByPhone = new Map<string, typeof recentOrders>();
    for (const order of recentOrders) {
      const list = ordersByPhone.get(order.customerPhone);
      if (!list) {
        ordersByPhone.set(order.customerPhone, [order]);
      } else if (list.length < 5) {
        list.push(order);
      }
    }

    const customersWithHistory = customers.map((c) => {
      const orders = ordersByPhone.get(c.phone) || [];
      const isRepeat = c.totalOrders >= 2;
      const lastOrderAt = orders[0]?.createdAt || c.updatedAt;

      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        totalOrders: c.totalOrders,
        totalSpentKobo: c.totalSpentKobo.toString(),
        isRepeat,
        lastOrderAt,
        recentOrders: orders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          orderStatus: o.orderStatus,
          paymentStatus: o.paymentStatus,
          totalKobo: o.totalKobo.toString(),
          createdAt: o.createdAt,
          deliveryType: o.deliveryType,
          deliveryArea: o.deliveryArea,
          deliveryState: o.deliveryState,
        })),
      };
    });

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
