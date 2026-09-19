import { get } from "@vercel/blob";
import { Readable } from "node:stream";

const ASSETS = {
  grace: { pathname: "media/homepage/grace.jpg", contentType: "image/jpeg" },
  memorial: { pathname: "media/homepage/memorial.png", contentType: "image/png" },
  mural: { pathname: "media/homepage/mural.jpg", contentType: "image/jpeg" },
  mark: { pathname: "media/homepage/mark.jpg", contentType: "image/jpeg" },
  bandana: { pathname: "media/homepage/bandana.png", contentType: "image/png" },
  jaguar: { pathname: "media/homepage/jaguar.png", contentType: "image/png" },
  warrior: { pathname: "media/homepage/warrior.png", contentType: "image/png" },
};

export default async function handler(request, response) {
  if (!["GET", "HEAD"].includes(request.method)) {
    response.setHeader("Allow", "GET, HEAD");
    response.statusCode = 405;
    response.end();
    return;
  }

  const url = new URL(request.url, "https://trststudios.online");
  const key = url.searchParams.get("key");
  const asset = key ? ASSETS[key] : null;

  if (!asset) {
    response.statusCode = 404;
    response.end("Homepage image not found");
    return;
  }

  try {
    const result = await get(asset.pathname, { access: "private" });

    if (!result?.stream) {
      response.statusCode = 404;
      response.end("Homepage image not found");
      return;
    }

    response.statusCode = 200;
    response.setHeader("Content-Type", asset.contentType);
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Cache-Control", "public, max-age=86400, s-maxage=604800");

    if (result.blob?.size) {
      response.setHeader("Content-Length", String(result.blob.size));
    }

    if (request.method === "HEAD") {
      response.end();
      return;
    }

    Readable.fromWeb(result.stream).pipe(response);
  } catch (error) {
    console.error("Homepage image delivery failed", {
      key,
      message: error?.message,
    });
    response.statusCode = 500;
    response.end("Homepage image delivery failed");
  }
}
