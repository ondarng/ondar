import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    const merchant = await prisma.merchant.findUnique({
      where: { email: cleanEmail },
      include: {
        businessProfile: true,
      },
    });

    if (!merchant || !merchant.passwordHash) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, merchant.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    await setSessionCookie(merchant.id);

    // Redirect to onboarding if not completed, or dashboard if ready
    const redirectTo =
      merchant.onboardingState === "COMPLETED" ? "/dashboard" : "/onboarding";

    return NextResponse.json({
      success: true,
      merchantId: merchant.id,
      redirectTo,
    });
  } catch (error: unknown) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during login. Please try again." },
      { status: 500 }
    );
  }
}
