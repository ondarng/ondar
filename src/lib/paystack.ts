const PAYSTACK_BASE_URL = "https://api.paystack.co";

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

  let gross = 0;
  if (net < 2500) {
    // 100 waived
    gross = net / 0.985;
  } else {
    gross = (net + 100) / 0.985;
  }

  let feeNaira = gross - net;
  if (feeNaira > 2000) {
    feeNaira = 2000;
  }

  return BigInt(Math.round(feeNaira * 100));
}

export interface Bank {
  id: number;
  name: string;
  slug: string;
  code: string;
  active: boolean;
}

export interface BankResolveResponse {
  account_number: string;
  account_name: string;
  bank_id: number;
}

export interface SubaccountResponse {
  subaccount_code: string;
  business_name: string;
  account_number: string;
  percentage_charge: number;
  settlement_bank: string;
}

function getSecretKey(overrideKey?: string): string {
  const key = overrideKey || process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new Error("Paystack secret key is not provided or configured");
  }
  return key;
}

// In-memory cache for bank list to avoid hitting Paystack every time
let cachedBanks: Bank[] | null = null;
let lastBanksFetch = 0;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function fetchNigerianBanks(): Promise<Bank[]> {
  const now = Date.now();
  if (cachedBanks && now - lastBanksFetch < CACHE_TTL) {
    return cachedBanks;
  }

  const response = await fetch(`${PAYSTACK_BASE_URL}/bank?country=nigeria&perPage=300`, {
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
    },
    next: { revalidate: 86400 }, // Next.js cache 24h
  });

  const data = await response.json();
  if (!response.ok || !data.status) {
    throw new Error(data.message || "Failed to fetch Nigerian bank list from Paystack");
  }

  let banks = data.data as Bank[];

  // If in test mode, prepend Test Bank (code: 001) so sandbox testing works seamlessly
  if (getSecretKey().startsWith("sk_test_")) {
    const hasTestBank = banks.some((b) => b.code === "001");
    if (!hasTestBank) {
      banks = [
        {
          id: 0,
          name: "Test Bank (Paystack Sandbox)",
          slug: "test-bank",
          code: "001",
          active: true,
        },
        ...banks,
      ];
    }
  }

  cachedBanks = banks;
  lastBanksFetch = now;
  return cachedBanks;
}

export async function resolveBankAccount(
  accountNumber: string,
  bankCode: string
): Promise<BankResolveResponse> {
  const url = `${PAYSTACK_BASE_URL}/bank/resolve?account_number=${encodeURIComponent(
    accountNumber
  )}&bank_code=${encodeURIComponent(bankCode)}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const data = await response.json();
  if (!response.ok || !data.status) {
    throw new Error(data.message || "Could not resolve bank account details. Please check the account number and bank.");
  }

  return data.data as BankResolveResponse;
}

export async function createPaystackSubaccount(
  params: {
    businessName: string;
    settlementBank: string;
    accountNumber: string;
    percentageCharge?: number;
    description?: string;
  },
  secretKey?: string
): Promise<SubaccountResponse> {
  const response = await fetch(`${PAYSTACK_BASE_URL}/subaccount`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getSecretKey(secretKey)}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      business_name: params.businessName,
      bank_code: params.settlementBank,
      account_number: params.accountNumber,
      // Ondar's platform fee is a flat, server-computed transaction charge.
      // Keep the subaccount default at zero so no stale percentage is applied.
      percentage_charge: params.percentageCharge ?? 0,
      description: params.description ?? `Ondar payout subaccount for ${params.businessName}`,
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.status) {
    throw new Error(data.message || "Failed to create Paystack payout subaccount");
  }

  return data.data as SubaccountResponse;
}

export async function updatePaystackSubaccount(
  subaccountCode: string,
  params: { settlementBank: string; accountNumber: string; active?: boolean }
): Promise<SubaccountResponse> {
  const response = await fetch(`${PAYSTACK_BASE_URL}/subaccount/${encodeURIComponent(subaccountCode)}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      bank_code: params.settlementBank,
      account_number: params.accountNumber,
      active: params.active ?? true,
    }),
  });
  const data = await response.json();
  if (!response.ok || !data.status) {
    throw new Error(data.message || "Failed to update Paystack payout subaccount");
  }
  return data.data as SubaccountResponse;
}

/**
 * Ensures an Ondar subaccount exists on the merchant's Paystack account.
 * If one already exists with Ondar's settlement account, reuses it.
 * Otherwise creates a new subaccount with the 1% platform fee split.
 */
