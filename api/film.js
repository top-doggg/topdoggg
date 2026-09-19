import { get } from "@vercel/blob";
import { Readable } from "node:stream";

const PATHNAME = "media/4thetown-web-complete.mp4";
const TOTAL_BYTES = 6732250;

function parseRange(value, total) {
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
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
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

  const requestedRange = parseRange(request.headers.range, TOTAL_BYTES);
  const rangeHeader = requestedRange
    ? `bytes=${requestedRange.start}-${requestedRange.end}`
    : undefined;

  try {
    const result = await get(PATHNAME, {
      access: "private",
      headers: rangeHeader ? { Range: rangeHeader } : undefined,
    });

    if (!result?.stream) {
      response.statusCode = 404;
      response.end("Film not found");
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
        `bytes ${requestedRange.start}-${requestedRange.end}/${TOTAL_BYTES}`,
      );
      response.setHeader("Content-Length", String(length));
    } else {
      response.statusCode = 200;
      response.setHeader("Content-Length", String(TOTAL_BYTES));
    }

    if (request.method === "HEAD") {
      response.end();
      return;
    }

    Readable.fromWeb(result.stream).pipe(response);
  } catch (error) {
    console.error("Film delivery failed", { message: error?.message });
    response.statusCode = 500;
    response.end("Film delivery failed");
  }
}
