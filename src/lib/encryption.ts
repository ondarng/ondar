import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

function getMasterKey(): Buffer {
  const masterKeyHex = process.env.PAYMENT_ENCRYPTION_KEY || "";
  if (!masterKeyHex || masterKeyHex.length !== 64) {
    throw new Error(
      "PAYMENT_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)"
    );
  }
  return Buffer.from(masterKeyHex, "hex");
}

export interface EncryptedPayload {
  encryptedSecretKey: string;
  iv: string;
  tag: string;
  last4: string;
}

/**
 * Encrypts a Paystack Secret Key using AES-256-GCM (Authenticated Encryption).
 * Generates a unique 96-bit (12-byte) IV for each key.
 */
export function encryptSecretKey(plainKey: string): EncryptedPayload {
  if (!plainKey || typeof plainKey !== "string") {
    throw new Error("Cannot encrypt empty or invalid key");
  }

  const iv = crypto.randomBytes(12); // Recommended 12 bytes for GCM
  const cipher = crypto.createCipheriv(ALGORITHM, getMasterKey(), iv);

  let encrypted = cipher.update(plainKey.trim(), "utf8", "hex");
  encrypted += cipher.final("hex");

  const tag = cipher.getAuthTag();

  return {
    encryptedSecretKey: encrypted,
    iv: iv.toString("hex"),
    tag: tag.toString("hex"),
    last4: plainKey.trim().slice(-4),
  };
}

/**
 * Decrypts an AES-256-GCM ciphertext using the master key, IV, and auth tag.
 * Throws if the ciphertext has been modified or tampered with.
 */
export function decryptSecretKey(
  encryptedHex: string,
  ivHex: string,
  tagHex: string
): string {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    getMasterKey(),
    Buffer.from(ivHex, "hex")
  );

  decipher.setAuthTag(Buffer.from(tagHex, "hex"));

  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Masks a secret key for UI display (e.g., sk_live_••••••••9a2f)
 */
export function maskSecretKey(last4: string, prefix = "sk_live_"): string {
  return `${prefix}••••••••${last4}`;
}
