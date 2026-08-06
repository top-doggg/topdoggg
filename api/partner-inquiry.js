import { put } from "@vercel/blob";
import { randomUUID } from "node:crypto";
import { checkRateLimit } from "./_rate-limit.js";
import { notifyOperations } from "./_resend.js";

const emailPattern = /^\S+@\S+\.\S+$/;
const maxBodyBytes = 12 * 1024;

function sendJson(response, status, payload) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(payload));
}

function clean(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function getOrigin(request) {
  const origin = request.headers.origin || "";
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin) || /^https:\/\/(www\.)?trststudios\.online$/i.test(origin) ? origin : "";
}

async function readBody(request) {
  if (request.body && typeof request.body === "object") return request.body;
  if (typeof request.body === "string") return JSON.parse(request.body || "{}");
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

export default async function handler(request, response) {
  const origin = getOrigin(request);
  if (origin) response.setHeader("Access-Control-Allow-Origin", origin);
  response.setHeader("Vary", "Origin");
  response.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (request.method === "OPTIONS") {
    response.statusCode = 204;
    response.end();
    return;
  }
  if (request.method !== "POST") {
    sendJson(response, 405, { ok: false, error: "Method not allowed." });
    return;
  }

  const configured = Boolean(process.env.BLOB_READ_WRITE_TOKEN || (process.env.VERCEL_OIDC_TOKEN && process.env.BLOB_STORE_ID));
  if (!configured) {
    sendJson(response, 503, { ok: false, error: "Collaboration intake is not connected yet." });
    return;
  }

  const rateLimit = checkRateLimit(request, { limit: 5, windowMs: 60_000 });
  if (!rateLimit.ok) {
    response.setHeader("Retry-After", String(rateLimit.retryAfter));
    sendJson(response, 429, { ok: false, error: "Too many requests. Try again shortly." });
    return;
  }

  try {
    const body = await readBody(request);
    if (body.website) {
      sendJson(response, 200, { ok: true });
      return;
    }
    const name = clean(body.name, 120);
    const email = clean(body.email, 254).toLowerCase();
    const organization = clean(body.organization, 160);
    const interest = clean(body.interest, 80);
    const link = clean(body.link, 300);
    const idea = clean(body.idea, 3000);
    if (!name || !emailPattern.test(email) || !organization || !interest || !idea) {
      sendJson(response, 400, { ok: false, error: "Add your name, email, organization, and collaboration idea." });
      return;
    }

    const record = {
      id: randomUUID(),
      name,
      email,
      organization,
      interest,
      link,
      idea,
      path: clean(body.path, 240),
      receivedAt: new Date().toISOString(),
      userAgent: clean(request.headers["user-agent"], 240),
    };
    await put(`partnership-inquiries/${record.receivedAt.slice(0, 10)}/${record.id}.json`, JSON.stringify(record, null, 2), {
      access: "private",
      addRandomSuffix: false,
      contentType: "application/json",
      cacheControlMaxAge: 0,
    });
    try {
      const safe = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
      const operations = await notifyOperations({
        subject: `Partner inquiry: ${organization}`,
        text: [`Name: ${name}`, `Organization: ${organization}`, `Interest: ${interest}`, `Email: ${email}`, link ? `Link: ${link}` : "", "", idea, "", `Inquiry ID: ${record.id}`].filter(Boolean).join("\n"),
        html: `<p><strong>Name:</strong> ${safe(name)}</p><p><strong>Organization:</strong> ${safe(organization)}</p><p><strong>Interest:</strong> ${safe(interest)}</p><p><strong>Email:</strong> ${safe(email)}</p>${link ? `<p><strong>Link:</strong> ${safe(link)}</p>` : ""}<blockquote>${safe(idea)}</blockquote><p><strong>Inquiry ID:</strong> ${record.id}</p>`,
        idempotencyKey: `trst-partner-inquiry-${record.id}`,
        tags: [{ name: "category", value: "partner_inquiry_internal_alert" }],
      });
      record.operationsAlert = { provider: "resend", status: operations.status, attemptedAt: new Date().toISOString(), emailId: operations.emailId || undefined };
    } catch (error) {
      record.operationsAlert = { provider: "resend", status: "failed", attemptedAt: new Date().toISOString() };
      console.error("Partner inquiry operations alert failed", { status: error.status || 500 });
    }
    try {
      await put(`partnership-inquiries/${record.receivedAt.slice(0, 10)}/${record.id}.json`, JSON.stringify(record, null, 2), {
        access: "private", addRandomSuffix: false, contentType: "application/json", cacheControlMaxAge: 0,
      });
    } catch (error) {
      console.error("Partner inquiry operations status could not be saved", { status: error.statusCode || 500 });
    }
    sendJson(response, 200, { ok: true });
  } catch (error) {
    sendJson(response, error.statusCode || 500, { ok: false, error: error.message || "Your request could not be saved." });
  }
}
