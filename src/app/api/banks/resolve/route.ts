import { NextRequest, NextResponse } from "next/server";
import { getCurrentMerchant } from "@/lib/auth";
import { resolveBankAccount } from "@/lib/paystack";

export async function POST(req: NextRequest) {
  const merchant = await getCurrentMerchant();
  if (!merchant) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { accountNumber, bankCode } = await req.json();

    if (!accountNumber || !bankCode) {
      return NextResponse.json(
        { success: false, error: "Account number and bank are required." },
        { status: 400 }
      );
    }

    if (!/^\d{10}$/.test(accountNumber)) {
      return NextResponse.json(
        { success: false, error: "Account number must be exactly 10 digits." },
        { status: 400 }
      );
    }

    const data = await resolveBankAccount(accountNumber, bankCode);
    return NextResponse.json({
      success: true,
      accountName: data.account_name,
      accountNumber: data.account_number,
    });
  } catch (error: unknown) {
    const rawMessage = error instanceof Error ? error.message : "Failed to verify account";
    const isLimitExceeded =
      rawMessage.toLowerCase().includes("limit of 3 live bank resolves exceeded") ||
      rawMessage.toLowerCase().includes("test mode daily limit");

    const message = isLimitExceeded
      ? "Paystack Test Mode: Daily limit of 3 live bank lookups reached. You can enter your account name manually below, or switch to your live Paystack key."
      : rawMessage;

    return NextResponse.json(
      {
        success: false,
        error: message,
        limitExceeded: isLimitExceeded,
      },
      { status: 400 }
    );
  }
}
