import { put } from "@vercel/blob";
import { checkRateLimit } from "./_rate-limit.js";
import { createHash, randomUUID } from "node:crypto";

const maxBodyBytes = 96 * 1024;

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

function clean(value, limit = 500) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, limit);
}

function cleanList(values, maxItems = 12, limit = 160) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values.map((value) => clean(value, limit)).filter(Boolean).slice(0, maxItems);
}

function hashValue(value) {
  return createHash("sha256").update(value).digest("hex");
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
      service: "TRST Site Forge blueprints",
      configured,
      storage: configured ? "vercel-blob-private" : null,
    });
    return;
  }

  if (request.method !== "POST") {
    sendJson(response, 405, { ok: false, error: "Method not allowed." });
    return;
  }

  const rateLimit = checkRateLimit(request, { limit: 6, windowMs: 60_000 });
  if (!rateLimit.ok) {
    response.setHeader("Retry-After", String(rateLimit.retryAfter));
    sendJson(response, 429, { ok: false, error: "Too many requests. Try again shortly." });
    return;
  }

  if (!configured) {
    sendJson(response, 503, {
      ok: false,
      error: "Site blueprint storage is not connected yet.",
      code: "SITE_BLUEPRINT_STORAGE_NOT_CONFIGURED",
    });
    return;
  }

  try {
    const body = await readJsonBody(request);
    const prompt = clean(body.prompt || body.blueprint?.prompt, 1600);

    if (prompt.length < 8) {
      sendJson(response, 400, { ok: false, error: "Add a short website idea before saving." });
      return;
    }

    const now = new Date();
    const id = `${now.toISOString().replace(/[:.]/g, "-")}-${randomUUID()}`;
    const files = Array.isArray(body.files) ? body.files.slice(0, 12).map((file) => ({
      name: clean(file.name, 160),
      type: clean(file.type, 80),
      size: Number.isFinite(Number(file.size)) ? Number(file.size) : 0,
    })) : [];

    const blueprint = body.blueprint && typeof body.blueprint === "object" ? body.blueprint : null;
    const record = {
      id,
      status: "received",
      source: clean(body.source || "trststudios.online", 120),
      path: clean(body.path, 240),
      mode: clean(body.mode, 40),
      plan: clean(body.plan || body.blueprint?.servicePlan?.id, 80),
      clientName: clean(body.clientName || body.blueprint?.clientName, 120),
      email: clean(body.email || body.blueprint?.contactEmail, 160),
      websiteType: clean(body.websiteType, 120),
      audience: clean(body.audience, 240),
      styleWords: cleanList(String(body.styleWords || "").split(/[,\n]/), 12, 80),
      social: {
        instagram: clean(body.instagram, 240),
        facebook: clean(body.facebook, 240),
      },
      files,
      fileSummaryHash: hashValue(JSON.stringify(files)),
      prompt,
      blueprint,
      receivedAt: now.toISOString(),
      userAgent: clean(request.headers["user-agent"], 240),
    };

    await put(`site-blueprints/${id}.json`, JSON.stringify(record, null, 2), {
      access: "private",
      allowOverwrite: false,
      addRandomSuffix: false,
      contentType: "application/json",
      cacheControlMaxAge: 0,
    });

    sendJson(response, 200, { ok: true, id, stored: true });
  } catch (error) {
    sendJson(response, error.statusCode || 500, {
      ok: false,
      error: error.message || "Site blueprint could not be saved.",
    });
  }
}
