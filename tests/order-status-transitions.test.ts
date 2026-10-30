import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth", () => ({ getCurrentMerchant: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: { findUnique: vi.fn(), update: vi.fn() },
    orderEvent: { create: vi.fn() },
    $transaction: vi.fn(),
  },
}));

import { getCurrentMerchant } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PATCH } from "@/app/api/orders/[id]/route";

describe("merchant order status transitions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getCurrentMerchant as any).mockResolvedValue({ id: "merchant_1" });
    (prisma.order.findUnique as any).mockResolvedValue({
      id: "order_1",
      merchantId: "merchant_1",
      orderStatus: "AWAITING_PAYMENT",
      paymentStatus: "AWAITING_PAYMENT",
      lines: [],
    });
  });

  it("rejects completing an unpaid order", async () => {
    const request = new NextRequest("http://localhost/api/orders/order_1", {
      method: "PATCH",
      body: JSON.stringify({ action: "MARK_COMPLETED" }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "order_1" }) });

    expect(response.status).toBe(409);
    expect(prisma.order.update).not.toHaveBeenCalled();
  });
});
