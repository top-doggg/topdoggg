function normalizeUrl(value) {
  const url = (value || "").trim();
  if (!url) {
    return "";
  }
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

const storeUrl = normalizeUrl(import.meta.env.VITE_PRINTIFY_STORE_URL);

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
  "bandana-inspired-corner-print": productUrl("/product/30328896", import.meta.env.VITE_PRINTIFY_BANDANA_INSPIRED_CORNER_PRINT_URL),
  "raises-en-la-tierra": productUrl("/product/30327409", import.meta.env.VITE_PRINTIFY_RAISES_EN_LA_TIERRA_URL),
  "tribal-geometry": productUrl("/product/30323655", import.meta.env.VITE_PRINTIFY_TRIBAL_GEOMETRY_URL),
  "young-boyz": productUrl("/product/30290809", import.meta.env.VITE_PRINTIFY_YOUNG_BOYZ_URL),
  "no-bad-days": productUrl("/product/30290414", import.meta.env.VITE_PRINTIFY_NO_BAD_DAYS_URL),
  "watching-me-closely": productUrl("/product/30215179", import.meta.env.VITE_PRINTIFY_WATCHING_ME_CLOSELY_URL),
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

