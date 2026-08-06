import { createHmac, timingSafeEqual } from "node:crypto";

const RESEND_API_URL = "https://api.resend.com";
const SITE_URL = "https://trststudios.online";

function configuredResend() {
  const apiKey = String(process.env.RESEND_API_KEY || "").trim();
  const from = String(process.env.RESEND_FROM_EMAIL || "").trim();
  const unsubscribeSecret = String(process.env.SUBSCRIBER_UNSUBSCRIBE_SECRET || "").trim();

  return apiKey && from && unsubscribeSecret ? { apiKey, from, unsubscribeSecret } : null;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function resendRequest(config, path, payload, { method = "POST", headers = {} } = {}) {
  const response = await fetch(`${RESEND_API_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, body };
}

function unsubscribeToken(email, secret) {
  return createHmac("sha256", secret).update(email).digest("base64url");
}

export function createUnsubscribeUrl(email) {
  const secret = String(process.env.SUBSCRIBER_UNSUBSCRIBE_SECRET || "").trim();
  if (!secret) return null;

  const params = new URLSearchParams({
    email,
    token: unsubscribeToken(email, secret),
  });
  return `${SITE_URL}/api/unsubscribe?${params.toString()}`;
}

export function isValidUnsubscribeToken(email, token) {
  const secret = String(process.env.SUBSCRIBER_UNSUBSCRIBE_SECRET || "").trim();
  if (!secret || !token) return false;

  const expected = Buffer.from(unsubscribeToken(email, secret));
  const received = Buffer.from(String(token));
  return expected.length === received.length && timingSafeEqual(expected, received);
}

function welcomeEmail(email, unsubscribeUrl) {
  const safeEmail = escapeHtml(email);

  return {
    subject: "You're on the TRST Dispatch list.",
    text: [
      "Welcome to TRST Dispatch.",
      "",
      "You're on the list for limited drops, print releases, and studio stories.",
      "No daily noise. Just meaningful updates and the work behind them.",
      "",
      `Unsubscribe anytime: ${unsubscribeUrl}`,
      "",
      "TRST Studios",
      "https://trststudios.online",
    ].join("\n"),
    html: `
      <div style="background:#f6f3ee;padding:32px 16px;font-family:Arial,sans-serif;color:#141414;">
        <main style="max-width:560px;margin:0 auto;background:#ffffff;padding:32px;">
          <p style="margin:0 0 24px;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;">TRST Dispatch</p>
          <h1 style="margin:0 0 18px;font-size:30px;line-height:1.15;">You're on the list.</h1>
          <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Welcome, ${safeEmail}.</p>
          <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">You'll be first to see limited drops, print releases, and studio stories.</p>
          <p style="margin:0;font-size:16px;line-height:1.6;">No daily noise. Just meaningful updates and the work behind them.</p>
          <p style="margin:28px 0 0;"><a href="https://trststudios.online" style="display:inline-block;background:#141414;color:#ffffff;padding:12px 18px;text-decoration:none;font-weight:700;">Visit TRST Studios</a></p>
          <p style="margin:26px 0 0;font-size:12px;line-height:1.5;color:#555555;">Changed your mind? <a href="${unsubscribeUrl}" style="color:#555555;">Unsubscribe anytime</a>.</p>
        </main>
      </div>`,
  };
}

const chapterLabels = {
  "santa-ana": "Santa Ana",
  "san-juan-capistrano": "San Juan Capistrano",
};

async function ensureContactProperties(config) {
  const properties = [
    ["trst_source", "TRST source"],
    ["trst_chapter", "TRST Open Thread chapter"],
    ["trst_last_signal_at", "TRST last signal received"],
    ["trst_publish_permission", "TRST publication permission"],
  ];

  await Promise.all(
    properties.map(async ([key, fallbackValue]) => {
      const result = await resendRequest(config, "/contact-properties", {
        key,
        type: "string",
        fallbackValue,
      });
      if (!result.ok && result.status !== 409) {
        console.error("Resend contact property setup failed", { key, status: result.status });
      }
    }),
  );
}

function chapterReceiptEmail({ chapter, firstName, email, unsubscribeUrl }) {
  const city = chapterLabels[chapter] || "your city";
  const safeName = escapeHtml(firstName || "there");
  const safeEmail = escapeHtml(email);

  return {
    subject: `${city} is on the thread.`,
    text: [
      `Thank you, ${firstName || "friend"}.`,
      "",
      `Your Open Thread signal for ${city} is safely with TRST Studios.`,
      "When we share community work, it is always selected by people - never published automatically.",
      "",
      "You asked to receive TRST Dispatch and chapter updates. We will keep it considered.",
      `Unsubscribe anytime: ${unsubscribeUrl}`,
      "",
      "TRST Studios",
      "https://trststudios.online/open-thread",
    ].join("\n"),
    html: `
      <div style="background:#f6f3ee;padding:32px 16px;font-family:Arial,sans-serif;color:#141414;">
        <main style="max-width:560px;margin:0 auto;background:#ffffff;padding:32px;">
          <p style="margin:0 0 24px;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;">TRST Open Thread</p>
          <h1 style="margin:0 0 18px;font-size:30px;line-height:1.15;">${escapeHtml(city)} is on the thread.</h1>
          <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Thank you, ${safeName}. Your signal is safely with TRST Studios.</p>
          <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">When we share community work, it is always selected by people - never published automatically.</p>
          <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">You asked to receive TRST Dispatch and chapter updates at ${safeEmail}. We will keep it considered.</p>
          <p style="margin:28px 0 0;"><a href="${SITE_URL}/open-thread" style="display:inline-block;background:#141414;color:#ffffff;padding:12px 18px;text-decoration:none;font-weight:700;">Return to Open Thread</a></p>
          <p style="margin:26px 0 0;font-size:12px;line-height:1.5;color:#555555;">Changed your mind? <a href="${unsubscribeUrl}" style="color:#555555;">Unsubscribe anytime</a>.</p>
        </main>
      </div>`,
  };
}

export async function syncOpenThreadSubscriber({ email, emailHash, chapter, firstName, signalId, permissionToPublish, receivedAt }) {
  const config = configuredResend();
  if (!config) return { status: "not_configured" };

  await ensureContactProperties(config);
  const properties = {
    trst_source: "open-thread",
    trst_chapter: chapter,
    trst_last_signal_at: receivedAt,
    trst_publish_permission: permissionToPublish ? "granted" : "not-granted",
  };
  const contact = await resendRequest(config, "/contacts", { email, unsubscribed: false, properties });
  if (!contact.ok && contact.status !== 409) {
    const error = new Error("Resend could not add this subscriber.");
    error.status = contact.status;
    throw error;
  }
  if (contact.status === 409) {
    const update = await resendRequest(config, `/contacts/${encodeURIComponent(email)}`, { properties }, { method: "PATCH" });
    if (!update.ok) {
      const error = new Error("Resend could not update this subscriber.");
      error.status = update.status;
      throw error;
    }
  }

  const unsubscribeUrl = createUnsubscribeUrl(email);
  const receipt = chapterReceiptEmail({ chapter, firstName, email, unsubscribeUrl });
  const delivery = await resendRequest(
    config,
    "/emails",
    {
      from: config.from,
      to: [email],
      subject: receipt.subject,
      html: receipt.html,
      text: receipt.text,
      tags: [
        { name: "category", value: "open_thread_receipt" },
        { name: "chapter", value: chapter },
      ],
    },
    {
      headers: {
        "Idempotency-Key": `trst-open-thread-${signalId}-${emailHash.slice(0, 12)}`,
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    },
  );
  if (!delivery.ok) {
    const error = new Error("Resend could not send the chapter receipt.");
    error.status = delivery.status;
    throw error;
  }

  return { status: "chapter_receipt_sent", contactId: contact.body.id || null, emailId: delivery.body.id || null };
}

export async function notifyOperations({ subject, text, html, idempotencyKey, tags = [] }) {
  const config = configuredResend();
  const to = String(process.env.TRST_OPERATIONS_EMAIL || "").trim();
  if (!config || !to) return { status: "not_configured" };

  const delivery = await resendRequest(
    config,
    "/emails",
    { from: config.from, to: [to], subject, text, html, tags },
    { headers: { "Idempotency-Key": idempotencyKey } },
  );
  if (!delivery.ok) {
    const error = new Error("Resend could not notify TRST operations.");
    error.status = delivery.status;
    throw error;
  }
  return { status: "sent", emailId: delivery.body.id || null };
}

export async function sendOperationsAccessLink({ email, accessUrl }) {
  const config = configuredResend();
  if (!config) return { status: "not_configured" };

  const delivery = await resendRequest(config, "/emails", {
    from: config.from,
    to: [email],
    subject: "Your TRST operations access link",
    text: ["Use this private link to open the TRST operations desk.", "It expires in 15 minutes and should not be forwarded.", "", accessUrl].join("\n"),
    html: `<main style="max-width:560px;margin:0 auto;padding:32px;font-family:Arial,sans-serif;color:#141414;"><p style="font-size:12px;letter-spacing:1.5px;text-transform:uppercase;">TRST Operations</p><h1 style="font-size:28px;line-height:1.15;">Your private access link.</h1><p style="font-size:16px;line-height:1.6;">Use this link to open the TRST operations desk. It expires in 15 minutes and should not be forwarded.</p><p style="margin:28px 0 0;"><a href="${accessUrl}" style="display:inline-block;background:#141414;color:#ffffff;padding:12px 18px;text-decoration:none;font-weight:700;">Open operations desk</a></p></main>`,
    tags: [{ name: "category", value: "operations_access" }],
  }, { headers: { "Idempotency-Key": `trst-operations-link-${createHash("sha256").update(accessUrl).digest("hex").slice(0, 24)}` } });
  if (!delivery.ok) {
    const error = new Error("Resend could not send the operations access link.");
    error.status = delivery.status;
    error.providerMessage = String(delivery.body?.message || delivery.body?.name || "").slice(0, 180);
    throw error;
  }
  return { status: "sent", emailId: delivery.body.id || null };
}

export async function syncSubscriberToResend({ email, emailHash }) {
  const config = configuredResend();
  if (!config) return { status: "not_configured" };
  const unsubscribeUrl = createUnsubscribeUrl(email);

  const contact = await resendRequest(config, "/contacts", {
    email,
    unsubscribed: false,
  });

  if (!contact.ok && contact.status !== 409) {
    const error = new Error("Resend could not add this subscriber.");
    error.status = contact.status;
    throw error;
  }

  if (contact.status === 409) return { status: "contact_exists" };

  const emailContent = welcomeEmail(email, unsubscribeUrl);
  const delivery = await resendRequest(
    config,
    "/emails",
    {
      from: config.from,
      to: [email],
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      tags: [{ name: "category", value: "subscriber_welcome" }],
    },
    {
      headers: {
        "Idempotency-Key": `trst-welcome-${emailHash}`,
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    },
  );

  if (!delivery.ok) {
    const error = new Error("Resend could not send the welcome email.");
    error.status = delivery.status;
    throw error;
  }

  return {
    status: "welcome_sent",
    contactId: contact.body.id || null,
    emailId: delivery.body.id || null,
  };
}

export async function unsubscribeResendContact(email) {
  const config = configuredResend();
  if (!config) return { status: "not_configured" };

  const result = await resendRequest(
    config,
    `/contacts/${encodeURIComponent(email)}`,
    { unsubscribed: true },
    { method: "PATCH" },
  );

  if (!result.ok && result.status !== 404) {
    const error = new Error("Resend could not unsubscribe this contact.");
    error.status = result.status;
    throw error;
  }

  return { status: result.status === 404 ? "contact_missing" : "unsubscribed" };
}
