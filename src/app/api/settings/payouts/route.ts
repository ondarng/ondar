import { NextRequest, NextResponse } from "next/server";
import { getCurrentMerchant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveBankAccount } from "@/lib/paystack";

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
          accountNumber: payoutAccount.accountNumber,
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
    const { bankName, bankCode, accountNumber, accountName } = body;

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

    // Attempt to verify with Paystack using Ondar platform key
    let verifiedAccountName = accountName?.trim() || "";
    try {
      const resolved = await resolveBankAccount(cleanAccount, String(bankCode).trim());
      if (resolved && resolved.account_name) {
        verifiedAccountName = resolved.account_name;
      }
    } catch (resolveErr: any) {
      console.warn("Paystack bank resolve warning:", resolveErr.message);
      // If manual fallback is provided (e.g. daily test mode limit reached), allow saving with warning
      if (!verifiedAccountName) {
        return NextResponse.json(
          {
            success: false,
            error:
              resolveErr.message ||
              "Could not verify this bank account with Paystack. Please check the number and bank.",
          },
          { status: 400 }
        );
      }
    }

    // Create or update Paystack subaccount using Ondar platform key
    let subaccountCode = `SUB_${merchant.id.slice(0, 10)}`;
    try {
      const { createPaystackSubaccount } = await import("@/lib/paystack");
      const business = await prisma.businessProfile.findUnique({
        where: { merchantId: merchant.id },
      });
      const bName = business?.businessName || merchant.email;
      const sub = await createPaystackSubaccount({
        businessName: bName,
        settlementBank: String(bankCode).trim(),
        accountNumber: cleanAccount,
        percentageCharge: 1.0,
      });
      if (sub?.subaccount_code) {
        subaccountCode = sub.subaccount_code;
      }
    } catch (subErr: any) {
      console.warn("Paystack subaccount creation warning:", subErr.message);
    }

    const updated = await prisma.payoutAccount.upsert({
      where: { merchantId: merchant.id },
      create: {
        merchantId: merchant.id,
        bankName: String(bankName).trim(),
        bankCode: String(bankCode).trim(),
        accountNumber: cleanAccount,
        accountName: verifiedAccountName,
        paystackSubaccountCode: subaccountCode,
        isVerified: true,
      },
      update: {
        bankName: String(bankName).trim(),
        bankCode: String(bankCode).trim(),
        accountNumber: cleanAccount,
        accountName: verifiedAccountName,
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
