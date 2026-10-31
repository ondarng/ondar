import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";

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
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown-ip";
    const rateCheck = checkRateLimit(`register:${ip}`, 5, 15 * 60);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many registration attempts. Please wait ${Math.ceil(rateCheck.resetInSeconds / 60)} minutes and try again.`,
        },
        { status: 429 }
      );
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    // Check if merchant already exists
    const existing = await prisma.merchant.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: "An account with this email already exists. Please log in.",
        },
        { status: 409 }
      );
    }

    // Hash password and create merchant
    const passwordHash = await hashPassword(password);
    const merchant = await prisma.merchant.create({
      data: {
        email: cleanEmail,
        passwordHash,
        onboardingStep: 1,
        onboardingState: "IN_PROGRESS",
      },
    });

    // Set 30-day session cookie
    await setSessionCookie(merchant.id);

    return NextResponse.json({
      success: true,
      merchantId: merchant.id,
      redirectTo: "/onboarding",
    });
  } catch (error: unknown) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during registration. Please try again." },
      { status: 500 }
    );
  }
}
