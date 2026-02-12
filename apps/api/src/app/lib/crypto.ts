import crypto from "crypto";

/**
 * We store redisUrl securely using AES-256-GCM.
 *
 * ENV REQUIRED:
 * REDIS_URL_ENCRYPTION_KEY (64 hex chars = 32 bytes)
 */

function getEncryptionKey(): Buffer {
  const hex = process.env.REDIS_URL_ENCRYPTION_KEY;

  if (!hex) {
    throw new Error("REDIS_URL_ENCRYPTION_KEY missing in env");
  }

  if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error(
      "REDIS_URL_ENCRYPTION_KEY must be 64 hex characters (32 bytes)"
    );
  }

  return Buffer.from(hex, "hex");
}

export function encryptRedisUrl(redisUrl: string) {
  const key = getEncryptionKey();

  // 12 bytes is standard for GCM
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([
    cipher.update(redisUrl, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return {
    enc: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
  };
}

export function decryptRedisUrl(payload: {
  enc: string;
  iv: string;
  tag: string;
}) {
  const key = getEncryptionKey();

  const iv = Buffer.from(payload.iv, "base64");
  const tag = Buffer.from(payload.tag, "base64");
  const encrypted = Buffer.from(payload.enc, "base64");

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
