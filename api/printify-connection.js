import { createHash, timingSafeEqual } from "node:crypto";
import { verifyOperationsToken } from "./_operations-auth.js";

const API = "https://api.printify.com/v1";

function responseJson(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  return res.end(JSON.stringify(data));
}

function equalSecret(candidate, secret) {
  if (!candidate || !secret) return false;
  const a = createHash("sha256").update(candidate).digest();
  const b = createHash("sha256").update(secret).digest();
  return timingSafeEqual(a, b);
}

function authorized(req) {
  const candidate = /^Bearer\s+(.+)$/i.exec(String(req.headers.authorization || ""))?.[1] || "";
  return equalSecret(candidate, String(process.env.PRINTIFY_ADMIN_SECRET || "").trim()) ||
    Boolean(verifyOperationsToken(candidate));
}

function validId(id) { return /^\d{1,15}$/.test(String(id || "")); }

async function printifyFetch(path) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 9000);
  try {
    const upstream = await fetch(API + path, {
      headers: { Authorization: `Bearer ${process.env.PRINTIFY_API_TOKEN}`, Accept: "application/json" },
      signal: controller.signal,
    });
    if (!upstream.ok) throw Object.assign(new Error("Printify rejected the request"), { status: upstream.status });
    return upstream.json();
  } finally { clearTimeout(timer); }
}

export default async function handler(req, res) {
  if (req.method !== "GET") return responseJson(res, 405, { ok: false, error: "Method not allowed." });
  if (!authorized(req)) return responseJson(res, 401, { ok: false, error: "Private TRST operations access required." });
  if (!process.env.PRINTIFY_API_TOKEN) return responseJson(res, 503, { ok: false, error: "Printify credential not configured." });

  const u = new URL(req.url, "https://trststudios.online");
  const action = u.searchParams.get("action") || "shops";
  const shop = u.searchParams.get("shop");
  const blueprint = u.searchParams.get("blueprint");
  const provider = u.searchParams.get("provider");
  let path;
  if (action === "shops") path = "/shops.json";
  else if (action === "products" && validId(shop)) path = `/shops/${shop}/products.json?limit=50`;
  else if (action === "blueprints") path = "/catalog/blueprints.json";
  else if (action === "providers" && validId(blueprint)) path = `/catalog/blueprints/${blueprint}/print_providers.json`;
  else if (action === "variants" && validId(blueprint) && validId(provider)) path = `/catalog/blueprints/${blueprint}/print_providers/${provider}/variants.json`;
  else return responseJson(res, 400, { ok: false, error: "Unsupported Printify read request." });

  try {
    const data = await printifyFetch(path);
    return responseJson(res, 200, { ok: true, action, data });
  } catch (error) {
    const kind = [401, 403].includes(error.status) ? "authorization failed" : "API request failed";
    return responseJson(res, 502, { ok: false, error: `Printify ${kind}`, upstreamStatus: error.status || null });
  }
}
