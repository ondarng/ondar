import { redirect } from "next/navigation";
import { getCurrentMerchant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrdersClient } from "@/components/orders/OrdersClient";

export default async function OrdersPage() {
  const merchant = await getCurrentMerchant();
  if (!merchant) {
    redirect("/login");
  }

  const profile = await prisma.businessProfile.findUnique({
    where: { merchantId: merchant.id },
    select: { slug: true },
  });

  return <OrdersClient storeSlug={profile?.slug || ""} />;
}
