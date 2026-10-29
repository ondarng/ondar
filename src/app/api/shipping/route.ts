import { NextRequest, NextResponse } from "next/server";
import { getCurrentMerchant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCoveragePreview, ShippingStateRate } from "@/lib/shipping";

export async function GET() {
  const merchant = await getCurrentMerchant();
  if (!merchant) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.businessProfile.findUnique({
    where: { merchantId: merchant.id },
  });

  const rawRates = await prisma.shippingRate.findMany({
    where: { merchantId: merchant.id },
    orderBy: { createdAt: "asc" },
  });

  // Group into state rates and their overrides
  const stateRateMap = new Map<string, ShippingStateRate>();

  // First pass: find state rates (parentId == null)
  rawRates
    .filter((r) => !r.parentId)
    .forEach((r) => {
      stateRateMap.set(r.id, {
        id: r.id,
        state: r.state,
        deliveryName: r.deliveryName,
        isFree: r.isFree,
        feeKobo: Number(r.feeKobo),
        feeNaira: Number(r.feeKobo) / 100,
        estimatedDelivery: r.estimatedDelivery,
        overrides: [],
      });
    });

  // Second pass: attach overrides
  rawRates
    .filter((r) => r.parentId)
    .forEach((r) => {
      const parent = stateRateMap.get(r.parentId!);
      if (parent) {
        parent.overrides.push({
          id: r.id,
          parentId: r.parentId!,
          state: r.state,
          area: r.area || "",
          deliveryName: r.deliveryName,
          isFree: r.isFree,
          feeKobo: Number(r.feeKobo),
          feeNaira: Number(r.feeKobo) / 100,
          estimatedDelivery: r.estimatedDelivery,
        });
      }
    });

  const stateRates = Array.from(stateRateMap.values());
  const deliveryEnabled = profile?.deliveryEnabled ?? false;
  const pickupEnabled = profile?.pickupEnabled ?? false;
  const city = profile?.city || "Ikeja";
  const state = profile?.state || "Lagos";
  const address = profile?.address || null;

  const coveragePreview = generateCoveragePreview(
    deliveryEnabled,
    pickupEnabled,
    stateRates,
    city,
    state
  );

  return NextResponse.json({
    success: true,
    businessName: profile?.businessName || "My Store",
    deliveryEnabled,
    pickupEnabled,
    businessLocation: {
      city,
      state,
      address,
    },
    stateRates,
    coveragePreview,
  });
}

export async function PATCH(req: NextRequest) {
  const merchant = await getCurrentMerchant();
  if (!merchant) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { deliveryEnabled, pickupEnabled } = body;

    const dataToUpdate: { deliveryEnabled?: boolean; pickupEnabled?: boolean; deliveryCoverage?: string } = {};

    if (typeof deliveryEnabled === "boolean") {
      dataToUpdate.deliveryEnabled = deliveryEnabled;
    }
    if (typeof pickupEnabled === "boolean") {
      dataToUpdate.pickupEnabled = pickupEnabled;
    }

    const updated = await prisma.businessProfile.update({
      where: { merchantId: merchant.id },
      data: dataToUpdate,
    });

    // Also update deliveryCoverage string if needed
    const rawRates = await prisma.shippingRate.findMany({
      where: { merchantId: merchant.id, parentId: null },
      include: { overrides: true },
    });

    const mappedRates: ShippingStateRate[] = rawRates.map((r) => ({
      id: r.id,
      state: r.state,
      deliveryName: r.deliveryName,
      isFree: r.isFree,
      feeKobo: Number(r.feeKobo),
      feeNaira: Number(r.feeKobo) / 100,
      estimatedDelivery: r.estimatedDelivery,
      overrides: r.overrides.map((o) => ({
        id: o.id,
        parentId: o.parentId!,
        state: o.state,
        area: o.area || "",
        deliveryName: o.deliveryName,
        isFree: o.isFree,
        feeKobo: Number(o.feeKobo),
        feeNaira: Number(o.feeKobo) / 100,
        estimatedDelivery: o.estimatedDelivery,
      })),
    }));

    const preview = generateCoveragePreview(
      updated.deliveryEnabled,
      updated.pickupEnabled,
      mappedRates,
      updated.city,
      updated.state
    );

    await prisma.businessProfile.update({
      where: { merchantId: merchant.id },
      data: { deliveryCoverage: preview },
    });

    return NextResponse.json({
      success: true,
      deliveryEnabled: updated.deliveryEnabled,
      pickupEnabled: updated.pickupEnabled,
      coveragePreview: preview,
    });
  } catch (error: any) {
    console.error("Failed to update shipping status:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update shipping status" },
      { status: 500 }
    );
  }
}
