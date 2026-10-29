import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth", () => ({
  getCurrentMerchant: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: {
      findMany: vi.fn(),
    },
    product: {
      findMany: vi.fn(),
    },
  },
}));

import { getCurrentMerchant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GET as notificationsGET } from "@/app/api/notifications/route";

describe("PRD NOT-02: Notifications API", () => {
  const merchant = { id: "merch_123", email: "merch@test.com" };

  beforeEach(() => {
    vi.clearAllMocks();
    (getCurrentMerchant as any).mockResolvedValue(merchant);
  });

  it("derives live alerts for transfer orders, flagged orders, and low stock", async () => {
    // 1st call: transferOrders
    // 2nd call: flaggedOrders
    // 3rd call: toFulfilOrders
    let orderFindCalls = 0;
    (prisma.order.findMany as any).mockImplementation(({ where }: any) => {
      expect(where.merchantId).toBe(merchant.id);
      orderFindCalls++;
      if (orderFindCalls === 1) {
        return Promise.resolve([
          {
            id: "ord_transfer_1",
            orderNumber: 1010,
            customerName: "Tolu",
            totalKobo: BigInt(300000),
            paymentSentAt: new Date(),
            updatedAt: new Date(),
          },
        ]);
      }
      if (orderFindCalls === 2) {
        return Promise.resolve([
          {
            id: "ord_flag_1",
            orderNumber: 1011,
            flag: "PAYMENT_MISMATCH",
            flagDetails: "Expected ₦5,000, received ₦3,000",
            updatedAt: new Date(),
          },
        ]);
      }
      return Promise.resolve([]);
    });

    (prisma.product.findMany as any).mockImplementation(({ where }: any) => {
      expect(where.merchantId).toBe(merchant.id);
      return Promise.resolve([
        {
          id: "prod_low",
          name: "Leather Belt",
          stockOnHand: 1,
          stockReserved: 0,
          lowStockThreshold: 2,
          updatedAt: new Date(),
        },
      ]);
    });

    const req = new NextRequest("http://localhost:3000/api/notifications");
    const res = await notificationsGET(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.unreadCount).toBe(3);

    const types = data.alerts.map((a: any) => a.type);
    expect(types).toContain("bank_transfer_pending");
    expect(types).toContain("flag");
    expect(types).toContain("low_stock");
  });
});
