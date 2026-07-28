const buckets = new Map();

function getIp(request) {
  const forwardedFor = String(request.headers["x-forwarded-for"] || "");
  return forwardedFor.split(",")[0].trim() || String(request.headers["x-real-ip"] || "unknown");
}

export function checkRateLimit(request, { limit = 12, windowMs = 60_000 } = {}) {
  const now = Date.now();
  const ip = getIp(request);
  const bucket = buckets.get(ip) || { count: 0, resetAt: now + windowMs };

  if (bucket.resetAt <= now) {
    bucket.count = 0;
    bucket.resetAt = now + windowMs;
  }

  bucket.count += 1;
  buckets.set(ip, bucket);

  if (bucket.count > limit) {
    return {
      ok: false,
      retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  return { ok: true, remaining: Math.max(0, limit - bucket.count) };
}
