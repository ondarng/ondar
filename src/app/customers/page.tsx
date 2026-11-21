import React from "react";
import { redirect } from "next/navigation";
import { getCurrentMerchant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CustomersClient, CustomerItem } from "@/components/customers/CustomersClient";

export default async function CustomersPage() {
  const merchant = await getCurrentMerchant();
  if (!merchant) {
    redirect("/login");
  }

  const profile = await prisma.businessProfile.findUnique({
    where: { merchantId: merchant.id },
  });

  const businessName = profile?.businessName || "My Store";

  let customers: CustomerItem[] = [];

  try {
    const dbCustomers = await prisma.customer.findMany({
      where: { merchantId: merchant.id },
      orderBy: [{ totalSpentKobo: "desc" }, { updatedAt: "desc" }],
    });

    customers = await Promise.all(
      (dbCustomers || []).map(async (c) => {
        let recentOrders: any[] = [];
        try {
          recentOrders = await prisma.order.findMany({
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
        } catch {
          // Fallback to empty recent orders
        }

        const lastOrderTime = recentOrders[0]?.createdAt
          ? new Date(recentOrders[0].createdAt).toISOString()
          : c.updatedAt
          ? new Date(c.updatedAt).toISOString()
          : new Date().toISOString();

        return {
          id: c.id,
          name: c.name || "Customer",
          phone: c.phone,
          email: c.email || null,
          totalOrders: c.totalOrders || 0,
          totalSpentKobo: c.totalSpentKobo ? c.totalSpentKobo.toString() : "0",
          isRepeat: (c.totalOrders || 0) >= 2,
          lastOrderAt: lastOrderTime,
          recentOrders: (recentOrders || []).map((o) => ({
            ...o,
            totalKobo: o.totalKobo ? o.totalKobo.toString() : "0",
            createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString(),
          })),
        };
      })
    );
  } catch (error) {
    console.error("Customers query notice:", error);
  }

  return (
    <CustomersClient
      businessName={businessName}
      initialCustomers={customers}
    />
  );
}
