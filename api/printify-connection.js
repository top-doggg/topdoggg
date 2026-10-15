import { verifyOperationsToken } from "./_operations-auth.js";

function reply(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  if (req.method !== "GET") return reply(res, 405, { ok: false, error: "Method not allowed." });

  // This endpoint must never expose the Printify credential to the browser.
  const bearer = String(req.headers.authorization || "").match(/^Bearer\s+(.+)$/i)?.[1];
  const session = verifyOperationsToken(bearer);
  if (!session) return reply(res, 401, { ok: false, error: "Private operations access required." });

  const token = String(process.env.PRINTIFY_API_TOKEN || "").trim();
  if (!token) return reply(res, 503, { ok: false, configured: false, error: "Printify credential is not configured." });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    let upstream;
    try {
      upstream = await fetch("https://api.printify.com/v1/shops.json", {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!upstream.ok) {
      return reply(res, upstream.status === 401 || upstream.status === 403 ? 502 : 503, {
        ok: false, configured: true, error: "Printify authorization or connectivity could not be verified."
      });
    }
    const shops = await upstream.json();
    return reply(res, 200, {
      ok: true,
      configured: true,
      shops: Array.isArray(shops) ? shops.map(({ id, title, sales_channel }) => ({ id, title, sales_channel })) : [],
    });
  } catch {
    return reply(res, 503, { ok: false, configured: true, error: "Printify is temporarily unreachable." });
  }
}
