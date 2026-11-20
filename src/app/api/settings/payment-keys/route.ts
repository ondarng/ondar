import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    isComingSoon: true,
    hasKeys: false,
    config: null,
    message: "Paystack BYOK is currently in private preview and coming soon.",
  });
}

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: "Paystack BYOK is currently in private preview and coming soon. Direct card checkout is not enabled yet.",
    },
    { status: 403 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    {
      success: false,
      error: "Paystack BYOK is currently in private preview and coming soon.",
    },
    { status: 403 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    {
      success: false,
      error: "Paystack BYOK is currently in private preview and coming soon.",
    },
    { status: 403 }
  );
}
