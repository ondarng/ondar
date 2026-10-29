import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/orders/route";
import { NextRequest } from "next/server";

// Mock prisma
vi.mock("@/lib/prisma", () => {
  return {
    prisma: {
      businessProfile: {
        findUnique: vi.fn(),
      },
      shippingRate: {
        findMany: vi.fn(),
      },
      product: {
        findFirst: vi.fn(),
        findUniqueOrThrow: vi.fn(),
      },
      orderCounter: {
        upsert: vi.fn(),
      },
      order: {
        create: vi.fn(),
      },
      orderEvent: {
        create: vi.fn(),
      },
      stockAudit: {
        create: vi.fn(),
      },
      $transaction: vi.fn(),
    },
  };
});

import { prisma } from "@/lib/prisma";

describe("PR 1: Checkout Integrity (POST /api/orders)", () => {
  const mockMerchantId = "merchant_123";
  const mockProfile = {
    merchantId: mockMerchantId,
    slug: "canary-store",
    deliveryEnabled: true,
    pickupEnabled: true,
    merchant: {
      payoutAccount: {
        isVerified: true,
        bankName: "Test Bank",
        accountNumber: "0123456789",
        accountName: "Canary Merchant",
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.businessProfile.findUnique as any).mockResolvedValue(mockProfile);
    (prisma.shippingRate.findMany as any).mockResolvedValue([
      {
        id: "rate_lagos",
        merchantId: mockMerchantId,
        state: "Lagos",
        parentId: null,
        area: null,
        deliveryName: "Standard Lagos",
        isFree: false,
        feeKobo: BigInt(250000), // ₦2,500
      },
    ]);
  });

  it("fails when quantity is zero or negative", async () => {
    const req = new NextRequest("http://localhost:3000/api/orders", {
      method: "POST",
      body: JSON.stringify({
        storeSlug: "canary-store",
        customerName: "Buyer",
        customerPhone: "+2348012345678",
        deliveryType: "pickup",
        paymentRoute: "BANK_TRANSFER",
        items: [{ productId: "prod_1", quantity: 0 }],
      }),
    });

    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toMatch(/Item quantities must be whole numbers above zero/i);
  });

  it("fails when product belongs to another merchant or does not exist", async () => {
    // Transaction mock executes callback
    (prisma.$transaction as any).mockImplementation(async (cb: any) => {
      const tx = {
        product: {
          findFirst: vi.fn().mockResolvedValue(null), // Product not found under this merchantId
        },
      };
      return cb(tx);
    });

    const req = new NextRequest("http://localhost:3000/api/orders", {
      method: "POST",
      body: JSON.stringify({
        storeSlug: "canary-store",
        customerName: "Buyer",
        customerPhone: "+2348012345678",
        deliveryType: "pickup",
        paymentRoute: "BANK_TRANSFER",
        items: [{ productId: "prod_other_merchant", quantity: 1 }],
      }),
    });

    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toMatch(/unavailable/i);
  });

  it("fails when product status is not ACTIVE (e.g. DRAFT or ARCHIVED)", async () => {
    (prisma.$transaction as any).mockImplementation(async (cb: any) => {
      const tx = {
        product: {
          findFirst: vi.fn().mockImplementation(({ where }) => {
            // If query checks status: 'ACTIVE', it returns null for draft product
            if (where.status === "ACTIVE") return null;
            return { id: "prod_draft", status: "DRAFT" };
          }),
        },
      };
      return cb(tx);
    });

    const req = new NextRequest("http://localhost:3000/api/orders", {
      method: "POST",
      body: JSON.stringify({
        storeSlug: "canary-store",
        customerName: "Buyer",
        customerPhone: "+2348012345678",
        deliveryType: "pickup",
        paymentRoute: "BANK_TRANSFER",
        items: [{ productId: "prod_draft", quantity: 1 }],
      }),
    });

    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toMatch(/unavailable/i);
  });

  it("fails when requested quantity exceeds available stock", async () => {
    (prisma.$transaction as any).mockImplementation(async (cb: any) => {
      const tx = {
        product: {
          findFirst: vi.fn().mockResolvedValue({
            id: "prod_1",
            merchantId: mockMerchantId,
            status: "ACTIVE",
            trackStock: true,
            stockOnHand: 5,
            stockReserved: 4, // Available = 1
            name: "Limited Item",
            priceKobo: BigInt(100000),
            variants: [],
          }),
        },
      };
      return cb(tx);
    });

    const req = new NextRequest("http://localhost:3000/api/orders", {
      method: "POST",
      body: JSON.stringify({
        storeSlug: "canary-store",
        customerName: "Buyer",
        customerPhone: "+2348012345678",
        deliveryType: "pickup",
        paymentRoute: "BANK_TRANSFER",
        items: [{ productId: "prod_1", quantity: 2 }], // 2 requested, only 1 available
      }),
    });

    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toMatch(/does not have enough stock/i);
  });

  it("ignores browser-tampered item price and uses server price", async () => {
    let createdOrderData: any = null;

    (prisma.$transaction as any).mockImplementation(async (cb: any) => {
      const tx = {
        product: {
          findFirst: vi.fn().mockResolvedValue({
            id: "prod_1",
            merchantId: mockMerchantId,
            status: "ACTIVE",
            trackStock: true,
            stockOnHand: 10,
            stockReserved: 0,
            name: "Genuine Item",
            priceKobo: BigInt(500000), // Real server price ₦5,000 (500000 kobo)
            variants: [],
          }),
          update: vi.fn().mockResolvedValue({}),
          findUniqueOrThrow: vi.fn().mockResolvedValue({
            id: "prod_1",
            trackStock: true,
            stockOnHand: 10,
            stockReserved: 1,
          }),
        },
        orderCounter: {
          upsert: vi.fn().mockResolvedValue({ nextOrderNumber: 1002 }),
        },
        order: {
          create: vi.fn().mockImplementation(({ data }) => {
            createdOrderData = data;
            return {
              id: "order_123",
              orderNumber: 1001,
              publicToken: "tok_abc",
              holdExpiresAt: new Date(),
            };
          }),
        },
        stockAudit: {
          create: vi.fn().mockResolvedValue({}),
        },
        orderEvent: {
          create: vi.fn().mockResolvedValue({}),
        },
      };
      return cb(tx);
    });

    // Attacker tries sending priceKobo = 100 (₦1) and totalKobo = 100
    const req = new NextRequest("http://localhost:3000/api/orders", {
      method: "POST",
      body: JSON.stringify({
        storeSlug: "canary-store",
        customerName: "Buyer",
        customerPhone: "+2348012345678",
        deliveryType: "pickup",
        paymentRoute: "BANK_TRANSFER",
        items: [
          {
            productId: "prod_1",
            quantity: 1,
            priceKobo: 100, // TAMPERED!
            price: 1,       // TAMPERED!
          },
        ],
        subtotalKobo: 100,  // TAMPERED!
        totalKobo: 100,     // TAMPERED!
        deliveryFeeKobo: 0, // TAMPERED!
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    // Server must have computed 500000 kobo, NOT the attacker's 100 kobo!
    expect(createdOrderData.subtotalKobo).toBe(BigInt(500000));
    expect(createdOrderData.totalKobo).toBe(BigInt(500000));
    expect(createdOrderData.lines.create[0].priceKobo).toBe(BigInt(500000));
    expect(createdOrderData.lines.create[0].lineTotal).toBe(BigInt(500000));
  });

  it("ignores browser-tampered delivery fee and uses server shipping rule", async () => {
    let createdOrderData: any = null;

    (prisma.$transaction as any).mockImplementation(async (cb: any) => {
      const tx = {
        product: {
          findFirst: vi.fn().mockResolvedValue({
            id: "prod_1",
            merchantId: mockMerchantId,
            status: "ACTIVE",
            trackStock: true,
            stockOnHand: 10,
            stockReserved: 0,
            name: "Item",
            priceKobo: BigInt(100000), // ₦1,000
            variants: [],
          }),
          update: vi.fn().mockResolvedValue({}),
          findUniqueOrThrow: vi.fn().mockResolvedValue({
            id: "prod_1",
            trackStock: true,
            stockOnHand: 10,
            stockReserved: 1,
          }),
        },
        orderCounter: {
          upsert: vi.fn().mockResolvedValue({ nextOrderNumber: 1002 }),
        },
        order: {
          create: vi.fn().mockImplementation(({ data }) => {
            createdOrderData = data;
            return {
              id: "order_123",
              orderNumber: 1001,
              publicToken: "tok_abc",
              holdExpiresAt: new Date(),
            };
          }),
        },
        stockAudit: {
          create: vi.fn().mockResolvedValue({}),
        },
        orderEvent: {
          create: vi.fn().mockResolvedValue({}),
        },
      };
      return cb(tx);
    });

    // Attacker tries to set delivery fee to ₦0 when Lagos rule is ₦2,500 (250000 kobo)
    const req = new NextRequest("http://localhost:3000/api/orders", {
      method: "POST",
      body: JSON.stringify({
        storeSlug: "canary-store",
        customerName: "Buyer",
        customerPhone: "+2348012345678",
        deliveryType: "delivery",
        deliveryState: "Lagos",
        deliveryAddress: "12 Marina, Lagos Island",
        paymentRoute: "BANK_TRANSFER",
        deliveryFeeKobo: 0, // TAMPERED!
        totalKobo: 100000,  // TAMPERED!
        items: [{ productId: "prod_1", quantity: 1 }],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    // Server must use rule's 250000 kobo
    expect(createdOrderData.deliveryFeeKobo).toBe(BigInt(250000));
    expect(createdOrderData.totalKobo).toBe(BigInt(100000 + 250000));
  });
});
