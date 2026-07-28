import { put } from "@vercel/blob";
import { checkRateLimit } from "./_rate-limit.js";
import { createHash } from "node:crypto";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const maxBodyBytes = 8 * 1024;

function sendJson(response, status, payload) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(payload));
}

function getOrigin(request) {
  const origin = request.headers.origin || "";
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) {
    return origin;
  }
  if (/^https:\/\/(www\.)?trststudios\.online$/i.test(origin)) {
    return origin;
  }
  return "";
}

async function readJsonBody(request) {
  if (request.body && typeof request.body === "object") {
    return request.body;
  }

  if (typeof request.body === "string") {
    return JSON.parse(request.body || "{}");
  }

  let size = 0;
  const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBodyBytes) {
      const error = new Error("Request body is too large.");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function hashEmail(email) {
  return createHash("sha256").update(email).digest("hex");
}

export default async function handler(request, response) {
  const origin = getOrigin(request);
  if (origin) {
    response.setHeader("Access-Control-Allow-Origin", origin);
  }
  response.setHeader("Vary", "Origin");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (request.method === "OPTIONS") {
    response.statusCode = 204;
    response.end();
    return;
  }

  const configured = Boolean(process.env.BLOB_READ_WRITE_TOKEN || (process.env.VERCEL_OIDC_TOKEN && process.env.BLOB_STORE_ID));

  if (request.method === "GET") {
    sendJson(response, 200, {
      ok: true,
      service: "TRST Studios subscriber intake",
      configured,
      storage: configured ? "vercel-blob-private" : null,
    });
    return;
  }

  if (request.method !== "POST") {
    sendJson(response, 405, { ok: false, error: "Method not allowed." });
    return;
  }

  const rateLimit = checkRateLimit(request, { limit: 8, windowMs: 60_000 });
  if (!rateLimit.ok) {
    response.setHeader("Retry-After", String(rateLimit.retryAfter));
    sendJson(response, 429, { ok: false, error: "Too many requests. Try again shortly." });
    return;
  }

  if (!configured) {
    sendJson(response, 503, {
      ok: false,
      error: "Subscriber storage is not connected yet.",
      code: "SUBSCRIBER_STORAGE_NOT_CONFIGURED",
    });
    return;
  }

  try {
    const body = await readJsonBody(request);

    // Honeypot field. Real visitors never fill this; bots often do.
    if (body.website) {
      sendJson(response, 200, { ok: true });
      return;
    }

    const email = normalizeEmail(body.email);
    if (!emailPattern.test(email) || email.length > 254) {
      sendJson(response, 400, { ok: false, error: "Add a valid email address." });
      return;
    }

    const now = new Date();
    const emailHash = hashEmail(email);
    const record = {
      email,
      emailHash,
      status: "subscribed",
      source: String(body.source || "trststudios.online").slice(0, 120),
      path: String(body.path || "").slice(0, 240),
      subscribedAt: now.toISOString(),
      userAgent: String(request.headers["user-agent"] || "").slice(0, 240),
    };

    await put(
      `subscribers/${emailHash}.json`,
      JSON.stringify(record, null, 2),
      {
        access: "private",
        allowOverwrite: true,
        addRandomSuffix: false,
        contentType: "application/json",
        cacheControlMaxAge: 0,
      },
    );

    sendJson(response, 200, { ok: true, subscribed: true });
  } catch (error) {
    sendJson(response, error.statusCode || 500, {
      ok: false,
      error: error.message || "Subscriber signup could not be saved.",
    });
  }
}