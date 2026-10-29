import { redirect } from "next/navigation";
import { getCurrentMerchant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RecordSaleClient } from "@/components/orders/RecordSaleClient";

export default async function RecordSalePage() {
  const merchant = await getCurrentMerchant();
  if (!merchant) {
    redirect("/login");
  }

  const products = await prisma.product.findMany({
    where: {
      merchantId: merchant.id,
      status: { not: "ARCHIVED" },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      priceKobo: true,
      stockOnHand: true,
      stockReserved: true,
    },
  });

  return (
    <RecordSaleClient
      products={products.map((p) => ({
        id: p.id,
        name: p.name,
        priceKobo: p.priceKobo.toString(),
        stockOnHand: p.stockOnHand,
        stockReserved: p.stockReserved,
      }))}
    />
  );
}
