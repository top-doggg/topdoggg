import { products } from "../src/content/products.js";
import { videos, videoObjectReadiness } from "../src/content/videos.js";

const errors = [];

for (const product of products) {
  if (!product.id || !product.name || !product.price || !product.image) {
    errors.push("Active product is missing canonical-page facts: " + (product.id || product.name || "unknown"));
  }
}

for (const video of videos) {
  const readiness = videoObjectReadiness(video);
  if (readiness.ready) {
    if (!/^\d{4}-\d{2}-\d{2}T/.test(video.uploadDate)) {
      errors.push(video.id + ": uploadDate must be an ISO 8601 DateTime with a verified time.");
    }
    if (!/^https:\/\//.test(video.thumbnailUrl)) {
      errors.push(video.id + ": thumbnailUrl must be an absolute HTTPS URL.");
    }
    if (!video.watchPath.startsWith("/")) {
      errors.push(video.id + ": watchPath must be a canonical site path.");
    }
  } else {
    console.log("VideoObject gated:", video.id, "missing", readiness.missing.join(", "));
  }
}

if (errors.length) {
  for (const error of errors) console.error("Discovery fact error:", error);
  process.exit(1);
}

console.log("Discovery fact validation passed.");
