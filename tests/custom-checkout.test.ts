import { describe, it, expect } from "vitest";
import { getCustomCheckoutUrl } from "@/lib/urls";

describe("Custom Checkout Links", () => {
  it("formats localhost custom checkout links with path prefix", () => {
    const url = getCustomCheckoutUrl("adas-edit", "tok_test123", "localhost:3000", "http");
    expect(url.isLocalhost).toBe(true);
    expect(url.fullUrl).toBe("http://localhost:3000/s/adas-edit/checkout?custom=tok_test123");
    expect(url.displayUrl).toBe("localhost:3000/s/adas-edit/checkout?custom=tok_test123");
  });

  it("formats production custom checkout links with clean store subdomain", () => {
    const url = getCustomCheckoutUrl("adas-edit", "tok_test123", "ondar.ng", "https");
    expect(url.isLocalhost).toBe(false);
    expect(url.fullUrl).toBe("https://adas-edit.ondar.ng/checkout?custom=tok_test123");
    expect(url.displayUrl).toBe("adas-edit.ondar.ng/checkout?custom=tok_test123");
  });
});
