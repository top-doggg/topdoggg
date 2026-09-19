export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const source = "https://at.adobe.com/0uG1Sq7K9HziocHr";

  try {
    const upstream = await fetch(source, {
      method: "GET",
      redirect: "follow",
      headers: { Range: "bytes=0-0" },
    });

    return response.status(200).json({
      ok: upstream.ok,
      status: upstream.status,
      finalUrl: upstream.url,
      contentType: upstream.headers.get("content-type"),
      contentLength: upstream.headers.get("content-length"),
      acceptRanges: upstream.headers.get("accept-ranges"),
      contentRange: upstream.headers.get("content-range"),
    });
  } catch (error) {
    return response.status(502).json({
      ok: false,
      error: error?.message || "Unable to fetch media source",
    });
  }
}
