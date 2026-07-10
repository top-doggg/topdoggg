// server.js

"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(process.cwd());
const port = Number(process.argv[2] || process.env.PORT || 5173);
const maxRequestBodyBytes = 1 * 1024 * 1024;
const dataPath = path.join(root, "data.json");
const bookingRequests = [];

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function sendJson(response, statusCode, payload, additionalHeaders = {}) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...additionalHeaders,
  });
  response.end(JSON.stringify(payload));
}

function sendText(response, statusCode, message, additionalHeaders = {}) {
  response.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
    ...additionalHeaders,
  });
  response.end(message);
}

function readJsonBody(request, maxBytes = maxRequestBodyBytes) {
  return new Promise((resolve, reject) => {
    let body = "";
    let receivedBytes = 0;
    let completed = false;

    request.setEncoding("utf8");

    request.on("data", (chunk) => {
      if (completed) {
        return;
      }

      receivedBytes += Buffer.byteLength(chunk, "utf8");

      if (receivedBytes > maxBytes) {
        completed = true;

        const error = new Error("Request body is too large");
        error.code = "BODY_TOO_LARGE";

        reject(error);
        request.destroy();
        return;
      }

      body += chunk;
    });

    request.on("end", () => {
      if (completed) {
        return;
      }

      completed = true;

      if (!body.trim()) {
        resolve({});
        return;
      }

      try {
        const parsedBody = JSON.parse(body);

        if (
          typeof parsedBody !== "object" ||
          parsedBody === null ||
          Array.isArray(parsedBody)
        ) {
          const error = new Error("JSON body must be an object");
          error.code = "INVALID_JSON_OBJECT";
          reject(error);
          return;
        }

        resolve(parsedBody);
      } catch {
        const error = new Error("Request body contains invalid JSON");
        error.code = "INVALID_JSON";
        reject(error);
      }
    });

    request.on("error", (error) => {
      if (!completed) {
        completed = true;
        reject(error);
      }
    });

    request.on("aborted", () => {
      if (!completed) {
        completed = true;

        const error = new Error("Request was aborted");
        error.code = "REQUEST_ABORTED";
        reject(error);
      }
    });
  });
}

function validateBookingPayload(payload) {
  const requiredStringFields = [
    "eventType",
    "eventDate",
    "eventTime",
    "venueArea",
    "eventRole",
    "tier",
  ];

  const missingFields = requiredStringFields.filter((field) => {
    return typeof payload[field] !== "string" || !payload[field].trim();
  });

  if (missingFields.length > 0) {
    return {
      valid: false,
      message: `Missing or invalid fields: ${missingFields.join(", ")}`,
    };
  }

  if (!["24", "48"].includes(payload.tier)) {
    return {
      valid: false,
      message: "Planning tier must be either 24 or 48",
    };
  }

  if (
    payload.companion !== undefined &&
    payload.companion !== null &&
    typeof payload.companion !== "string"
  ) {
    return {
      valid: false,
      message: "Companion must be a string or null",
    };
  }

  if (
    typeof payload.estimate !== "object" ||
    payload.estimate === null ||
    Array.isArray(payload.estimate)
  ) {
    return {
      valid: false,
      message: "Estimate must be an object",
    };
  }

  return { valid: true };
}

function createBooking(payload) {
  return {
    eventType: payload.eventType.trim(),
    eventDate: payload.eventDate.trim(),
    eventTime: payload.eventTime.trim(),
    venueArea: payload.venueArea.trim(),
    eventRole: payload.eventRole.trim(),
    tier: payload.tier,
    companion:
      typeof payload.companion === "string"
        ? payload.companion.trim()
        : null,
    estimate: payload.estimate,
    id: `P1-${String(bookingRequests.length + 1).padStart(4, "0")}`,
    status: "manual_review",
    createdAt: new Date().toISOString(),
  };
}

function loadBootstrapData(response) {
  fs.readFile(dataPath, "utf8", (error, data) => {
    if (error) {
      console.error("Unable to load pilot data:", error);
      sendJson(response, 500, {
        error: "Unable to load pilot data",
      });
      return;
    }

    try {
      const parsedData = JSON.parse(data);
      sendJson(response, 200, parsedData);
    } catch (parseError) {
      console.error("data.json contains invalid JSON:", parseError);
      sendJson(response, 500, {
        error: "Pilot data contains invalid JSON",
      });
    }
  });
}

