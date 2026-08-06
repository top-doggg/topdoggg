import { put } from "@vercel/blob";
import { createHash, randomUUID } from "node:crypto";
import { checkRateLimit } from "./_rate-limit.js";
import { notifyOperations, syncOpenThreadSubscriber } from "./_resend.js";

const emailPattern = /^\S+@\S+\.\S+$/;
const maxBodyBytes = 12 * 1024;
const chapters = {
  "santa-ana": "Santa Ana gave me...",
  "san-juan-capistrano": "San Juan Capistrano gave me...",
};

function sendJson(response, status, payload) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(payload));
}

function clean(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

function cleanUtm(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]
      .map((key) => [key, clean(value[key], 160)])
      .filter(([, item]) => item),
  );
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
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (request.method === "OPTIONS") {
    response.statusCode = 204;
    response.end();
    return;
  }

  const configured = Boolean(process.env.BLOB_READ_WRITE_TOKEN || (process.env.VERCEL_OIDC_TOKEN && process.env.BLOB_STORE_ID));
  if (request.method === "GET") {
    sendJson(response, 200, { ok: true, service: "TRST Open Thread signal intake", configured, storage: configured ? "vercel-blob-private" : null });
    return;
  }
  if (request.method !== "POST") {
    sendJson(response, 405, { ok: false, error: "Method not allowed." });
    return;
  }
  if (!configured) {
    sendJson(response, 503, { ok: false, error: "Open Thread storage is not connected yet." });
    return;
  }

  const rateLimit = checkRateLimit(request, { limit: 4, windowMs: 60_000 });
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
    const chapter = clean(body.chapter, 80);
    const prompt = clean(body.prompt, 160);
    const signal = clean(body.signal, 320);
    const firstName = clean(body.firstName, 80);
    const email = clean(body.email, 254).toLowerCase();
    const permissionToPublish = body.permissionToPublish === true;
    const chapterUpdates = body.chapterUpdates === true;
    if (!chapters[chapter] || prompt !== chapters[chapter] || !signal) {
      sendJson(response, 400, { ok: false, error: "Add a line for an active Open Thread chapter." });
      return;
    }
    if (email && !emailPattern.test(email)) {
      sendJson(response, 400, { ok: false, error: "Add a valid email address or leave it blank." });
      return;
    }
    if (chapterUpdates && !email) {
      sendJson(response, 400, { ok: false, error: "Add an email address to receive chapter updates." });
      return;
    }

    const record = {
      id: randomUUID(),
      chapter,
      prompt,
      signal,
      firstName,
      email: email || undefined,
      permissionToPublish,
      chapterUpdates,
      path: clean(body.path, 240),
      referrer: clean(body.referrer, 500),
      utm: cleanUtm(body.utm),
      receivedAt: new Date().toISOString(),
      userAgent: clean(request.headers["user-agent"], 240),
    };

    if (chapterUpdates) {
      try {
        const emailHash = createHash("sha256").update(email).digest("hex");
        const delivery = await syncOpenThreadSubscriber({
          email,
          emailHash,
          chapter,
          firstName,
          signalId: record.id,
          permissionToPublish,
          receivedAt: record.receivedAt,
        });
        record.emailDelivery = {
          provider: "resend",
          status: delivery.status,
          attemptedAt: new Date().toISOString(),
          contactId: delivery.contactId || undefined,
          emailId: delivery.emailId || undefined,
        };
      } catch (error) {
        record.emailDelivery = { provider: "resend", status: "failed", attemptedAt: new Date().toISOString() };
        console.error("Open Thread subscriber sync failed", { status: error.status || 500 });
      }
    }
    await put(`open-thread/${chapter}/${record.receivedAt.slice(0, 10)}/${record.id}.json`, JSON.stringify(record, null, 2), {
      access: "private",
      addRandomSuffix: false,
      contentType: "application/json",
      cacheControlMaxAge: 0,
    });
    try {
      const city = chapter === "santa-ana" ? "Santa Ana" : "San Juan Capistrano";
      const safeSignal = signal.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
      const operations = await notifyOperations({
        subject: `Open Thread: new ${city} signal`,
        text: [
          `Chapter: ${city}`,
          `Review status: ${record.reviewStatus || "new"}`,
          `Publication permission: ${permissionToPublish ? "granted" : "not granted"}`,
          `Updates requested: ${chapterUpdates ? "yes" : "no"}`,
          "",
          signal,
          "",
          `Signal ID: ${record.id}`,
        ].join("\n"),
        html: `<p><strong>Chapter:</strong> ${city}</p><p><strong>Review status:</strong> new</p><p><strong>Publication permission:</strong> ${permissionToPublish ? "granted" : "not granted"}</p><p><strong>Updates requested:</strong> ${chapterUpdates ? "yes" : "no"}</p><blockquote>${safeSignal}</blockquote><p><strong>Signal ID:</strong> ${record.id}</p>`,
        idempotencyKey: `trst-open-thread-ops-${record.id}`,
        tags: [{ name: "category", value: "open_thread_internal_alert" }, { name: "chapter", value: chapter }],
      });
      record.operationsAlert = { provider: "resend", status: operations.status, attemptedAt: new Date().toISOString(), emailId: operations.emailId || undefined };
    } catch (error) {
      record.operationsAlert = { provider: "resend", status: "failed", attemptedAt: new Date().toISOString() };
      console.error("Open Thread operations alert failed", { status: error.status || 500 });
    }
    try {
      await put(`open-thread/${chapter}/${record.receivedAt.slice(0, 10)}/${record.id}.json`, JSON.stringify(record, null, 2), {
        access: "private", addRandomSuffix: false, contentType: "application/json", cacheControlMaxAge: 0,
      });
    } catch (error) {
      console.error("Open Thread operations status could not be saved", { status: error.statusCode || 500 });
    }
    sendJson(response, 200, { ok: true });
  } catch (error) {
    sendJson(response, error.statusCode || 500, { ok: false, error: error.message || "Your signal could not be saved." });
  }
}
