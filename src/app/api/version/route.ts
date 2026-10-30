import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Unique deployment identifier per server start/deployment
const SERVER_DEPLOYMENT_ID =
  process.env.VERCEL_DEPLOYMENT_ID ||
  process.env.VERCEL_GIT_COMMIT_SHA ||
  `ondar_v2_${Date.now()}`;

export async function GET() {
  return NextResponse.json(
    {
      version: SERVER_DEPLOYMENT_ID,
      time: Date.now(),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}
