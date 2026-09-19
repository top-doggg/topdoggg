import { put } from "@vercel/blob";

const ASSETS = [
  {
    source: "https://at.adobe.com/5EgZjMtZzPHHipts",
    pathname: "media/4thetown-web-complete.mp4",
    contentType: "video/mp4",
    minBytes: 6_000_000,
  },
  {
    source: "https://at.adobe.com/85pGAgtm15uqrWGb",
    pathname: "media/vaqurito.jpg",
    contentType: "image/jpeg",
    minBytes: 100_000,
  },
];

async function migrateAsset(asset) {
  const upstream = await fetch(asset.source, { redirect: "follow" });
  const contentType = upstream.headers.get("content-type") || "";

  if (!upstream.ok || !contentType.toLowerCase().includes(asset.contentType)) {
    throw new Error(
      `Source for ${asset.pathname} returned ${upstream.status} ${contentType}`,
    );
  }

  const bytes = Buffer.from(await upstream.arrayBuffer());
  if (bytes.length < asset.minBytes) {
    throw new Error(
      `Source for ${asset.pathname} was unexpectedly small: ${bytes.length} bytes`,
    );
  }

  const blob = await put(asset.pathname, bytes, {
    access: "private",
    allowOverwrite: true,
    addRandomSuffix: false,
    contentType: asset.contentType,
    cacheControlMaxAge: 31536000,
  });

  return {
    pathname: blob.pathname,
    url: blob.url,
    bytes: bytes.length,
    contentType: asset.contentType,
  };
}

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const migrated = [];
    for (const asset of ASSETS) {
      migrated.push(await migrateAsset(asset));
    }

    return response.status(200).json({ ok: true, migrated });
  } catch (error) {
    return response.status(500).json({
      ok: false,
      error: error?.message || "Media migration failed",
    });
  }
}