async function createBookingRequest(request, response) {
  const contentType = request.headers["content-type"] || "";

  if (!contentType.toLowerCase().includes("application/json")) {
    sendJson(response, 415, {
      error: "Content-Type must be application/json",
    });
    return;
  }

  try {
    const payload = await readJsonBody(request);
    const validation = validateBookingPayload(payload);

    if (!validation.valid) {
      sendJson(response, 400, {
        error: validation.message,
      });
      return;
    }

    const booking = createBooking(payload);
    bookingRequests.push(booking);

    sendJson(response, 201, booking, {
      Location: `/api/bookings/${booking.id}`,
    });
  } catch (error) {
    if (error.code === "BODY_TOO_LARGE") {
      if (!response.headersSent) {
        sendJson(response, 413, {
          error: `Request body must not exceed ${maxRequestBodyBytes} bytes`,
        });
      }
      return;
    }

    if (
      error.code === "INVALID_JSON" ||
      error.code === "INVALID_JSON_OBJECT"
    ) {
      sendJson(response, 400, {
        error: error.message,
      });
      return;
    }

    if (error.code === "REQUEST_ABORTED") {
      console.warn("Booking request was aborted by the client");
      return;
    }

    console.error("Unable to process booking request:", error);

    if (!response.headersSent) {
      sendJson(response, 500, {
        error: "Unable to process booking request",
      });
    }
  }
}

function getSafeFilePath(requestUrl) {
  let pathname;

  try {
    pathname = decodeURIComponent(requestUrl.split("?")[0]);
  } catch {
    return null;
  }

  if (pathname === "/") {
    pathname = "/index.html";
  }

  const relativePath = pathname.replace(/^[/\\]+/, "");
  const filePath = path.resolve(root, relativePath);
  const relativeToRoot = path.relative(root, filePath);

  if (
    relativeToRoot.startsWith("..") ||
    path.isAbsolute(relativeToRoot)
  ) {
    return null;
  }

  return filePath;
}

function serveStaticFile(request, response) {
  const filePath = getSafeFilePath(request.url);

  if (!filePath) {
    sendText(response, 403, "Forbidden");
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      sendText(response, 404, "Not found");
      return;
    }

    fs.readFile(filePath, (readError, data) => {
      if (readError) {
        console.error("Unable to read static file:", readError);
        sendText(response, 500, "Unable to read file");
        return;
      }

      const extension = path.extname(filePath).toLowerCase();

      response.writeHead(200, {
        "Content-Type":
          contentTypes[extension] || "application/octet-stream",
        "Content-Length": data.length,
        "X-Content-Type-Options": "nosniff",
      });

      if (request.method === "HEAD") {
        response.end();
        return;
      }

      response.end(data);
    });
  });
}

const server = http.createServer(async (request, response) => {
  const requestPath = request.url.split("?")[0];

  if (requestPath === "/api/bootstrap") {
    if (request.method !== "GET") {
      sendJson(
        response,
        405,
        { error: "Method not allowed" },
        { Allow: "GET" },
      );
      return;
    }

    loadBootstrapData(response);
    return;
  }

  if (requestPath === "/api/bookings") {
    if (request.method !== "POST") {
      sendJson(
        response,
        405,
        { error: "Method not allowed" },
        { Allow: "POST" },
      );
      return;
    }

    await createBookingRequest(request, response);
    return;
  }

  if (!["GET", "HEAD"].includes(request.method)) {
    sendText(response, 405, "Method not allowed", {
      Allow: "GET, HEAD",
    });
    return;
  }

  serveStaticFile(request, response);
});

server.on("clientError", (error, socket) => {
  console.warn("Client connection error:", error.message);

  if (socket.writable) {
    socket.end(
      "HTTP/1.1 400 Bad Request\r\n" +
        "Connection: close\r\n" +
        "Content-Type: text/plain; charset=utf-8\r\n" +
        "\r\n" +
        "Bad request",
    );
  }
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use.`);
    console.error(`Try: node server.js ${port + 1}`);
    process.exitCode = 1;
    return;
  }

  console.error("Server error:", error);
  process.exitCode = 1;
});

server.listen(port, "0.0.0.0", () => {
  console.log(`PlusOne running at http://localhost:${port}`);
});