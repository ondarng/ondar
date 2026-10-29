import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock getCurrentMerchant and prisma
vi.mock("@/lib/auth", () => ({
  getCurrentMerchant: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    order: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    orderCounter: {
      upsert: vi.fn(),
    },
    stockAudit: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    orderEvent: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { getCurrentMerchant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { POST as recordSalePOST } from "@/app/api/orders/record/route";
import { PATCH as orderPatchPATCH } from "@/app/api/orders/[id]/route";
import { PATCH as productPatchPATCH } from "@/app/api/products/[id]/route";
import { GET as historyGET } from "@/app/api/products/[id]/history/route";

describe("PR 2: Tenant Scoping Across Routes", () => {
  const merchantA = { id: "merchant_A", email: "merchA@test.com" };
  const merchantB = { id: "merchant_B", email: "merchB@test.com" };

  beforeEach(() => {
    vi.clearAllMocks();
    (getCurrentMerchant as any).mockResolvedValue(merchantA);
  });

  it("rejects recording a sale when product belongs to merchant B", async () => {
    (prisma.$transaction as any).mockImplementation(async (cb: any) => {
      const tx = {
        product: {
          findFirst: vi.fn().mockResolvedValue(null), // Product does not belong to merchant A
          findUnique: vi.fn().mockResolvedValue({ id: "prod_B", merchantId: "merchant_B" }),
        },
        orderCounter: {
          upsert: vi.fn().mockResolvedValue({ nextOrderNumber: 1002 }),
        },
        order: {
          create: vi.fn(),
        },
        stockAudit: {
          create: vi.fn(),
        },
        orderEvent: {
          create: vi.fn(),
        },
      };
      return cb(tx);
    });

    const req = new NextRequest("http://localhost:3000/api/orders/record", {
      method: "POST",
      body: JSON.stringify({
        items: [{ productId: "prod_B", name: "Merchant B's item", priceKobo: 500000, quantity: 1 }],
        paymentMethod: "Cash",
      }),
    });

    const res = await recordSalePOST(req);
    expect(res.status).toBeGreaterThanOrEqual(400);
    const data = await res.json();
    expect(data.error).toMatch(/not found|belong/i);
  });

  it("rejects order actions when order belongs to merchant B", async () => {
    (prisma.order.findUnique as any).mockResolvedValue({
      id: "order_B",
      merchantId: "merchant_B", // Belongs to B, not A!
      lines: [],
    });
    (prisma.order.findFirst as any).mockResolvedValue(null);

    const req = new NextRequest("http://localhost:3000/api/orders/order_B", {
      method: "PATCH",
      body: JSON.stringify({
        action: "ADD_NOTE",
        note: "Hacker note",
      }),
    });

    const res = await orderPatchPATCH(req, { params: Promise.resolve({ id: "order_B" }) });
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toMatch(/Order not found/i);
  });

  it("rejects product edit when product belongs to merchant B", async () => {
    (prisma.product.findFirst as any).mockResolvedValue(null); // Not found under merchant A

    const req = new NextRequest("http://localhost:3000/api/products/prod_B", {
      method: "PATCH",
      body: JSON.stringify({
        name: "Hacked name",
      }),
    });

    const res = await productPatchPATCH(req, { params: Promise.resolve({ id: "prod_B" }) });
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toMatch(/Product not found/i);
  });

  it("rejects product history view when product belongs to merchant B", async () => {
    (prisma.product.findFirst as any).mockResolvedValue(null); // Not found under merchant A

    const req = new NextRequest("http://localhost:3000/api/products/prod_B/history", {
      method: "GET",
    });

    const res = await historyGET(req, { params: Promise.resolve({ id: "prod_B" }) });
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toMatch(/Product not found/i);
  });
});
