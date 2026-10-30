import { NextRequest, NextResponse } from "next/server";
import { getCurrentMerchant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const TEMPLATE_IDS = ["default", "fashion", "food", "electronics"] as const;
type TemplateId = (typeof TEMPLATE_IDS)[number];

function isTemplateId(value: unknown): value is TemplateId {
  return typeof value === "string" && (TEMPLATE_IDS as readonly string[]).includes(value);
}

export async function GET() {
  const merchant = await getCurrentMerchant();
  if (!merchant) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    email: merchant.email,
    authProvider: merchant.passwordHash ? "email" : "google",
    profile: merchant.businessProfile,
    payout: merchant.payoutAccount,
  });
}

export async function POST(req: NextRequest) {
  const merchant = await getCurrentMerchant();
  if (!merchant) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      businessName,
      description,
      logoUrl,
      whatsappNumber,
      secondaryPhone,
      publicEmail,
      instagram,
      tiktok,
      city,
      state,
      address,
      returnPolicy,
    } = body;

    const updatedProfile = await prisma.businessProfile.upsert({
      where: { merchantId: merchant.id },
      update: {
        businessName: businessName?.trim() || undefined,
        description: description?.trim() || null,
        logoUrl: logoUrl || null,
        whatsappNumber: whatsappNumber?.trim() || undefined,
        secondaryPhone: secondaryPhone?.trim() || null,
        publicEmail: publicEmail?.trim() || null,
        instagram: instagram?.trim() || null,
        tiktok: tiktok?.trim() || null,
        city: city?.trim() || undefined,
        state: state?.trim() || undefined,
        address: address?.trim() || null,
        returnPolicy: returnPolicy?.trim() || undefined,
      },
      create: {
        merchantId: merchant.id,
        businessName: businessName?.trim() || "Ada's Edit",
        slug:
          (businessName || "shop")
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9-]/g, "") || `shop-${Date.now()}`,
        description: description?.trim() || null,
        logoUrl: logoUrl || null,
        whatsappNumber: whatsappNumber?.trim() || "",
        secondaryPhone: secondaryPhone?.trim() || null,
        publicEmail: publicEmail?.trim() || null,
        instagram: instagram?.trim() || null,
        tiktok: tiktok?.trim() || null,
        city: city?.trim() || "Ikeja",
        state: state?.trim() || "Lagos",
        address: address?.trim() || null,
        returnPolicy: returnPolicy?.trim() || undefined,
      },
    });

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error: unknown) {
    console.error("Profile settings update error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile settings." },
      { status: 500 }
    );
  }
}

/** Changes storefront presentation only; commerce data stays untouched. */
export async function PATCH(req: NextRequest) {
  const merchant = await getCurrentMerchant();
  if (!merchant) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { templateId } = await req.json();
    if (!isTemplateId(templateId)) {
      return NextResponse.json(
        { success: false, error: "Choose a valid storefront template." },
        { status: 400 }
      );
    }

    const profile = await prisma.businessProfile.update({
      where: { merchantId: merchant.id },
      data: { templateId },
      select: { templateId: true, slug: true },
    });

    return NextResponse.json({ success: true, profile });
  } catch (error: unknown) {
    console.error("Template update error:", error);
    return NextResponse.json(
      { success: false, error: "Could not update the storefront template." },
      { status: 500 }
    );
  }
}
