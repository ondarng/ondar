import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id || typeof id !== "string") {
      return NextResponse.json({ success: false, error: "Merchant ID required" }, { status: 400 });
    }

    const merchant = await prisma.merchant.findUnique({
      where: { id },
      select: { id: true, email: true },
    });

    if (!merchant) {
      return NextResponse.json({ success: false, error: "Merchant not found" }, { status: 404 });
    }

    // Cleanly delete all associated data
    // 1. Order details
    await prisma.orderEvent.deleteMany({ where: { order: { merchantId: id } } });
    await prisma.orderLine.deleteMany({ where: { order: { merchantId: id } } });
    await prisma.paymentAttempt.deleteMany({ where: { merchantId: id } });
    await prisma.order.deleteMany({ where: { merchantId: id } });

    // 2. Product details
    await prisma.stockAudit.deleteMany({ where: { product: { merchantId: id } } });
    await prisma.productImage.deleteMany({ where: { product: { merchantId: id } } });
    await prisma.productVariant.deleteMany({ where: { product: { merchantId: id } } });
    await prisma.product.deleteMany({ where: { merchantId: id } });

    // 3. Other relations
    await prisma.customCheckoutLink.deleteMany({ where: { merchantId: id } });
    await prisma.shippingRate.deleteMany({ where: { merchantId: id } });
    await prisma.customer.deleteMany({ where: { merchantId: id } });
    await prisma.orderCounter.deleteMany({ where: { merchantId: id } });
    await prisma.businessProfile.deleteMany({ where: { merchantId: id } });
    await prisma.payoutAccount.deleteMany({ where: { merchantId: id } });
    await prisma.merchantPaymentConfig.deleteMany({ where: { merchantId: id } });

    // 4. Delete the Merchant
    await prisma.merchant.delete({ where: { id } });

    return NextResponse.json({ success: true, message: `Merchant ${merchant.email} deleted.` });
  } catch (err: any) {
    console.error("Admin delete merchant error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete merchant" },
      { status: 500 }
    );
  }
}
