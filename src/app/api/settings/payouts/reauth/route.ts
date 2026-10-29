import { NextRequest, NextResponse } from "next/server";
import { getCurrentMerchant, verifyPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const merchant = await getCurrentMerchant();
  if (!merchant) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json(
        { success: false, error: "Password is required." },
        { status: 400 }
      );
    }

    if (!merchant.passwordHash) {
      return NextResponse.json(
        { success: false, error: "This account uses Google authentication. Please verify with Google." },
        { status: 400 }
      );
    }

    const isValid = await verifyPassword(password, merchant.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Incorrect password. Please try again." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payout editing unlocked.",
    });
  } catch (error: unknown) {
    console.error("Payout reauth error:", error);
    return NextResponse.json(
      { success: false, error: "Authentication failed. Please try again." },
      { status: 500 }
    );
  }
}
