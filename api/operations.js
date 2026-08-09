import { get, list, put } from "@vercel/blob";
import { checkRateLimit } from "./_rate-limit.js";
import { createOperationsToken, operationsEmails, verifyOperationsToken } from "./_operations-auth.js";
import { sendOperationsAccessLink } from "./_resend.js";

const reviewStatuses = new Set(["new", "approved", "follow-up", "declined", "published"]);

function sendJson(response, status, payload) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(payload));
}

async function readBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 8192) throw new Error("Request body is too large.");
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function storageReady() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || (process.env.VERCEL_OIDC_TOKEN && process.env.BLOB_STORE_ID));
}

async function readRecord(pathname) {
  const result = await get(pathname, { access: "private", useCache: false });
  if (!result || result.statusCode !== 200) return null;
  return JSON.parse(await new Response(result.stream).text());
}

async function recentRecords(prefix, type) {
  const result = await list({ prefix, limit: 60 });
  const records = await Promise.all(result.blobs.map(async (blob) => {
    try {
      const record = await readRecord(blob.pathname);
      return record ? { ...record, type, pathname: blob.pathname } : null;
    } catch { return null; }
  }));
  return records.filter(Boolean);
}

function session(request) {
  const url = new URL(request.url, "https://trststudios.online");
  return verifyOperationsToken(url.searchParams.get("token"));
}

export default async function handler(request, response) {
  if (!storageReady()) return sendJson(response, 503, { ok: false, error: "Operations storage is not connected." });
  if (request.method === "POST") {
    const limit = checkRateLimit(request, { limit: 3, windowMs: 15 * 60_000 });
    if (!limit.ok) return sendJson(response, 429, { ok: false, error: "Try again shortly." });
    try {
      const body = await readBody(request);
      const email = String(body.email || "").trim().toLowerCase();
      if (operationsEmails().includes(email)) {
        const token = createOperationsToken(email);
        if (!token) throw new Error("Operations access is not configured.");
        await sendOperationsAccessLink({ email, accessUrl: `https://trststudios.online/operations?token=${encodeURIComponent(token)}` });
      }
      return sendJson(response, 200, { ok: true });
    } catch (error) {
      console.error("Operations access link failed", { status: error.status || 500, providerMessage: error.providerMessage || "" });
      return sendJson(response, 500, { ok: false, error: "Could not request access." });
    }
  }

  const activeSession = session(request);
  if (!activeSession) return sendJson(response, 401, { ok: false, error: "Private access required." });
  if (request.method === "GET") {
    try {
      const [signals, partners, artworkInquiries] = await Promise.all([recentRecords("open-thread/", "signal"), recentRecords("partnership-inquiries/", "partner"), recentRecords("artwork-inquiries/", "artwork")]);
      return sendJson(response, 200, { ok: true, records: [...signals, ...partners, ...artworkInquiries].sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt)) });
    } catch { return sendJson(response, 500, { ok: false, error: "Could not load operations records." }); }
  }
  if (request.method !== "PATCH") return sendJson(response, 405, { ok: false, error: "Method not allowed." });
  try {
    const body = await readBody(request);
    const pathname = String(body.pathname || "").trim();
    const reviewStatus = String(body.reviewStatus || "").trim();
    const reviewNote = String(body.reviewNote || "").trim().slice(0, 500);
    if ((!pathname.startsWith("open-thread/") && !pathname.startsWith("partnership-inquiries/") && !pathname.startsWith("artwork-inquiries/")) || !reviewStatuses.has(reviewStatus)) return sendJson(response, 400, { ok: false, error: "Choose a valid record and review status." });
    const record = await readRecord(pathname);
    if (!record) return sendJson(response, 404, { ok: false, error: "Record not found." });
    Object.assign(record, { reviewStatus, reviewNote: reviewNote || undefined, reviewedAt: new Date().toISOString(), reviewedBy: activeSession.email });
    await put(pathname, JSON.stringify(record, null, 2), { access: "private", allowOverwrite: true, addRandomSuffix: false, contentType: "application/json", cacheControlMaxAge: 0 });
    return sendJson(response, 200, { ok: true, record: { ...record, pathname } });
  } catch { return sendJson(response, 500, { ok: false, error: "Could not save review status." }); }
}
