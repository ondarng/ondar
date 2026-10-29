import { NextRequest, NextResponse } from "next/server";
import { getCurrentMerchant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const merchant = await getCurrentMerchant();
  if (!merchant) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      id,
      parentId,
      state,
      area,
      deliveryName,
      isFree,
      feeNaira,
      estimatedDelivery,
    } = body;

    if (!state || !deliveryName) {
      return NextResponse.json(
        { success: false, error: "State and delivery name are required" },
        { status: 400 }
      );
    }

    if (parentId && !area) {
      return NextResponse.json(
        { success: false, error: "Area is required for area override" },
        { status: 400 }
      );
    }

    const feeKobo = isFree ? BigInt(0) : BigInt(Math.round((Number(feeNaira) || 0) * 100));

    let record;
    if (id) {
      // Update existing
      // Verify ownership
      const existing = await prisma.shippingRate.findFirst({
        where: { id, merchantId: merchant.id },
      });
      if (!existing) {
        return NextResponse.json({ success: false, error: "Shipping rate not found" }, { status: 404 });
      }

      record = await prisma.shippingRate.update({
        where: { id },
        data: {
          state: state.trim(),
          area: area ? area.trim() : null,
          deliveryName: deliveryName.trim(),
          isFree: !!isFree,
          feeKobo,
          estimatedDelivery: estimatedDelivery ? estimatedDelivery.trim() : null,
        },
      });
    } else {
      // Create new
      record = await prisma.shippingRate.create({
        data: {
          merchantId: merchant.id,
          parentId: parentId || null,
          state: state.trim(),
          area: area ? area.trim() : null,
          deliveryName: deliveryName.trim(),
          isFree: !!isFree,
          feeKobo,
          estimatedDelivery: estimatedDelivery ? estimatedDelivery.trim() : null,
        },
      });
    }

    // Automatically enable delivery if this is the first state rate added and delivery was off
    if (!parentId) {
      await prisma.businessProfile.update({
        where: { merchantId: merchant.id },
        data: { deliveryEnabled: true },
      });
    }

    return NextResponse.json({
      success: true,
      rate: {
        id: record.id,
        parentId: record.parentId,
        state: record.state,
        area: record.area,
        deliveryName: record.deliveryName,
        isFree: record.isFree,
        feeKobo: Number(record.feeKobo),
        feeNaira: Number(record.feeKobo) / 100,
        estimatedDelivery: record.estimatedDelivery,
      },
    });
  } catch (error: any) {
    console.error("Failed to save shipping rate:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save shipping rate" },
      { status: 500 }
    );
  }
}
