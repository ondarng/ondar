import { NextResponse } from "next/server";
import { getCurrentMerchant } from "@/lib/auth";
import { fetchNigerianBanks } from "@/lib/paystack";

export async function GET() {
  const merchant = await getCurrentMerchant();
  if (!merchant) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const banks = await fetchNigerianBanks();
    return NextResponse.json({ success: true, banks });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load banks";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