export async function ensureOndarSubaccountOnMerchant(
  merchantSecretKey: string
): Promise<string> {
  const ondarBank = process.env.ONDAR_SETTLEMENT_BANK || "058";
  const ondarAccount = process.env.ONDAR_SETTLEMENT_ACCOUNT_NUMBER || "0123456789";
  const percentage = parseFloat(process.env.ONDAR_PERCENTAGE_CHARGE || "1.0");

  try {
    // 1. Check existing subaccounts under this merchant's Paystack
    const listRes = await fetch(`${PAYSTACK_BASE_URL}/subaccount?perPage=100`, {
      headers: {
        Authorization: `Bearer ${merchantSecretKey}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (listRes.ok) {
      const listData = await listRes.json();
      if (listData?.status && Array.isArray(listData.data)) {
        const existing = listData.data.find(
          (sub: any) =>
            sub.account_number === ondarAccount &&
            (sub.settlement_bank === ondarBank || !ondarBank)
        );
        if (existing?.subaccount_code) {
          return existing.subaccount_code;
        }
      }
    }
  } catch (err) {
    console.warn("Could not list subaccounts, proceeding to create:", err);
  }

  // 2. Create subaccount
  const created = await createPaystackSubaccount(
    {
      businessName: "Ondar Platform Fee",
      settlementBank: ondarBank,
      accountNumber: ondarAccount,
      percentageCharge: percentage,
      description: "Ondar platform maintenance and software fee (1%)",
    },
    merchantSecretKey
  );

  return created.subaccount_code;
}

/**
 * Verifies merchant's Paystack public & secret key pairs.
 * Calls Paystack API to ensure secret key is authentic and active.
 */
export async function verifyPaystackCredentials(
  publicKey: string,
  secretKey: string
): Promise<{ isValid: boolean; isLive: boolean; error?: string }> {
  if (!publicKey || !secretKey) {
    return { isValid: false, isLive: false, error: "Both Public Key and Secret Key are required." };
  }

  const cleanPub = publicKey.trim();
  const cleanSec = secretKey.trim();

  const isLive = cleanPub.startsWith("pk_live_") && cleanSec.startsWith("sk_live_");
  const isTest = cleanPub.startsWith("pk_test_") && cleanSec.startsWith("sk_test_");

  if (!isLive && !isTest) {
    return {
      isValid: false,
      isLive: false,
      error: "Keys must start with 'pk_live_' & 'sk_live_' (or 'pk_test_' & 'sk_test_').",
    };
  }

  try {
    // Validate by querying Paystack /bank endpoint with this secret key
    const res = await fetch(`${PAYSTACK_BASE_URL}/bank?perPage=1`, {
      headers: {
        Authorization: `Bearer ${cleanSec}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await res.json();
    if (!res.ok || !data.status) {
      return {
        isValid: false,
        isLive,
        error: data.message || "Invalid Paystack Secret Key.",
      };
    }

    return { isValid: true, isLive };
  } catch (err: any) {
    return {
      isValid: false,
      isLive,
      error: err?.message || "Could not connect to Paystack to verify keys.",
    };
  }
}


export interface InitializeTransactionParams {
  email: string;
  amountKobo: number | bigint;
  callbackUrl: string;
  reference: string;
  metadata?: Record<string, any>;
  subaccount?: string | null;
  transactionChargeKobo?: number | bigint;
  bearer?: "account" | "subaccount";
}

export interface InitializeTransactionResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface VerifyTransactionResponse {
  status: "success" | "failed" | "abandoned";
  reference: string;
  amount: number;
  currency: string;
  paid_at: string;
  channel: string;
  metadata?: Record<string, any>;
}

export async function initializePaystackTransaction(
  params: InitializeTransactionParams,
  secretKey?: string
): Promise<InitializeTransactionResponse> {
  const payload: Record<string, any> = {
    email: params.email,
    amount: Number(params.amountKobo),
    callback_url: params.callbackUrl,
    reference: params.reference,
    metadata: params.metadata || {},
  };

  if (params.subaccount) {
    payload.subaccount = params.subaccount;
    payload.transaction_charge = params.transactionChargeKobo === undefined
      ? undefined
      : Number(params.transactionChargeKobo);
    payload.bearer = params.bearer || "subaccount";
  }

  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getSecretKey(secretKey)}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok || !data.status) {
    throw new Error(data.message || "Failed to initialize Paystack transaction");
  }

  return data.data as InitializeTransactionResponse;
}

export async function verifyPaystackTransaction(
  reference: string,
  secretKey?: string
): Promise<VerifyTransactionResponse> {
  const response = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getSecretKey(secretKey)}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  const data = await response.json();
  if (!response.ok || !data.status) {
    throw new Error(data.message || "Failed to verify Paystack transaction");
  }

  return data.data as VerifyTransactionResponse;
}
