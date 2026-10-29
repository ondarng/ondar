import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import crypto from "crypto";

// Mock dependencies
vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/encryption", () => ({
  decryptSecretKey: vi.fn(),
}));

vi.mock("@/lib/payments", () => ({
  markOrderPaid: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { decryptSecretKey } from "@/lib/encryption";
import { markOrderPaid } from "@/lib/payments";
import { POST as webhookPOST } from "@/app/api/webhooks/paystack/route";

describe("PR 4: Webhook and Verify Security", () => {
  const secretMerchantA = "sk_live_merchant_A_secret_key";
  const secretMerchantB = "sk_live_merchant_B_secret_key";
  const validReference = "PAY_REF_ORDER_A";

  const mockOrder = {
    id: "ord_1001",
    paymentReference: validReference,
    merchant: {
      id: "merch_A",
      paymentConfig: {
        isActive: true,
        encryptedSecretKey: "enc_hex",
        secretKeyIv: "iv_hex",
        secretKeyTag: "tag_hex",
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (decryptSecretKey as any).mockReturnValue(secretMerchantA);
  });

  it("rejects webhook if signature header is missing", async () => {
    const req = new NextRequest("http://localhost:3000/api/webhooks/paystack", {
      method: "POST",
      body: JSON.stringify({ event: "charge.success" }),
    });

    const res = await webhookPOST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toMatch(/Missing signature/i);
    expect(markOrderPaid).not.toHaveBeenCalled();
  });

  it("rejects webhook if reference is unknown", async () => {
    (prisma.order.findUnique as any).mockResolvedValue(null);

    const rawPayload = JSON.stringify({
      event: "charge.success",
      data: { reference: "UNKNOWN_REF", amount: 500000, currency: "NGN" },
    });
    const signature = crypto.createHmac("sha512", secretMerchantA).update(rawPayload).digest("hex");

    const req = new NextRequest("http://localhost:3000/api/webhooks/paystack", {
      method: "POST",
      headers: { "x-paystack-signature": signature },
      body: rawPayload,
    });

    const res = await webhookPOST(req);
    expect(res.status).toBe(404);
    expect(markOrderPaid).not.toHaveBeenCalled();
  });

  it("rejects webhook signed with another merchant's key (forged webhook)", async () => {
    (prisma.order.findUnique as any).mockResolvedValue(mockOrder);

    const rawPayload = JSON.stringify({
      event: "charge.success",
      data: { reference: validReference, amount: 500000, currency: "NGN" },
    });
    // Attacker signs payload with merchant B's key
    const forgedSignature = crypto.createHmac("sha512", secretMerchantB).update(rawPayload).digest("hex");

    const req = new NextRequest("http://localhost:3000/api/webhooks/paystack", {
      method: "POST",
      headers: { "x-paystack-signature": forgedSignature },
      body: rawPayload,
    });

    const res = await webhookPOST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toMatch(/Invalid signature/i);
    expect(markOrderPaid).not.toHaveBeenCalled();
  });

  it("accepts webhook signed with the order merchant's authentic key", async () => {
    (prisma.order.findUnique as any).mockResolvedValue(mockOrder);
    (markOrderPaid as any).mockResolvedValue("paid");

    const rawPayload = JSON.stringify({
      event: "charge.success",
      data: { reference: validReference, amount: 500000, currency: "NGN" },
    });
    // Legitimate signature using Merchant A's key
    const validSignature = crypto.createHmac("sha512", secretMerchantA).update(rawPayload).digest("hex");

    const req = new NextRequest("http://localhost:3000/api/webhooks/paystack", {
      method: "POST",
      headers: { "x-paystack-signature": validSignature },
      body: rawPayload,
    });

    const res = await webhookPOST(req);
    expect(res.status).toBe(200);
    expect(markOrderPaid).toHaveBeenCalledWith(mockOrder.id, validReference, BigInt(500000), "NGN");
  });
});
