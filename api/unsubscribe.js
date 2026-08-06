import { put } from "@vercel/blob";
import { createHash } from "node:crypto";
import { checkRateLimit } from "./_rate-limit.js";
import { isValidUnsubscribeToken, unsubscribeResendContact } from "./_resend.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sendHtml(response, status, html) {
  response.statusCode = status;
  response.setHeader("Content-Type", "text/html; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TRST Studios</title></head><body style="margin:0;background:#f6f3ee;color:#141414;font-family:Arial,sans-serif"><main style="max-width:540px;margin:10vh auto;padding:32px;background:#fff">${html}</main></body></html>`);
}

function cleanEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function hashEmail(email) {
  return createHash("sha256").update(email).digest("hex");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function requestDetails(request) {
  const url = new URL(request.url, `https://${request.headers.host || "trststudios.online"}`);
  return {
    email: cleanEmail(url.searchParams.get("email")),
    token: String(url.searchParams.get("token") || ""),
    action: url.pathname + url.search,
  };
}

export default async function handler(request, response) {
  const { email, token, action } = requestDetails(request);
  const valid = emailPattern.test(email) && isValidUnsubscribeToken(email, token);

  if (!valid) {
    sendHtml(response, 400, "<p style=\"font-size:12px;letter-spacing:1.5px;text-transform:uppercase\">TRST Studios</p><h1>This unsubscribe link is invalid.</h1><p>Please use the link from your email.</p>");
    return;
  }

  if (request.method === "GET") {
    const safeEmail = escapeHtml(email);
    const safeAction = escapeHtml(action);
    sendHtml(response, 200, `<p style="font-size:12px;letter-spacing:1.5px;text-transform:uppercase">TRST Dispatch</p><h1 style="font-size:32px;line-height:1.15">Unsubscribe from updates?</h1><p style="line-height:1.6">${safeEmail} will stop receiving TRST Studios marketing updates.</p><form method="post" action="${safeAction}"><button type="submit" style="border:0;background:#141414;color:#fff;padding:12px 18px;font-weight:700;cursor:pointer">Confirm unsubscribe</button></form>`);
    return;
  }

  if (request.method !== "POST") {
    response.setHeader("Allow", "GET, POST");
    sendHtml(response, 405, "<h1>Method not allowed.</h1>");
    return;
  }

  const rateLimit = checkRateLimit(request, { limit: 12, windowMs: 60_000 });
  if (!rateLimit.ok) {
    response.setHeader("Retry-After", String(rateLimit.retryAfter));
    sendHtml(response, 429, "<h1>Please try again shortly.</h1>");
    return;
  }

  try {
    const result = await unsubscribeResendContact(email);
    if (result.status === "not_configured") {
      sendHtml(response, 503, "<h1>Unsubscribe is temporarily unavailable.</h1><p>Please try again shortly.</p>");
      return;
    }

    const now = new Date().toISOString();
    await put(
      `subscribers/${hashEmail(email)}.json`,
      JSON.stringify({
        email,
        emailHash: hashEmail(email),
        status: "unsubscribed",
        unsubscribedAt: now,
        unsubscribeProviderStatus: result.status,
      }, null, 2),
      {
        access: "private",
        allowOverwrite: true,
        addRandomSuffix: false,
        contentType: "application/json",
        cacheControlMaxAge: 0,
      },
    );

    sendHtml(response, 200, "<p style=\"font-size:12px;letter-spacing:1.5px;text-transform:uppercase\">TRST Dispatch</p><h1 style=\"font-size:32px;line-height:1.15\">You're unsubscribed.</h1><p style=\"line-height:1.6\">You won't receive future TRST Studios marketing updates.</p>");
  } catch (error) {
    console.error("Subscriber unsubscribe failed", { status: error.status || 500 });
    sendHtml(response, 503, "<h1>Unsubscribe is temporarily unavailable.</h1><p>Please try again shortly.</p>");
  }
}
