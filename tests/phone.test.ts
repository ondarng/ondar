import { describe, it, expect } from "vitest";
import {
  formatToWhatsappNumber,
  formatNigerianDisplayPhone,
  validateAndNormalizeCustomerPhone,
  getWhatsappChatUrl,
} from "../src/lib/phone";

describe("phone normalization & whatsapp formatting", () => {
  it("normalizes standard Nigerian local numbers (080...)", () => {
    expect(formatToWhatsappNumber("08031234567")).toBe("2348031234567");
    expect(formatToWhatsappNumber("0803 123 4567")).toBe("2348031234567");
    expect(formatToWhatsappNumber("0701-234-5678")).toBe("2347012345678");
    expect(formatToWhatsappNumber("09098765432")).toBe("2349098765432");
  });

  it("normalizes international format with +234", () => {
    expect(formatToWhatsappNumber("+234 803 123 4567")).toBe("2348031234567");
    expect(formatToWhatsappNumber("+2348031234567")).toBe("2348031234567");
  });

  it("handles user mistake with extra 0 after 234 (234080...)", () => {
    expect(formatToWhatsappNumber("23408031234567")).toBe("2348031234567");
    expect(formatToWhatsappNumber("+234 0803 123 4567")).toBe("2348031234567");
  });

  it("handles 10 digits without leading 0 (8031234567)", () => {
    expect(formatToWhatsappNumber("8031234567")).toBe("2348031234567");
  });

  it("formats Nigerian phone for display", () => {
    expect(formatNigerianDisplayPhone("08031234567")).toBe("+234 803 123 4567");
    expect(formatNigerianDisplayPhone("+234 803 123 4567")).toBe("+234 803 123 4567");
  });

  it("generates correct wa.me URLs", () => {
    const url = getWhatsappChatUrl("0803 123 4567", "Hello store");
    expect(url).toBe("https://wa.me/2348031234567?text=Hello%20store");
  });

  it("validates customer phone inputs", () => {
    expect(validateAndNormalizeCustomerPhone("0803 123 4567").isValid).toBe(true);
    expect(validateAndNormalizeCustomerPhone("8031234567").isValid).toBe(true);
    expect(validateAndNormalizeCustomerPhone("123").isValid).toBe(false);
    expect(validateAndNormalizeCustomerPhone("").isValid).toBe(false);
  });
});
