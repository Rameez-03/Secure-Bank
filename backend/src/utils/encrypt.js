import crypto from "crypto";
import logger from "./logger.js";

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 16;
const TAG_BYTES = 16;

const getKey = () => {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error("ENCRYPTION_KEY must be a 64-character hex string (32 bytes for AES-256)");
  }
  return Buffer.from(hex, "hex");
};

/**
 * Encrypt plaintext using AES-256-GCM.
 * Returns a colon-delimited string: <iv_hex>:<authTag_hex>:<ciphertext_hex>
 */
export const encrypt = (plaintext) => {
  const key = getKey();
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
};

/**
 * Decrypt a value produced by encrypt().
 * Throws if tampering is detected (GCM auth tag mismatch).
 */
export const decrypt = (stored) => {
  const key = getKey();
  const parts = stored.split(":");
  if (parts.length !== 3) throw new Error("Invalid encrypted token format");
  const [ivHex, authTagHex, encryptedHex] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
};

/**
 * Returns true if the value looks like a token encrypted by this module.
 * Used during migration: old plaintext tokens pass through decryption-free.
 */
export const isEncrypted = (value) => {
  if (!value || typeof value !== "string") return false;
  const parts = value.split(":");
  // iv(32 hex) : authTag(32 hex) : ciphertext(any length hex)
  return (
    parts.length === 3 &&
    parts[0].length === IV_BYTES * 2 &&
    parts[1].length === TAG_BYTES * 2 &&
    parts[2].length > 0
  );
};

/**
 * Safely decrypt a token that may be either encrypted (new) or plaintext (legacy migration).
 * Logs a warning for plaintext tokens so they can be re-encrypted on next bank link.
 */
export const safeDecrypt = (value) => {
  if (isEncrypted(value)) return decrypt(value);
  // Legacy plaintext token — still functional, but should be re-encrypted
  logger.warn("security.plaintext_token_detected", { hint: "Re-link bank account to migrate to encrypted storage" });
  return value;
};
