import { describe, it, expect } from "vitest";
import {
  verifyAdminPassword,
  createAdminSessionToken,
  validateAdminSessionToken,
} from "@/lib/adminAuth";

describe("Admin Authentication", () => {
  it("verifies the default admin password correctly", () => {
    expect(verifyAdminPassword("ondar-admin-2026")).toBe(true);
    expect(verifyAdminPassword("wrong-password")).toBe(false);
    expect(verifyAdminPassword("")).toBe(false);
  });

  it("creates and validates signed admin session tokens", () => {
    const token = createAdminSessionToken();
    expect(typeof token).toBe("string");
    expect(validateAdminSessionToken(token)).toBe(true);
  });

  it("rejects tampered or forged tokens", () => {
    const token = createAdminSessionToken();
    const tampered = token.slice(0, -4) + "abcd";
    expect(validateAdminSessionToken(tampered)).toBe(false);
    expect(validateAdminSessionToken("invalid.token")).toBe(false);
    expect(validateAdminSessionToken(null)).toBe(false);
  });
});
