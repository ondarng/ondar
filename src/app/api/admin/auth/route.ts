import { NextRequest, NextResponse } from "next/server";
import {
  verifyAdminPassword,
  setAdminSessionCookie,
  clearAdminSessionCookie,
  isAdminAuthenticated,
} from "@/lib/adminAuth";
import { checkRateLimit } from "@/lib/rateLimit";

export async function GET() {
  const authenticated = await isAdminAuthenticated();
  return NextResponse.json({ authenticated });
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown-ip";
    const rateCheck = checkRateLimit(`admin-login:${ip}`, 5, 10 * 60);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many login attempts. Please wait ${Math.ceil(rateCheck.resetInSeconds / 60)} minutes.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { password } = body;

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Admin passcode is required." },
        { status: 400 }
      );
    }

    const isValid = verifyAdminPassword(password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid admin passcode." },
        { status: 401 }
      );
    }

    await setAdminSessionCookie();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Admin login error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to authenticate admin." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  await clearAdminSessionCookie();
  return NextResponse.json({ success: true });
}
