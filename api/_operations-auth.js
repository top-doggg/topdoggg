import { createHmac, timingSafeEqual } from "node:crypto";

const ttlMs = 15 * 60 * 1000;

function secret() {
  return String(process.env.TRST_OPERATIONS_TOKEN_SECRET || process.env.SUBSCRIBER_UNSUBSCRIBE_SECRET || "").trim();
}

export function operationsEmails() {
  return String(process.env.TRST_OPERATIONS_EMAIL || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function signature(payload, key) {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

export function createOperationsToken(email) {
  const key = secret();
  if (!key) return null;
  const payload = Buffer.from(JSON.stringify({ email, expiresAt: Date.now() + ttlMs })).toString("base64url");
  return `${payload}.${signature(payload, key)}`;
}

export function verifyOperationsToken(token) {
  const key = secret();
  if (!key || !token || !String(token).includes(".")) return null;
  const [payload, received] = String(token).split(".");
  const expected = Buffer.from(signature(payload, key));
  const actual = Buffer.from(received || "");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!operationsEmails().includes(decoded.email) || !Number.isFinite(decoded.expiresAt) || decoded.expiresAt < Date.now()) return null;
    return decoded;
  } catch {
    return null;
  }
}
