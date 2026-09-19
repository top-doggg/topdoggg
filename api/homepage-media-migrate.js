import { put } from "@vercel/blob";

const ASSETS = [
  {
    key: "grace",
    source: "https://at.adobe.com/FajUSNPIX4DDeyGy",
    pathname: "media/homepage/grace.jpg",
    contentType: "image/jpeg",
    minBytes: 100000,
  },
  {
    key: "memorial",
    source: "https://at.adobe.com/hmQUJihdZAoUntPU",
    pathname: "media/homepage/memorial.png",
    contentType: "image/png",
    minBytes: 1000000,
  },
  {
    key: "mural",
    source: "https://at.adobe.com/LzUkVxSbXic9V9k9",
    pathname: "media/homepage/mural.jpg",
    contentType: "image/jpeg",
    minBytes: 100000,
  },
  {
    key: "mark",
    source: "https://at.adobe.com/ilhG5zbCKgtZ22xs",
    pathname: "media/homepage/mark.jpg",
    contentType: "image/jpeg",
    minBytes: 100000,
  },
  {
    key: "bandana",
    source: "https://at.adobe.com/ptxv0H0H7KaunuGq",
    pathname: "media/homepage/bandana.png",
    contentType: "image/png",
    minBytes: 1000000,
  },
  {
    key: "jaguar",
    source: "https://at.adobe.com/NFebVcbfa4RWAWGT",
    pathname: "media/homepage/jaguar.png",
    contentType: "image/png",
    minBytes: 1000000,
  },
  {
    key: "warrior",
    source: "https://at.adobe.com/JqP3j5iMrYFbr8Kh",
    pathname: "media/homepage/warrior.png",
    contentType: "image/png",
    minBytes: 1000000,
  },
];

async function migrateAsset(asset) {
  const upstream = await fetch(asset.source, { redirect: "follow" });
  const contentType = upstream.headers.get("content-type") || "";

  if (!upstream.ok || !contentType.toLowerCase().includes(asset.contentType)) {
    throw new Error(
      `${asset.key} returned ${upstream.status} ${contentType || "unknown content type"}`,
    );
  }

  const bytes = Buffer.from(await upstream.arrayBuffer());
  if (bytes.length < asset.minBytes) {
    throw new Error(
      `${asset.key} was unexpectedly small: ${bytes.length} bytes`,
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
    key: asset.key,
    pathname: blob.pathname,
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
    console.error("Homepage media migration failed", { message: error?.message });
    return response.status(500).json({
      ok: false,
      error: error?.message || "Homepage media migration failed",
    });
  }
}
