export type ProductStatusValue = "DRAFT" | "ACTIVE" | "HIDDEN" | "ARCHIVED";
export type StockStateValue = "in" | "low" | "out" | "not_tracked";

export const DEFAULT_LOW_STOCK_THRESHOLD = 5;

export function availableStock(onHand: number, reserved: number) {
  return Math.max(0, onHand - reserved);
}

export function getStockState(input: {
  trackStock: boolean;
  isOutOfStockManual?: boolean | null;
  stockOnHand: number;
  stockReserved: number;
  lowStockThreshold?: number | null;
}): StockStateValue {
  if (input.isOutOfStockManual) return "out";
  if (!input.trackStock) return "not_tracked";

  const available = availableStock(input.stockOnHand, input.stockReserved);
  if (available <= 0) return "out";

  const threshold = input.lowStockThreshold ?? DEFAULT_LOW_STOCK_THRESHOLD;
  if (available <= threshold) return "low";
  return "in";
}

export function isProductAvailable(product: {
  trackStock: boolean;
  isOutOfStockManual?: boolean | null;
  isPreorder?: boolean | null;
  stockOnHand: number;
  stockReserved: number;
}): boolean {
  if (product.isPreorder) {
    return false;
  }
  if (product.isOutOfStockManual) {
    return false;
  }
  if (!product.trackStock) {
    return true;
  }
  return Math.max(0, product.stockOnHand - product.stockReserved) > 0;
}

export function getCustomerAvailability(product: {
  trackStock: boolean;
  isOutOfStockManual?: boolean | null;
  isPreorder?: boolean | null;
  stockOnHand: number;
  stockReserved: number;
  lowStockThreshold?: number | null;
}): {
  isAvailable: boolean;
  label: string;
  badgeType: "in" | "low" | "out" | "preorder";
} {
  if (product.isPreorder) {
    return {
      isAvailable: false,
      label: "Pre-order",
      badgeType: "preorder",
    };
  }

  if (product.isOutOfStockManual) {
    return {
      isAvailable: false,
      label: "Out of stock",
      badgeType: "out",
    };
  }

  if (!product.trackStock) {
    return {
      isAvailable: true,
      label: "In stock",
      badgeType: "in",
    };
  }

  const available = Math.max(0, product.stockOnHand - product.stockReserved);
  if (available <= 0) {
    return {
      isAvailable: false,
      label: "Out of stock",
      badgeType: "out",
    };
  }

  const threshold = product.lowStockThreshold ?? DEFAULT_LOW_STOCK_THRESHOLD;
  if (available <= threshold) {
    return {
      isAvailable: true,
      label: `Only ${available} left`,
      badgeType: "low",
    };
  }

  return {
    isAvailable: true,
    label: "In stock",
    badgeType: "in",
  };
}

export function formatNairaFromKobo(priceKobo: string | number | bigint) {
  const naira = Math.round(Number(priceKobo) / 100);
  return `₦${naira.toLocaleString("en-NG")}`;
}

export function businessInitials(businessName: string, fallback = "AO") {
  const letters = businessName
    .split(/\s+/)
    .map((part) => part.replace(/[^a-zA-Z]/g, "")[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return letters || fallback;
}
