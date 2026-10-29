import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth", () => ({
  getCurrentMerchant: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    customer: {
      findMany: vi.fn(),
    },
    order: {
      findMany: vi.fn(),
    },
  },
}));

import { getCurrentMerchant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GET as customersGET } from "@/app/api/customers/route";

describe("PRD CUS-01: Customers API & Tenant Scoping", () => {
  const merchant = { id: "merch_123", email: "merch@test.com" };

  beforeEach(() => {
    vi.clearAllMocks();
    (getCurrentMerchant as any).mockResolvedValue(merchant);
  });

  it("returns customers scoped strictly to merchant and identifies repeat buyers", async () => {
    (prisma.customer.findMany as any).mockImplementation(({ where }: any) => {
      expect(where.merchantId).toBe(merchant.id);
      return Promise.resolve([
        {
          id: "cust_1",
          merchantId: merchant.id,
          phone: "+2348011111111",
          name: "Bisi Ade",
          email: "bisi@example.com",
          totalOrders: 3,
          totalSpentKobo: BigInt(750000), // ₦7,500
          updatedAt: new Date(),
        },
        {
          id: "cust_2",
          merchantId: merchant.id,
          phone: "+2348022222222",
          name: "Chidi Okafor",
          email: null,
          totalOrders: 1,
          totalSpentKobo: BigInt(200000), // ₦2,000
          updatedAt: new Date(),
        },
      ]);
    });

    (prisma.order.findMany as any).mockResolvedValue([]);

    const req = new NextRequest("http://localhost:3000/api/customers");
    const res = await customersGET(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.totalCount).toBe(2);
    expect(data.customers[0].name).toBe("Bisi Ade");
    expect(data.customers[0].isRepeat).toBe(true); // totalOrders >= 2
    expect(data.customers[1].name).toBe("Chidi Okafor");
    expect(data.customers[1].isRepeat).toBe(false);
  });

  it("filters customers by search query", async () => {
    (prisma.customer.findMany as any).mockImplementation(({ where }: any) => {
      expect(where.merchantId).toBe(merchant.id);
      expect(where.OR).toBeDefined();
      return Promise.resolve([
        {
          id: "cust_1",
          merchantId: merchant.id,
          phone: "+2348011111111",
          name: "Bisi Ade",
          email: null,
          totalOrders: 2,
          totalSpentKobo: BigInt(500000),
          updatedAt: new Date(),
        },
      ]);
    });

    (prisma.order.findMany as any).mockResolvedValue([]);

    const req = new NextRequest("http://localhost:3000/api/customers?search=Bisi");
    const res = await customersGET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.customers).toHaveLength(1);
    expect(data.customers[0].name).toBe("Bisi Ade");
  });
});
