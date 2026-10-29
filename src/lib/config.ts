/**
 * Ondar Feature Configuration (PRD v2 authoritative)
 * 
 * In Stage A (Momentum Launch) and Stage B, Paystack is switched OFF by default (D-02, D-03).
 * When OFF, all orders flow through manual bank transfer directly to the vendor's verified account.
 * Paystack cannot be enabled until the gate in Section 12 is fully satisfied.
 */

export const CONFIG = {
  // Paystack Off Switch (Ticket A-01, D-03). Default: false.
  ENABLE_PAYSTACK: process.env.NEXT_PUBLIC_ENABLE_PAYSTACK === "true",

  // Stock hold durations
  HOLD_DURATION_AWAITING_PAYMENT_MINUTES: 120, // 2 hours initial hold (PRD v2 Section 6)
  HOLD_DURATION_PAYMENT_SENT_HOURS: 48,        // up to 48 hours while vendor verifies claimed transfer

  // Platform cut (Only applies when Paystack is live, PENDING in Stage C)
  ONDAR_CUT_PERCENT: 0.01,
  ONDAR_CUT_CAP_NAIRA: 1000,
} as const;
