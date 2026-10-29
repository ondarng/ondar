import { describe, it, expect } from "vitest";
import { jsonSafe } from "@/lib/json";

describe("PR 0: Build Fixes & JSON-safe BigInt serialization", () => {
  it("converts BigInt fields to strings recursively", () => {
    const data = {
      id: "prod_1",
      priceKobo: BigInt(500000),
      nested: {
        costKobo: BigInt(250000),
        qty: 5,
        name: "Vintage Bag",
      },
      tags: [BigInt(1), BigInt(2)],
    };

    const safe = jsonSafe(data);

    expect(safe).toEqual({
      id: "prod_1",
      priceKobo: "500000",
      nested: {
        costKobo: "250000",
        qty: 5,
        name: "Vintage Bag",
      },
      tags: ["1", "2"],
    });
    expect(typeof safe.priceKobo).toBe("string");
    expect(typeof safe.nested.costKobo).toBe("string");
  });

  it("handles empty objects and null values gracefully", () => {
    expect(jsonSafe(null)).toBe(null);
    expect(jsonSafe({})).toEqual({});
    expect(jsonSafe([])).toEqual([]);
  });
});
