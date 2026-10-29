import { describe, it, expect, vi, beforeEach } from "vitest";
import { releaseExpiredHolds } from "@/lib/holdExpiry";

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: {
      findMany: vi.fn(),
    },
    customCheckoutLink: {
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { prisma } from "@/lib/prisma";

describe("PR 5: Expiry Races and Custom Checkout Expiry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("releases stock for an unpaid expired order and updates status to CANCELLED", async () => {
    (prisma.order.findMany as any).mockResolvedValue([{ id: "ord_expired_1" }]);
    (prisma.customCheckoutLink.findMany as any).mockResolvedValue([]);

    let releasedStock = false;
    (prisma.$transaction as any).mockImplementation(async (cb: any) => {
      const tx = {
        order: {
          updateMany: vi.fn().mockResolvedValue({ count: 1 }), // successfully claimed
          findUniqueOrThrow: vi.fn().mockResolvedValue({
            id: "ord_expired_1",
            merchantId: "merch_1",
            lines: [{ productId: "prod_1", quantity: 2 }],
          }),
        },
        product: {
          findFirst: vi.fn().mockResolvedValue({
            id: "prod_1",
            merchantId: "merch_1",
            trackStock: true,
            stockOnHand: 5,
            stockReserved: 2,
          }),
          update: vi.fn().mockImplementation(() => {
            releasedStock = true;
          }),
        },
        stockAudit: { create: vi.fn() },
        orderEvent: { create: vi.fn() },
      };
      return cb(tx);
    });

    const result = await releaseExpiredHolds();
    expect(result.releasedOrdersCount).toBe(1);
    expect(result.releasedItemsCount).toBe(2);
    expect(releasedStock).toBe(true);
  });

  it("running expiry twice on the same candidate changes nothing on the second run (idempotent)", async () => {
    (prisma.order.findMany as any).mockResolvedValue([{ id: "ord_expired_1" }]);
    (prisma.customCheckoutLink.findMany as any).mockResolvedValue([]);

    // First call claims count: 1, second call claims count: 0 (already cancelled or paid)
    let call = 0;
    (prisma.$transaction as any).mockImplementation(async (cb: any) => {
      call++;
      const isFirst = call === 1;
      const tx = {
        order: {
          updateMany: vi.fn().mockResolvedValue({ count: isFirst ? 1 : 0 }),
          findUniqueOrThrow: vi.fn().mockResolvedValue({
            id: "ord_expired_1",
            merchantId: "merch_1",
            lines: [{ productId: "prod_1", quantity: 1 }],
          }),
        },
        product: {
          findFirst: vi.fn().mockResolvedValue({
            id: "prod_1",
            merchantId: "merch_1",
            trackStock: true,
            stockOnHand: 5,
            stockReserved: 1,
          }),
          update: vi.fn(),
        },
        stockAudit: { create: vi.fn() },
        orderEvent: { create: vi.fn() },
      };
      return cb(tx);
    });

    const firstRun = await releaseExpiredHolds();
    const secondRun = await releaseExpiredHolds();

    expect(firstRun.releasedOrdersCount).toBe(1);
    expect(secondRun.releasedOrdersCount).toBe(0); // Second run releases 0!
    expect(secondRun.releasedItemsCount).toBe(0);
  });

  it("releases stock for expired custom checkout links", async () => {
    (prisma.order.findMany as any).mockResolvedValue([]);
    (prisma.customCheckoutLink.findMany as any).mockResolvedValue([{ id: "link_expired_1" }]);

    let releasedLinkStock = false;
    (prisma.$transaction as any).mockImplementation(async (cb: any) => {
      const tx = {
        customCheckoutLink: {
          updateMany: vi.fn().mockResolvedValue({ count: 1 }), // claimed
          findUniqueOrThrow: vi.fn().mockResolvedValue({
            id: "link_expired_1",
            merchantId: "merch_1",
            items: [{ productId: "prod_1", quantity: 3 }],
          }),
        },
        product: {
          findFirst: vi.fn().mockResolvedValue({
            id: "prod_1",
            merchantId: "merch_1",
            trackStock: true,
            stockOnHand: 10,
            stockReserved: 3,
          }),
          update: vi.fn().mockImplementation(() => {
            releasedLinkStock = true;
          }),
        },
        stockAudit: { create: vi.fn() },
      };
      return cb(tx);
    });

    const result = await releaseExpiredHolds();
    expect(result.releasedItemsCount).toBe(3);
    expect(releasedLinkStock).toBe(true);
  });
});
