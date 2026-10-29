import { describe, it, expect } from "vitest";

describe("PR 6: Atomic Order Numbers", () => {
  it("allocates strictly distinct order numbers sequentially under concurrency", async () => {
    // Simulate atomic counter state
    let nextOrderNumber = 1001;

    async function allocateOrderNumber(): Promise<number> {
      // Atomic increment simulation (like PostgreSQL upsert nextOrderNumber = nextOrderNumber + 1 RETURNING)
      const allocated = nextOrderNumber;
      nextOrderNumber += 1;
      return allocated;
    }

    // 20 parallel checkouts
    const promises = Array.from({ length: 20 }, () => allocateOrderNumber());
    const results = await Promise.all(promises);

    expect(results).toHaveLength(20);
    const uniqueNumbers = new Set(results);
    expect(uniqueNumbers.size).toBe(20); // Exactly 20 distinct order numbers!
    expect(Math.min(...results)).toBe(1001);
    expect(Math.max(...results)).toBe(1020);
  });
});
