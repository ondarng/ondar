import { NextRequest, NextResponse } from "next/server";
import { getCurrentMerchant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const merchant = await getCurrentMerchant();
  if (!merchant) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.businessProfile.findUnique({
    where: { merchantId: merchant.id },
  });

  return NextResponse.json({
    success: true,
    businessName: profile?.businessName || "My Store",
    pickupEnabled: profile?.pickupEnabled ?? false,
    address: profile?.address || "14 Aina Street",
    city: profile?.city || "Ikeja",
    state: profile?.state || "Lagos",
    pickupInstructions:
      profile?.pickupInstructions || "Call on arrival. Please have your order number ready.",
  });
}

export async function POST(req: NextRequest) {
  const merchant = await getCurrentMerchant();
  if (!merchant) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { pickupEnabled, pickupInstructions } = body;

    const updated = await prisma.businessProfile.update({
      where: { merchantId: merchant.id },
      data: {
        pickupEnabled: typeof pickupEnabled === "boolean" ? pickupEnabled : undefined,
        pickupInstructions:
          typeof pickupInstructions === "string" ? pickupInstructions.trim() : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      pickupEnabled: updated.pickupEnabled,
      pickupInstructions: updated.pickupInstructions,
    });
  } catch (error: any) {
    console.error("Failed to update pickup settings:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update pickup settings" },
      { status: 500 }
    );
  }
}
