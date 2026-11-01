import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const ADMIN_SESSION_COOKIE = "ondar_admin_session";
const ADMIN_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds
const ADMIN_VERSION = "admin_v1";

function getAdminSecret() {
  const secret = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (secret && Buffer.byteLength(secret, "utf8") >= 16) {
    return createHmac("sha256", secret).update("ondar_admin_salt_2026").digest("hex");
  }
  return "ondar_admin_portal_secret_salt_2026_production_safe";
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "ondar-admin-2026";
}

export function verifyAdminPassword(input: string): boolean {
  if (typeof input !== "string" || !input) return false;
  const expected = getAdminPassword();
  const inputBuf = Buffer.from(input.trim());
  const expectedBuf = Buffer.from(expected.trim());
  if (inputBuf.length !== expectedBuf.length) return false;
  return timingSafeEqual(inputBuf, expectedBuf);
}

function signAdminPayload(payload: string): string {
  return createHmac("sha256", getAdminSecret()).update(payload).digest("base64url");
}

export function createAdminSessionToken(): string {
  const expiresAt = Math.floor(Date.now() / 1000) + ADMIN_MAX_AGE;
  const payload = `${ADMIN_VERSION}.${expiresAt}`;
  return `${payload}.${signAdminPayload(payload)}`;
}

export function validateAdminSessionToken(token?: string | null): boolean {
  if (!token || typeof token !== "string") return false;
  const [version, expiresAtValue, signature, ...extra] = token.split(".");
  if (extra.length > 0 || version !== ADMIN_VERSION || !expiresAtValue || !signature) {
    return false;
  }

  const expiresAt = Number(expiresAtValue);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) {
    return false;
  }

  const payload = `${version}.${expiresAt}`;
  const expectedSignature = signAdminPayload(payload);
  const expected = Buffer.from(expectedSignature, "utf8");
  const received = Buffer.from(signature, "utf8");

  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return false;
  }

  return true;
}

export async function setAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, createAdminSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_MAX_AGE,
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(ADMIN_SESSION_COOKIE);
    if (!cookie?.value) return false;
    return validateAdminSessionToken(cookie.value);
  } catch {
    return false;
  }
}
