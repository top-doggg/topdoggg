import { get, head } from "@vercel/blob";
import { Readable } from "node:stream";

const PATHNAME = "media/4thetown-web-complete.mp4";

export function parseRange(value, total) {
  if (!value) return null;
  const match = /^bytes=(\d*)-(\d*)$/i.exec(String(value).trim());
  if (!match) return null;

  let start;
  let end;

  if (match[1] === "") {
    const suffix = Number(match[2]);
    if (!Number.isFinite(suffix) || suffix <= 0) return null;
    start = Math.max(total - suffix, 0);
    end = total - 1;
  } else {
    start = Number(match[1]);
    end = match[2] === "" ? total - 1 : Number(match[2]);
  }

  if (
    !Number.isSafeInteger(start) ||
    !Number.isSafeInteger(end) ||
    start < 0 ||
    start >= total ||
    end < start
  ) {
    return null;
  }

  end = Math.min(end, total - 1);
  return { start, end };
}

export default async function handler(request, response) {
  if (!["GET", "HEAD"].includes(request.method)) {
    response.setHeader("Allow", "GET, HEAD");
    response.statusCode = 405;
    response.end();
    return;
  }

  try {
    const metadata = await head(PATHNAME);
    const total = metadata.size;
    const requestedRange = parseRange(request.headers.range, total);
    if (request.headers.range && !requestedRange) {
      response.statusCode = 416;
      response.setHeader("Content-Range", `bytes */${total}`);
      response.end();
      return;
    }
    const rangeHeader = requestedRange
      ? `bytes=${requestedRange.start}-${requestedRange.end}` : undefined;
    if (request.method === "HEAD") {
      response.statusCode = 200;
      response.setHeader("Content-Type", "video/mp4");
      response.setHeader("Accept-Ranges", "bytes");
      response.setHeader("Content-Length", String(total));
      response.setHeader("X-Content-Type-Options", "nosniff");
      response.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400");
      response.end();
      return;
    }
    const result = await get(PATHNAME, {
      access: "private",
      headers: rangeHeader ? { Range: rangeHeader } : undefined,
    });

    if (!result?.stream) {
      response.statusCode = 404;
      response.end("Film not found");
      return;
    }

    if (requestedRange && result.headers.get("content-range") !== `bytes ${requestedRange.start}-${requestedRange.end}/${total}`) {
      await result.stream.cancel();
      response.statusCode = 502;
      response.end("Film range delivery failed");
      return;
    }

    response.setHeader("Content-Type", "video/mp4");
    response.setHeader("Accept-Ranges", "bytes");
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400");

    if (requestedRange) {
      const length = requestedRange.end - requestedRange.start + 1;
      response.statusCode = 206;
      response.setHeader(
        "Content-Range",
        `bytes ${requestedRange.start}-${requestedRange.end}/${total}`,
      );
      response.setHeader("Content-Length", String(length));
    } else {
      response.statusCode = 200;
      response.setHeader("Content-Length", String(total));
    }

    Readable.fromWeb(result.stream).pipe(response);
  } catch (error) {
    console.error("Film delivery failed", { message: error?.message });
    response.statusCode = 500;
    response.end("Film delivery failed");
  }
}
