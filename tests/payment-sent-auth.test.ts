import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: { findUnique: vi.fn(), findFirst: vi.fn(), updateMany: vi.fn() },
    orderEvent: { create: vi.fn() },
    $transaction: vi.fn(),
  },
}));

import { prisma } from "@/lib/prisma";
import { POST } from "@/app/api/orders/[id]/payment-sent/route";

describe("payment-sent customer authorization", () => {
  beforeEach(() => vi.clearAllMocks());

  it("requires the order's public token before extending a stock hold", async () => {
    const request = new NextRequest("http://localhost/api/orders/order_1/payment-sent", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await POST(request, { params: Promise.resolve({ id: "order_1" }) });

    expect(response.status).toBe(401);
    expect(prisma.order.findUnique).not.toHaveBeenCalled();
  });
});
