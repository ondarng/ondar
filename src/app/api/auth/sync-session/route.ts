import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { setSessionCookie, createSessionToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, supabaseId } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Find or create the merchant in Prisma database
    let merchant = await prisma.merchant.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          ...(supabaseId ? [{ googleId: supabaseId }] : []),
        ],
      },
      include: {
        businessProfile: true,
      },
    });

    if (!merchant) {
      merchant = await prisma.merchant.create({
        data: {
          email: cleanEmail,
          googleId: supabaseId || null,
          onboardingStep: 1,
          onboardingState: "IN_PROGRESS",
        },
        include: {
          businessProfile: true,
        },
      });
    } else if (supabaseId && !merchant.googleId) {
      merchant = await prisma.merchant.update({
        where: { id: merchant.id },
        data: { googleId: supabaseId },
        include: {
          businessProfile: true,
        },
      });
    }

    // Set Ondar's authoritative 30-day session cookie
    await setSessionCookie(merchant.id);

    const redirectTo =
      merchant.onboardingState === "COMPLETED" ? "/dashboard" : "/onboarding";

    const response = NextResponse.json({
      success: true,
      merchantId: merchant.id,
      redirectTo,
    });

    // Mirror cookie directly to HTTP response headers for rock-solid delivery across proxies
    const isHttps = req.nextUrl.protocol === "https:";
    const token = createSessionToken(merchant.id);
    response.cookies.set("ondar_session", token, {
      httpOnly: true,
      secure: isHttps || process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error("Session sync error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to synchronize session." },
      { status: 500 }
    );
  }
}
