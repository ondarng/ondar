import { describe, it, expect, vi, beforeEach } from "vitest";
import { markOrderPaid } from "@/lib/payments";

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
  },
}));

import { prisma } from "@/lib/prisma";

describe("PR 3: Atomic Payment Marking (markOrderPaid)", () => {
  const orderId = "ord_1001";
  const reference = "PAY_REF_XYZ";
  const mockOrder = {
    id: orderId,
    merchantId: "merch_1",
    totalKobo: BigInt(250000), // ₦2,500
    customerPhone: "+2348012345678",
    customerName: "Amaka",
    customerEmail: "amaka@example.com",
    orderStatus: "AWAITING_PAYMENT",
    paymentStatus: "AWAITING_PAYMENT",
    deliveryType: "delivery",
    lines: [
      {
        id: "line_1",
        productId: "prod_1",
        quantity: 1,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("marks order paid and commits stock on exact amount and NGN currency", async () => {
    let claimedCount = 1;
    let stockUpdated = false;
    let customerUpserted = false;

    (prisma.$transaction as any).mockImplementation(async (cb: any) => {
      const tx = {
        order: {
          findUnique: vi.fn().mockResolvedValue(mockOrder),
          updateMany: vi.fn().mockResolvedValue({ count: claimedCount }),
        },
        product: {
          findFirst: vi.fn().mockResolvedValue({
            id: "prod_1",
            merchantId: "merch_1",
            trackStock: true,
            stockOnHand: 5,
            stockReserved: 1,
          }),
          update: vi.fn().mockImplementation(() => {
            stockUpdated = true;
          }),
        },
        stockAudit: {
          create: vi.fn(),
        },
        customer: {
          upsert: vi.fn().mockImplementation(() => {
            customerUpserted = true;
          }),
        },
        orderEvent: {
          create: vi.fn(),
        },
      };
      return cb(tx);
    });

    const res = await markOrderPaid(orderId, reference, BigInt(250000), "NGN");
    expect(res).toBe("paid");
    expect(stockUpdated).toBe(true);
    expect(customerUpserted).toBe(true);
  });

  it("rejects payment if amount does not match order total and sets PAYMENT_MISMATCH flag", async () => {
    let flagSet = false;
    let stockUpdated = false;

    (prisma.$transaction as any).mockImplementation(async (cb: any) => {
      const tx = {
        order: {
          findUnique: vi.fn().mockResolvedValue(mockOrder),
          updateMany: vi.fn().mockImplementation(({ data }) => {
            if (data.flag === "PAYMENT_MISMATCH") flagSet = true;
            return { count: 1 };
          }),
        },
        product: {
          update: vi.fn().mockImplementation(() => {
            stockUpdated = true;
          }),
        },
      };
      return cb(tx);
    });

    // Received ₦2,000 instead of ₦2,500
    const res = await markOrderPaid(orderId, reference, BigInt(200000), "NGN");
    expect(res).toBe("mismatch");
    expect(flagSet).toBe(true);
    expect(stockUpdated).toBe(false);
  });

  it("rejects payment if currency is not NGN", async () => {
    let flagSet = false;

    (prisma.$transaction as any).mockImplementation(async (cb: any) => {
      const tx = {
        order: {
          findUnique: vi.fn().mockResolvedValue(mockOrder),
          updateMany: vi.fn().mockImplementation(({ data }) => {
            if (data.flag === "PAYMENT_MISMATCH") flagSet = true;
            return { count: 1 };
          }),
        },
        product: {
          update: vi.fn(),
        },
      };
      return cb(tx);
    });

    const res = await markOrderPaid(orderId, reference, BigInt(250000), "USD");
    expect(res).toBe("mismatch");
    expect(flagSet).toBe(true);
  });

  it("returns already_processed and does not re-commit stock on duplicate or parallel verify calls", async () => {
    let stockCommittedCount = 0;

    // Simulate first call succeeding (count: 1) and second call finding order already marked paid (count: 0)
    let callIndex = 0;
    (prisma.$transaction as any).mockImplementation(async (cb: any) => {
      callIndex++;
      const isFirst = callIndex === 1;
      const tx = {
        order: {
          findUnique: vi.fn().mockResolvedValue(mockOrder),
          updateMany: vi.fn().mockResolvedValue({ count: isFirst ? 1 : 0 }),
        },
        product: {
          findFirst: vi.fn().mockResolvedValue({
            id: "prod_1",
            merchantId: "merch_1",
            trackStock: true,
            stockOnHand: 5,
            stockReserved: 1,
          }),
          update: vi.fn().mockImplementation(() => {
            stockCommittedCount++;
          }),
        },
        stockAudit: { create: vi.fn() },
        customer: { upsert: vi.fn() },
        orderEvent: { create: vi.fn() },
      };
      return cb(tx);
    });

    const first = await markOrderPaid(orderId, reference, BigInt(250000), "NGN");
    const second = await markOrderPaid(orderId, reference, BigInt(250000), "NGN");

    expect(first).toBe("paid");
    expect(second).toBe("already_processed");
    expect(stockCommittedCount).toBe(1); // Committed exactly once!
  });
});
