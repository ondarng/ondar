import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { validateAndNormalizeCustomerPhone } from "./phone";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNaira(kobo: number | bigint): string {
  const naira = Number(kobo) / 100;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(naira);
}

export function normalizePhone(phone: string): string {
  const result = validateAndNormalizeCustomerPhone(phone);
  return result.normalized || phone;
}
