import { NextRequest, NextResponse } from "next/server";
import { getCurrentMerchant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPaystackSubaccount, resolveBankAccount, updatePaystackSubaccount } from "@/lib/paystack";

export async function GET() {
  const merchant = await getCurrentMerchant();
  if (!merchant) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const payoutAccount = await prisma.payoutAccount.findUnique({
    where: { merchantId: merchant.id },
  });

  return NextResponse.json({
    success: true,
    payoutAccount: payoutAccount
      ? {
          bankName: payoutAccount.bankName,
          bankCode: payoutAccount.bankCode,
          accountNumber: `••••••${payoutAccount.accountNumber.slice(-4)}`,
          accountName: payoutAccount.accountName,
          isVerified: payoutAccount.isVerified,
          updatedAt: payoutAccount.updatedAt,
        }
      : null,
  });
}

export async function POST(req: NextRequest) {
  const merchant = await getCurrentMerchant();
  if (!merchant) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { bankName, bankCode, accountNumber } = body;

    if (!bankName || !bankCode || !accountNumber) {
      return NextResponse.json(
        { success: false, error: "Bank name, bank code, and 10-digit account number are required." },
        { status: 400 }
      );
    }

    const cleanAccount = String(accountNumber).trim();
    if (!/^\d{10}$/.test(cleanAccount)) {
      return NextResponse.json(
        { success: false, error: "Account number must be exactly 10 digits." },
        { status: 400 }
      );
    }

    // Resolve every save on the server. A browser-supplied account name is
    // display-only and must never be accepted as a verification result.
    const resolved = await resolveBankAccount(cleanAccount, String(bankCode).trim());
    const business = await prisma.businessProfile.findUnique({ where: { merchantId: merchant.id } });
    const existing = await prisma.payoutAccount.findUnique({ where: { merchantId: merchant.id } });
    const subaccountCode = existing?.paystackSubaccountCode?.startsWith("ACCT_")
      ? (await updatePaystackSubaccount(existing.paystackSubaccountCode, { settlementBank: String(bankCode).trim(), accountNumber: cleanAccount })).subaccount_code
      : (await createPaystackSubaccount({
          businessName: business?.businessName || merchant.email,
          settlementBank: String(bankCode).trim(),
          accountNumber: cleanAccount,
          percentageCharge: 0,
        })).subaccount_code;

    const updated = await prisma.payoutAccount.upsert({
      where: { merchantId: merchant.id },
      create: {
        merchantId: merchant.id,
        bankName: String(bankName).trim(),
        bankCode: String(bankCode).trim(),
        accountNumber: cleanAccount,
        accountName: resolved.account_name,
        paystackSubaccountCode: subaccountCode,
        isVerified: true,
      },
      update: {
        bankName: String(bankName).trim(),
        bankCode: String(bankCode).trim(),
        accountNumber: cleanAccount,
        accountName: resolved.account_name,
        paystackSubaccountCode: subaccountCode,
        isVerified: true,
      },
    });

    return NextResponse.json({
      success: true,
      payoutAccount: {
        bankName: updated.bankName,
        bankCode: updated.bankCode,
        accountNumber: updated.accountNumber,
        accountName: updated.accountName,
        isVerified: updated.isVerified,
      },
    });
  } catch (err: any) {
    console.error("Payout account update error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to save bank account." },
      { status: 500 }
    );
  }
}
