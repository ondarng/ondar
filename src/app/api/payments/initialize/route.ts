import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { initializePaystackTransaction } from "@/lib/paystack";
import { decryptSecretKey } from "@/lib/encryption";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { publicToken } = body;

    if (typeof publicToken !== "string" || !publicToken) {
      return NextResponse.json(
        { success: false, error: "Order identifier is required" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { publicToken },
      include: {
        merchant: {
          include: {
            businessProfile: true,
            payoutAccount: true,
            paymentConfig: true,
          },
        },
        lines: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    if (order.paymentStatus !== "AWAITING_PAYMENT" || !["AWAITING_PAYMENT", "PAYMENT_SENT"].includes(order.orderStatus)) {
      return NextResponse.json(
        { success: false, error: "Order is already paid" },
        { status: 400 }
      );
    }

    // Check if merchant has BYOK Paystack keys configured
    const paymentConfig = order.merchant.paymentConfig;
    if (!paymentConfig || !paymentConfig.isActive) {
      return NextResponse.json(
        {
          success: false,
          fallbackToBankTransfer: true,
          error: "Instant card payment is not enabled for this store. Please pay via bank transfer.",
        },
        { status: 400 }
      );
    }

    // Decrypt merchant secret key in ephemeral memory
    let merchantSecretKey = "";
    try {
      merchantSecretKey = decryptSecretKey(
        paymentConfig.encryptedSecretKey,
        paymentConfig.secretKeyIv,
        paymentConfig.secretKeyTag
      );
    } catch (decErr) {
      console.error("Failed to decrypt merchant Paystack secret key:", decErr);
      return NextResponse.json(
        {
          success: false,
          fallbackToBankTransfer: true,
          error: "Store payment credentials could not be decrypted. Please use bank transfer.",
        },
        { status: 500 }
      );
    }

    // Customer email (Paystack requires valid email format)
    const customerEmail =
      order.customerEmail && order.customerEmail.includes("@")
        ? order.customerEmail.trim()
        : `customer.${order.customerPhone.replace(/[^0-9]/g, "") || order.orderNumber}@ondar.ng`;

    // Reference
    const reference = order.paymentReference || `OND-${order.id}-${crypto.randomUUID()}`;

    // Callback URL
    const { origin } = new URL(req.url);
    const storeSlug = order.merchant.businessProfile?.slug || "shop";
    const callbackUrl = `${origin}/s/${storeSlug}/order/${order.publicToken}`;

    // Subaccount split (Ondar's 1% platform fee)
    const subaccount = paymentConfig.ondarSubaccountCode;

    // Metadata
    const metadata = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      publicToken: order.publicToken,
      merchantId: order.merchantId,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      deliveryType: order.deliveryType,
      custom_fields: [
        {
          display_name: "Order Number",
          variable_name: "order_number",
          value: `#OND-${order.orderNumber}`,
        },
        {
          display_name: "Store Name",
          variable_name: "store_name",
          value: order.merchant.businessProfile?.businessName || "Ondar Store",
        },
      ],
    };

    const paystackRes = await initializePaystackTransaction(
      {
        email: customerEmail,
        amountKobo: order.totalKobo,
        callbackUrl,
        reference,
        metadata,
        subaccount,
      },
      merchantSecretKey
    );

    // The reference is the only identifier accepted by verification/webhooks.
    // A callback can never select an order by a guessable number or browser ID.
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentReference: paystackRes.reference },
    });

    return NextResponse.json({
      success: true,
      authorizationUrl: paystackRes.authorization_url,
      accessCode: paystackRes.access_code,
      reference: paystackRes.reference,
    });
  } catch (error: any) {
    console.error("Payment initialization error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to initialize payment" },
      { status: 500 }
    );
  }
}
