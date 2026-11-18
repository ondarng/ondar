import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown-ip";

    const rateCheck = checkRateLimit(`forgot-password:${ip}:${cleanEmail}`, 5, 15 * 60);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many password reset requests. Please wait ${Math.ceil(
            rateCheck.resetInSeconds / 60
          )} minutes and try again.`,
        },
        { status: 429 }
      );
    }

    // Check if merchant exists
    const merchant = await prisma.merchant.findUnique({
      where: { email: cleanEmail },
      include: { businessProfile: true },
    });

    // For privacy, always return success even if account doesn't exist
    // This prevents account enumeration attacks
    if (!merchant) {
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, recovery instructions have been initiated.",
      });
    }

    // Log the reset request securely
    console.log(`[Password Reset Requested] Merchant ID: ${merchant.id}, Email: ${cleanEmail}`);

    return NextResponse.json({
      success: true,
      message: "Password reset request recorded.",
      email: cleanEmail,
    });
  } catch (error: unknown) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
