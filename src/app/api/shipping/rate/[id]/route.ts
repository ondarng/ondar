import { NextRequest, NextResponse } from "next/server";
import { getCurrentMerchant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const merchant = await getCurrentMerchant();
  if (!merchant) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Verify ownership
    const existing = await prisma.shippingRate.findFirst({
      where: { id, merchantId: merchant.id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Shipping rate not found" }, { status: 404 });
    }

    // Delete (cascade will remove children overrides if this was a parent state rate)
    await prisma.shippingRate.delete({
      where: { id },
    });

    // Check if any state rates remain; if 0, turn delivery off
    const remainingCount = await prisma.shippingRate.count({
      where: { merchantId: merchant.id, parentId: null },
    });

    if (remainingCount === 0) {
      await prisma.businessProfile.update({
        where: { merchantId: merchant.id },
        data: { deliveryEnabled: false },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete shipping rate:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete shipping rate" },
      { status: 500 }
    );
  }
}
