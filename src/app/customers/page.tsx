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

  const dbCustomers = await prisma.customer.findMany({
    where: { merchantId: merchant.id },
    orderBy: [{ totalSpentKobo: "desc" }, { updatedAt: "desc" }],
  });

  const customers: CustomerItem[] = await Promise.all(
    dbCustomers.map(async (c) => {
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

      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        totalOrders: c.totalOrders,
        totalSpentKobo: c.totalSpentKobo.toString(),
        isRepeat: c.totalOrders >= 2,
        lastOrderAt: recentOrders[0]?.createdAt.toISOString() || c.updatedAt.toISOString(),
        recentOrders: recentOrders.map((o) => ({
          ...o,
          totalKobo: o.totalKobo.toString(),
          createdAt: o.createdAt.toISOString(),
        })),
      };
    })
  );

  return (
    <CustomersClient
      businessName={businessName}
      initialCustomers={customers}
    />
  );
}
