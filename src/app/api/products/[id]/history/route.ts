import { NextRequest, NextResponse } from "next/server";
import { getCurrentMerchant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonSafe } from "@/lib/json";
import { getOwnedProduct } from "@/lib/owned";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const merchant = await getCurrentMerchant();
  if (!merchant) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const product = await getOwnedProduct(merchant.id, id);

  if (!product) {
    return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
  }

  const audits = await prisma.stockAudit.findMany({
    where: { productId: id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    success: true,
    history: jsonSafe(audits),
  });
}
