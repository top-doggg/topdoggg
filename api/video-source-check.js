export default async function handler(req, res) {
  const source = "https://at.adobe.com/PRBfyRm8XX2Y21rS";
  try {
    const response = await fetch(source, { redirect: "follow" });
    res.status(200).json({
      status: response.status,
      ok: response.ok,
      finalUrl: response.url,
      contentType: response.headers.get("content-type"),
      contentLength: response.headers.get("content-length"),
      acceptRanges: response.headers.get("accept-ranges"),
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
}
