import { createHmac, timingSafeEqual } from "crypto";

export const RECEIPT_COOKIE = "himawari_contact_receipt";
export const RECEIPT_MAX_AGE = 60 * 60;

function secret() {
  const value = process.env.CONTACT_HASH_SALT;
  if (value) return value;
  if (process.env.NODE_ENV !== "production") return "local-contact-receipt-only";
  throw new Error("CONTACT_HASH_SALT is required");
}

export function createReceipt(reference: string, mailQueued: boolean, now = Date.now()) {
  const value = Buffer.from(JSON.stringify({ reference, mailQueued, expires: now + RECEIPT_MAX_AGE * 1000 })).toString("base64url");
  const signature = createHmac("sha256", secret()).update(value).digest("base64url");
  return `${value}.${signature}`;
}

export function readReceipt(value?: string, now = Date.now()): { reference: string; mailQueued: boolean } | null {
  if (!value || value.length > 1000) return null;
  try {
    const [data, signature, extra] = value.split(".");
    if (!data || !signature || extra) return null;
    const expected = createHmac("sha256", secret()).update(data).digest();
    const actual = Buffer.from(signature, "base64url");
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
    const receipt = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    if (!/^HF-(?:\d{6,20}|RECEIVED)$/.test(receipt.reference) || typeof receipt.mailQueued !== "boolean" ||
      !Number.isFinite(receipt.expires) || receipt.expires <= now || receipt.expires > now + RECEIPT_MAX_AGE * 1000) return null;
    return { reference: receipt.reference, mailQueued: receipt.mailQueued };
  } catch {
    return null;
  }
}
