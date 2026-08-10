function normalizeUrl(value) {
  const url = (value || "").trim();
  if (!url) {
    return "";
  }
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

const storeUrl = normalizeUrl(import.meta.env.VITE_PRINTIFY_STORE_URL || "https://delacosta.printify.me");

function productUrl(path, override) {
  const configuredUrl = normalizeUrl(override);
  if (configuredUrl) {
    return configuredUrl;
  }
  if (!storeUrl) {
    return "";
  }
  return `${storeUrl.replace(/\/$/, "")}${path}`;
}

const productUrls = {
  "capistrano-love": productUrl("/product/30805178", import.meta.env.VITE_PRINTIFY_CAPISTRANO_LOVE_URL),
  "cheos-world": productUrl("/product/30804231", import.meta.env.VITE_PRINTIFY_CHEOS_WORLD_URL),
  "no-bad-days": productUrl("/product/30290414", import.meta.env.VITE_PRINTIFY_NO_BAD_DAYS_URL),
  "sin-miedo": productUrl("/product/30190484", import.meta.env.VITE_PRINTIFY_SIN_MIEDO_URL),
};

export function isPrintifyConfigured() {
  return Boolean(storeUrl);
}

export function getPrintifyCheckoutUrl(items) {
  if (!storeUrl) {
    throw new Error("Printify checkout is waiting for the Pop-Up Store connection.");
  }

  const productIds = [...new Set(items.map((item) => item.id))];
  const missingProduct = productIds.find((id) => !productUrls[id]);
  if (missingProduct) {
    throw new Error("This design is not published in the Printify Pop-Up Store yet.");
  }

  if (productIds.length === 1) {
    return productUrls[productIds[0]];
  }

  return storeUrl;
}

