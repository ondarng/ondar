import { NextRequest, NextResponse } from "next/server";
import { getCurrentMerchant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptSecretKey, maskSecretKey } from "@/lib/encryption";
import {
  verifyPaystackCredentials,
  ensureOndarSubaccountOnMerchant,
} from "@/lib/paystack";

export async function GET() {
  try {
    const merchant = await getCurrentMerchant();
    if (!merchant) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const config = await prisma.merchantPaymentConfig.findUnique({
      where: { merchantId: merchant.id },
    });

    if (!config) {
      return NextResponse.json({
        success: true,
        hasKeys: false,
        config: null,
      });
    }

    return NextResponse.json({
      success: true,
      hasKeys: true,
      config: {
        publicKey: config.paystackPublicKey,
        keyLast4: config.keyLast4,
        maskedSecretKey: maskSecretKey(config.keyLast4, config.isLiveMode ? "sk_live_" : "sk_test_"),
        ondarSubaccountCode: config.ondarSubaccountCode,
        feeBearer: config.feeBearer || "MERCHANT",
        isLiveMode: config.isLiveMode,
        isActive: config.isActive,
        updatedAt: config.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Fetch payment keys error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch payment config" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const merchant = await getCurrentMerchant();
    if (!merchant) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { publicKey, secretKey } = body;

    if (!publicKey || !secretKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Both Paystack Public Key and Secret Key are required.",
        },
        { status: 400 }
      );
    }

    const cleanPub = publicKey.trim();
    const cleanSec = secretKey.trim();

    // 1. Verify credentials against Paystack API
    const verifyResult = await verifyPaystackCredentials(cleanPub, cleanSec);
    if (!verifyResult.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: verifyResult.error || "Invalid Paystack credentials.",
        },
        { status: 400 }
      );
    }

    // 2. Ensure Ondar 1% fee subaccount is registered on this merchant's Paystack
    let ondarSubaccountCode = "";
    try {
      ondarSubaccountCode = await ensureOndarSubaccountOnMerchant(cleanSec);
    } catch (subErr: any) {
      console.error("Subaccount creation error on merchant Paystack:", subErr);
      return NextResponse.json(
        {
          success: false,
          error: `Key valid, but failed to register Ondar 1% subaccount on Paystack: ${subErr?.message || "Check Paystack account settings."}`,
        },
        { status: 500 }
      );
    }

    // 3. Encrypt secret key with AES-256-GCM
    const encrypted = encryptSecretKey(cleanSec);

    // 4. Upsert config in database
    const savedConfig = await prisma.merchantPaymentConfig.upsert({
      where: { merchantId: merchant.id },
      create: {
        merchantId: merchant.id,
        paystackPublicKey: cleanPub,
        encryptedSecretKey: encrypted.encryptedSecretKey,
        secretKeyIv: encrypted.iv,
        secretKeyTag: encrypted.tag,
        keyLast4: encrypted.last4,
        ondarSubaccountCode,
        isLiveMode: verifyResult.isLive,
        isActive: true,
      },
      update: {
        paystackPublicKey: cleanPub,
        encryptedSecretKey: encrypted.encryptedSecretKey,
        secretKeyIv: encrypted.iv,
        secretKeyTag: encrypted.tag,
        keyLast4: encrypted.last4,
        ondarSubaccountCode,
        isLiveMode: verifyResult.isLive,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Paystack keys connected & verified successfully! Ondar 1% subaccount configured.",
      config: {
        publicKey: savedConfig.paystackPublicKey,
        keyLast4: savedConfig.keyLast4,
        maskedSecretKey: maskSecretKey(
          savedConfig.keyLast4,
          savedConfig.isLiveMode ? "sk_live_" : "sk_test_"
        ),
        ondarSubaccountCode: savedConfig.ondarSubaccountCode,
        isLiveMode: savedConfig.isLiveMode,
        isActive: savedConfig.isActive,
      },
    });
  } catch (error: any) {
    console.error("Save payment keys error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to configure payment keys" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const merchant = await getCurrentMerchant();
    if (!merchant) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await prisma.merchantPaymentConfig.deleteMany({
      where: { merchantId: merchant.id },
    });

    return NextResponse.json({
      success: true,
      message: "Paystack keys disconnected. Store will fallback to manual bank transfer checkout.",
    });
  } catch (error: any) {
    console.error("Disconnect payment keys error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to disconnect payment keys" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const merchant = await getCurrentMerchant();
    if (!merchant) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { feeBearer } = body;

    if (feeBearer !== "MERCHANT" && feeBearer !== "CUSTOMER") {
      return NextResponse.json(
        { success: false, error: "feeBearer must be MERCHANT ('I pay') or CUSTOMER ('My customer pays')" },
        { status: 400 }
      );
    }

    const updated = await prisma.merchantPaymentConfig.update({
      where: { merchantId: merchant.id },
      data: { feeBearer },
    });

    return NextResponse.json({
      success: true,
      feeBearer: updated.feeBearer,
      message: `Payment processing fee setting updated to: ${feeBearer === "MERCHANT" ? "I pay" : "My customer pays"}`,
    });
  } catch (error: any) {
    console.error("Update fee bearer error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update fee bearer setting" },
      { status: 500 }
    );
  }
}
