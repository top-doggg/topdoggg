import { put } from "@vercel/blob";
import { createHash, randomUUID } from "node:crypto";
import { checkRateLimit } from "./_rate-limit.js";
import { notifyOperations, syncSubscriberToResend } from "./_resend.js";

const emailPattern = /^\S+@\S+\.\S+$/;
const inquiryTypes = new Set(["original", "edition", "exhibition", "licensing", "collaboration"]);

function sendJson(response, status, payload) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(payload));
}

function clean(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

async function readBody(request) {
  if (request.body && typeof request.body === "object") return request.body;
  if (typeof request.body === "string") return JSON.parse(request.body || "{}");
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 12 * 1024) throw Object.assign(new Error("Request body is too large."), { statusCode: 413 });
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function safe(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

export default async function handler(request, response) {
  response.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (request.method === "OPTIONS") return sendJson(response, 204, {});
  if (request.method !== "POST") return sendJson(response, 405, { ok: false, error: "Method not allowed." });

  const configured = Boolean(process.env.BLOB_READ_WRITE_TOKEN || (process.env.VERCEL_OIDC_TOKEN && process.env.BLOB_STORE_ID));
  if (!configured) return sendJson(response, 503, { ok: false, error: "Artwork inquiry intake is not connected yet." });

  const rateLimit = checkRateLimit(request, { limit: 5, windowMs: 60_000 });
  if (!rateLimit.ok) {
    response.setHeader("Retry-After", String(rateLimit.retryAfter));
    return sendJson(response, 429, { ok: false, error: "Too many requests. Try again shortly." });
  }

  try {
    const body = await readBody(request);
    if (body.website) return sendJson(response, 200, { ok: true });

    const name = clean(body.name, 120);
    const email = clean(body.email, 254).toLowerCase();
    const artworkId = clean(body.artworkId, 40);
    const artworkTitle = clean(body.artworkTitle, 160);
    const inquiryType = clean(body.inquiryType, 40);
    const message = clean(body.message, 3000);
    if (!name || !emailPattern.test(email) || !artworkId || !artworkTitle || !inquiryTypes.has(inquiryType) || !message) {
      return sendJson(response, 400, { ok: false, error: "Add your name, email, interest, and a short note." });
    }

    const record = {
      id: randomUUID(),
      type: "artwork_inquiry",
      contactType: "inquiry",
      relationshipStatus: "new",
      consentStatus: body.updates === true ? "opted_in" : "transactional_only",
      name,
      email,
      artworkId,
      artworkTitle,
      inquiryType,
      message,
      source: clean(body.source, 240) || "/",
      receivedAt: new Date().toISOString(),
      userAgent: clean(request.headers["user-agent"], 240),
    };

    const pathname = `artwork-inquiries/${record.receivedAt.slice(0, 10)}/${record.id}.json`;
    await put(pathname, JSON.stringify(record, null, 2), { access: "private", addRandomSuffix: false, contentType: "application/json", cacheControlMaxAge: 0 });

    if (body.updates === true) {
      try {
        const emailHash = createHash("sha256").update(email).digest("hex");
        await syncSubscriberToResend({ email, emailHash });
        record.subscriberSync = { provider: "resend", status: "synced", attemptedAt: new Date().toISOString() };
      } catch (error) {
        record.subscriberSync = { provider: "resend", status: "failed", attemptedAt: new Date().toISOString() };
        console.error("Artwork inquiry subscriber sync failed", { status: error.status || 500 });
      }
    }

    try {
      const operations = await notifyOperations({
        subject: `Artwork inquiry: ${artworkTitle}`,
        text: [`Name: ${name}`, `Email: ${email}`, `Artwork: ${artworkTitle} (${artworkId})`, `Interest: ${inquiryType}`, `Consent: ${record.consentStatus}`, "", message, "", `Inquiry ID: ${record.id}`].join("\n"),
        html: `<p><strong>Name:</strong> ${safe(name)}</p><p><strong>Email:</strong> ${safe(email)}</p><p><strong>Artwork:</strong> ${safe(artworkTitle)} (${safe(artworkId)})</p><p><strong>Interest:</strong> ${safe(inquiryType)}</p><p><strong>Consent:</strong> ${safe(record.consentStatus)}</p><blockquote>${safe(message)}</blockquote><p><strong>Inquiry ID:</strong> ${record.id}</p>`,
        idempotencyKey: `trst-artwork-inquiry-${record.id}`,
        tags: [{ name: "category", value: "artwork_inquiry_internal_alert" }],
      });
      record.operationsAlert = { provider: "resend", status: operations.status, attemptedAt: new Date().toISOString(), emailId: operations.emailId || undefined };
    } catch (error) {
      record.operationsAlert = { provider: "resend", status: "failed", attemptedAt: new Date().toISOString() };
      console.error("Artwork inquiry operations alert failed", { status: error.status || 500 });
    }

    await put(pathname, JSON.stringify(record, null, 2), { access: "private", allowOverwrite: true, addRandomSuffix: false, contentType: "application/json", cacheControlMaxAge: 0 });
    return sendJson(response, 200, { ok: true });
  } catch (error) {
    return sendJson(response, error.statusCode || 500, { ok: false, error: error.message || "Your inquiry could not be saved." });
  }
}
