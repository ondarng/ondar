/**
 * Shared fee computation utilities for both client and server.
 */

/**
 * Computes Ondar's 1% platform fee on goods subtotal, capped at ₦1,000 (100,000 kobo)
 * Delivery and payment fees are strictly excluded.
 */
export function computeOndarCutKobo(goodsSubtotalKobo: number | bigint): bigint {
  const subtotal = BigInt(goodsSubtotalKobo);
  const onePercent = subtotal / BigInt(100);
  const capKobo = BigInt(1000 * 100); // ₦1,000 max cap
  return onePercent > capKobo ? capKobo : onePercent;
}

/**
 * Computes Paystack processing fee gross-up when "My customer pays" (PAY-04 / 4.5).
 * Paystack rate in Nigeria: 1.5% + ₦100 (flat ₦100 waived for transactions < ₦2,500). Max cap ₦2,000.
 * Returns the exact processing fee in kobo to add to customer's checkout total.
 */
export function computePaystackProcessingFeeKobo(netAmountKobo: number | bigint): bigint {
  const net = Number(netAmountKobo) / 100; // in Naira
  if (net <= 0) return BigInt(0);

  // Paystack waives flat ₦100 fee when gross transaction is < ₦2,500.
  // In terms of net amount: 2,500 * (1 - 0.015) = 2,462.50 Naira.
  let gross = 0;
  if (net < 2462.5) {
    // ₦100 flat fee waived
    gross = net / 0.985;
  } else {
    // ₦100 flat fee applies
    gross = (net + 100) / 0.985;
  }

  let feeNaira = gross - net;
  if (feeNaira > 2000) {
    feeNaira = 2000;
  }

  return BigInt(Math.round(feeNaira * 100));
}
