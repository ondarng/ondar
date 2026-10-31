import { NextRequest, NextResponse } from "next/server";
import { getCurrentMerchant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface MerchantAlert {
  id: string;
  type: "order_to_fulfil" | "bank_transfer_pending" | "flag" | "low_stock" | "system";
  title: string;
  description: string;
  timestamp: string;
  link: string;
  severity: "info" | "warning" | "danger" | "success";
}

export async function GET(req: NextRequest) {
  try {
    const merchant = await getCurrentMerchant();
    if (!merchant) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const alerts: MerchantAlert[] = [];

    // Consolidated concurrent query: 1 for orders (bank transfer, flag, to fulfil) and 1 for low-stock products
    const [relevantOrders, products] = await Promise.all([
      prisma.order.findMany({
        where: {
          merchantId: merchant.id,
          OR: [
            { paymentRoute: "BANK_TRANSFER", paymentStatus: "AWAITING_PAYMENT", paymentSentAt: { not: null } },
            { flag: { not: null } },
            { orderStatus: "TO_FULFIL" },
          ],
        },
        orderBy: { updatedAt: "desc" },
        take: 30,
      }),
      prisma.product.findMany({
        where: {
          merchantId: merchant.id,
          status: "ACTIVE",
          trackStock: true,
        },
        take: 20,
      }),
    ]);

    for (const o of relevantOrders) {
      if (o.paymentRoute === "BANK_TRANSFER" && o.paymentStatus === "AWAITING_PAYMENT" && o.paymentSentAt) {
        alerts.push({
          id: `transfer_${o.id}`,
          type: "bank_transfer_pending",
          title: `Bank transfer claimed on #${o.orderNumber}`,
          description: `${o.customerName} marked payment sent (₦${(Number(o.totalKobo) / 100).toLocaleString()}). Confirm receipt to commit stock.`,
          timestamp: (o.paymentSentAt || o.updatedAt).toISOString(),
          link: `/orders?tab=needs_attention&search=${o.orderNumber}`,
          severity: "warning",
        });
      }

      if (o.flag) {
        alerts.push({
          id: `flag_${o.id}`,
          type: "flag",
          title: `Order #${o.orderNumber} flagged: ${o.flag.replace(/_/g, " ")}`,
          description: o.flagDetails || "This order requires your review before processing.",
          timestamp: o.updatedAt.toISOString(),
          link: `/orders?tab=needs_attention&search=${o.orderNumber}`,
          severity: "danger",
        });
      }

      if (o.orderStatus === "TO_FULFIL") {
        alerts.push({
          id: `fulfil_${o.id}`,
          type: "order_to_fulfil",
          title: `Paid order #${o.orderNumber} to fulfil`,
          description: `${o.customerName} · ₦${(Number(o.totalKobo) / 100).toLocaleString()} · ${o.deliveryType}`,
          timestamp: o.createdAt.toISOString(),
          link: `/orders?search=${o.orderNumber}`,
          severity: "success",
        });
      }
    }

    products.forEach((p) => {
      const available = Math.max(0, p.stockOnHand - p.stockReserved);
      const threshold = p.lowStockThreshold ?? 2;
      if (available <= threshold) {
        alerts.push({
          id: `lowstock_${p.id}`,
          type: "low_stock",
          title: available === 0 ? `Out of stock: ${p.name}` : `Low stock: ${p.name}`,
          description: `${available} units available (threshold is ${threshold}).`,
          timestamp: p.updatedAt.toISOString(),
          link: "/inventory",
          severity: available === 0 ? "danger" : "warning",
        });
      }
    });

    // Sort newest first
    alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      success: true,
      unreadCount: alerts.length,
      alerts,
    });
  } catch (error: any) {
    console.error("Notifications fetch error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
