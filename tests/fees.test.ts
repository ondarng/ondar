import { describe, it, expect } from "vitest";
import { computeOndarCutKobo, computePaystackProcessingFeeKobo } from "@/lib/fees";

describe("Fee Calculations", () => {
  describe("computeOndarCutKobo", () => {
    it("computes 1% of goods subtotal", () => {
      // ₦10,000 = 1,000,000 kobo -> 1% = 10,000 kobo (₦100)
      expect(computeOndarCutKobo(1_000_000)).toBe(BigInt(10_000));
      // ₦50,000 = 5,000,000 kobo -> 1% = 50,000 kobo (₦500)
      expect(computeOndarCutKobo(5_000_000)).toBe(BigInt(50_000));
    });

    it("caps Ondar cut at ₦1,000 (100,000 kobo)", () => {
      // ₦200,000 = 20,000,000 kobo -> 1% would be ₦2,000 -> capped at ₦1,000
      expect(computeOndarCutKobo(20_000_000)).toBe(BigInt(100_000));
      // ₦1,000,000 = 100,000,000 kobo -> capped at ₦1,000
      expect(computeOndarCutKobo(100_000_000)).toBe(BigInt(100_000));
    });
  });

  describe("computePaystackProcessingFeeKobo", () => {
    it("returns 0 for zero or negative amount", () => {
      expect(computePaystackProcessingFeeKobo(0)).toBe(BigInt(0));
      expect(computePaystackProcessingFeeKobo(-500)).toBe(BigInt(0));
    });

    it("waives the flat ₦100 fee when net is under ₦2,462.50", () => {
      // Net ₦2,000 (200,000 kobo):
      // gross = 2000 / 0.985 = 2030.46 -> fee = 30.46 Naira -> 3046 kobo
      const fee = computePaystackProcessingFeeKobo(200_000);
      expect(fee).toBe(BigInt(3046));
    });

    it("applies the flat ₦100 fee when net reaches or exceeds ₦2,462.50", () => {
      // Net ₦5,000 (500,000 kobo):
      // gross = (5000 + 100) / 0.985 = 5177.66 -> fee = 177.66 Naira -> 17766 kobo
      const fee = computePaystackProcessingFeeKobo(500_000);
      expect(fee).toBe(BigInt(17766));
    });

    it("caps the processing fee at ₦2,000 (200,000 kobo)", () => {
      // Net ₦200,000 (20,000,000 kobo) -> fee would exceed ₦2,000 -> capped at ₦2,000
      const fee = computePaystackProcessingFeeKobo(20_000_000);
      expect(fee).toBe(BigInt(200_000));
    });
  });
});
