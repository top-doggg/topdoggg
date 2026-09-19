import { get } from "@vercel/blob";
import { Readable } from "node:stream";

const PATHNAME = "media/vaqurito.jpg";

export default async function handler(request, response) {
  if (!["GET", "HEAD"].includes(request.method)) {
    response.setHeader("Allow", "GET, HEAD");
    response.statusCode = 405;
    response.end();
    return;
  }

  try {
    const result = await get(PATHNAME, { access: "private" });

    if (!result?.stream) {
      response.statusCode = 404;
      response.end("Profile image not found");
      return;
    }

    response.statusCode = 200;
    response.setHeader("Content-Type", "image/jpeg");
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
    console.error("Profile image delivery failed", { message: error?.message });
    response.statusCode = 500;
    response.end("Profile image delivery failed");
  }
}
