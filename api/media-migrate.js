import { put } from "@vercel/blob";

const SOURCE_URL = "https://at.adobe.com/65xAunY5Q87RqGah";
const TARGET_PATH = "media/4thetown-web-complete.mp4";

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const upstream = await fetch(SOURCE_URL, { redirect: "follow" });
    const contentType = upstream.headers.get("content-type") || "";

    if (!upstream.ok || !contentType.toLowerCase().includes("video/mp4")) {
      return response.status(502).json({
        ok: false,
        error: "Adobe media source did not return the expected MP4",
        upstreamStatus: upstream.status,
        contentType,
      });
    }

    const bytes = Buffer.from(await upstream.arrayBuffer());
    if (bytes.length < 1_000_000) {
      return response.status(502).json({
        ok: false,
        error: "Downloaded media was unexpectedly small",
        bytes: bytes.length,
      });
    }

    const blob = await put(TARGET_PATH, bytes, {
      access: "private",
      allowOverwrite: true,
      addRandomSuffix: false,
      contentType: "video/mp4",
      cacheControlMaxAge: 31536000,
    });

    return response.status(200).json({
      ok: true,
      pathname: blob.pathname,
      url: blob.url,
      bytes: bytes.length,
      contentType: blob.contentType || "video/mp4",
    });
  } catch (error) {
    return response.status(500).json({
      ok: false,
      error: error?.message || "Media migration failed",
    });
  }
}
