import { track } from "@vercel/analytics";

const SEARCH_HOSTS = ["google.", "bing.com", "duckduckgo.com", "yahoo.", "brave.com", "ecosia.org"];
const SOCIAL_HOSTS = ["instagram.com", "facebook.com", "t.co", "twitter.com", "threads.net", "linkedin.com", "youtube.com", "tiktok.com"];
const AI_HOSTS = ["chatgpt.com", "openai.com", "perplexity.ai", "claude.ai", "copilot.microsoft.com", "gemini.google.com"];

function safeHost(value) {
  if (!value) return "";
  try { return new URL(value).hostname.toLowerCase().replace(/^www\./, ""); } catch { return ""; }
}

function clean(value, max = 80) {
  return String(value || "").trim().slice(0, max);
}

function classifySource(referrerHost, utmSource) {
  const source = clean(utmSource).toLowerCase();
  if (source === "chatgpt.com" || source === "chatgpt") return "ai";
  if (AI_HOSTS.some((host) => referrerHost === host || referrerHost.endsWith("." + host))) return "ai";
  if (SEARCH_HOSTS.some((host) => referrerHost.includes(host))) return "search";
  if (SOCIAL_HOSTS.some((host) => referrerHost === host || referrerHost.endsWith("." + host))) return "social";
  if (source) return "campaign";
  if (referrerHost) return "referral";
  return "direct";
}

export function getDiscoveryContext() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const referrerHost = safeHost(document.referrer);
  const utmSource = clean(params.get("utm_source"));
  const utmMedium = clean(params.get("utm_medium"));
  const utmCampaign = clean(params.get("utm_campaign"));
  return {
    sourceCategory: classifySource(referrerHost, utmSource),
    referrerHost: referrerHost || "direct",
    utmSource: utmSource || "none",
    utmMedium: utmMedium || "none",
    utmCampaign: utmCampaign || "none",
  };
}

export function trackDiscoveryLanding({ routeId, pathname }) {
  if (typeof window === "undefined") return;
  try {
    const key = "trst-discovery:" + window.location.pathname + ":" + window.location.search;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    track("Discovery landing", {
      route: clean(routeId, 40) || "unknown",
      path: clean(pathname, 120) || "/",
      ...getDiscoveryContext(),
    });
  } catch {
    // Analytics must never interfere with rendering or navigation.
  }
}

export function trackDiscoveryEvent(name, properties = {}) {
  if (typeof window === "undefined") return;
  try {
    track(clean(name, 80), {
      ...getDiscoveryContext(),
      path: clean(window.location.pathname, 120) || "/",
      ...properties,
    });
  } catch {
    // Analytics must never interfere with the user experience.
  }
}
