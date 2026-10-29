import { NextRequest, NextResponse } from "next/server";
import { releaseExpiredHolds } from "@/lib/holdExpiry";

/**
 * INV-04 Hold-expiry job endpoint
 * Can be triggered periodically (e.g. Vercel cron, Render cron, or internal scheduler)
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Optional secret check if configured in production
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await releaseExpiredHolds();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error: any) {
    console.error("Hold expiry routine error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process hold expirations" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
