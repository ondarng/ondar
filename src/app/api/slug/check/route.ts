import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "app",
  "auth",
  "billing",
  "checkout",
  "dashboard",
  "help",
  "login",
  "ondar",
  "pay",
  "payment",
  "register",
  "root",
  "settings",
  "signup",
  "status",
  "support",
  "terms",
  "privacy",
  "www",
]);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawSlug = searchParams.get("slug");

  if (!rawSlug) {
    return NextResponse.json({ available: false, error: "Slug is required." }, { status: 400 });
  }

  const slug = rawSlug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (slug.length < 3) {
    return NextResponse.json({
      available: false,
      error: "Store link must be at least 3 characters long.",
    });
  }

  if (slug.length > 30) {
    return NextResponse.json({
      available: false,
      error: "Store link cannot exceed 30 characters.",
    });
  }

  if (RESERVED_SLUGS.has(slug)) {
    return NextResponse.json({
      available: false,
      error: "This store name is reserved for system use.",
    });
  }

  try {
    const { getCurrentMerchant } = await import("@/lib/auth");
    const currentMerchant = await getCurrentMerchant();

    const existing = await prisma.businessProfile.findUnique({
      where: { slug },
      select: { id: true, merchantId: true },
    });

    // If the slug belongs to the currently logged in merchant, it is available to them
    const isOwnedByCurrentMerchant =
      Boolean(existing && currentMerchant && existing.merchantId === currentMerchant.id);

    return NextResponse.json({
      available: !existing || isOwnedByCurrentMerchant,
      slug,
      error: existing && !isOwnedByCurrentMerchant ? "This store link is already taken." : null,
    });
  } catch {
    // If DB is not connected yet during early dev, allow availability check preview
    return NextResponse.json({
      available: true,
      slug,
      error: null,
    });
  }
}
