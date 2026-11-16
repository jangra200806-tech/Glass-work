/**
 * MAA MANSA DEVI GLASS WORKS — Lead capture endpoint (Vercel serverless)
 *
 * Contact form ka enquiry WhatsApp ke saath PARALLEL yahan aata hai, taaki
 * koi lead drop na ho (WhatsApp band / popup blocked / customer offline).
 *
 * Optional channels (sirf env var set karo, koi code change nahi):
 *   1. RESEND_API_KEY  +  ENQUIRY_TO_EMAIL  -> enquiry email bhejta hai (Resend REST API)
 *   2. SHEET_WEBHOOK_URL                    -> Google Sheets (Apps Script web app) me row likhta hai
 *   3. Dono nahi set                          -> enquiry sirf Vercel logs me save hoti hai
 *      (response me logged:true aata hai)
 *
 * Hamesha HTTP 200 deta hai jab tak form valid hai, taaki client ko error
 * na dikhe aur WhatsApp flow kabhi na toote.
 */

const RESEND_URL = "https://api.resend.com/emails";
const MAX_NAME = 80;
const MAX_PHONE = 20;
const MAX_SERVICE = 120;
const MAX_MESSAGE = 2000;
const RATE_LIMIT_COUNT = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

const hits = new Map();

function getClientIp(req) {
  const forwarded = req.headers?.["x-forwarded-for"];
  if (forwarded) return String(forwarded).split(",")[0].trim();
  return req.ip || req.socket?.remoteAddress || "unknown";
}

function isRateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_COUNT) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

function clean(value, max) {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim()
    .slice(0, max);
}

function normalizePhone(value) {
  let digits = String(value ?? "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}

async function sendEmail(enquiry) {
  const apiKey = String(process.env.RESEND_API_KEY || "").trim();
  const to = String(process.env.ENQUIRY_TO_EMAIL || "").trim();
  if (!apiKey || !to) return { sent: false, reason: "not_configured" };

  const from = String(process.env.ENQUIRY_FROM_EMAIL || "").trim()
    || "Maa Mansa Devi Glass Works <onboarding@resend.dev>";

  const lines = [
    `Name: ${enquiry.name}`,
    `Phone: ${enquiry.phone}`,
    `Service: ${enquiry.service || "-"}`,
    `Message: ${enquiry.message || "-"}`,
    `Page: ${enquiry.page || "-"}`,
    `Time: ${enquiry.time}`
  ];

  try {
    const response = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from,
        to: to.split(",").map((s) => s.trim()).filter(Boolean),
        reply_to: enquiry.phone,
        subject: `New Enquiry — ${enquiry.name} (${enquiry.service || "General"})`,
        text: lines.join("\n")
      })
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("[enquiry] resend failed:", response.status, body.slice(0, 300));
      return { sent: false, reason: "email_failed" };
    }

    const data = await response.json().catch(() => ({}));
    return { sent: true, id: data?.id || "" };
  } catch (error) {
    console.error("[enquiry] resend error:", error?.message || error);
    return { sent: false, reason: "email_failed" };
  }
}

async function saveToSheet(enquiry) {
  const webhook = String(process.env.SHEET_WEBHOOK_URL || "").trim();
  if (!webhook) return { saved: false, reason: "not_configured" };

  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: enquiry.name,
        phone: enquiry.phone,
        service: enquiry.service,
        message: enquiry.message,
        page: enquiry.page,
        time: enquiry.time
      })
    });

    if (!response.ok) {
      console.error("[enquiry] sheet webhook failed:", response.status);
      return { saved: false, reason: "sheet_failed" };
    }
    return { saved: true };
  } catch (error) {
    console.error("[enquiry] sheet webhook error:", error?.message || error);
    return { saved: false, reason: "sheet_failed" };
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  // Honeypot — bots field bhar lete hain, asli user nahi.
  if (clean(body?.company, 100)) {
    return res.status(200).json({ ok: true, emailSent: false, sheetSaved: false, filtered: true });
  }

  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return res.status(429).json({ ok: false, error: "rate_limited" });
  }

  const name = clean(body?.name, MAX_NAME);
  const phoneRaw = clean(body?.phone, MAX_PHONE);
  const service = clean(body?.service, MAX_SERVICE);
  const message = clean(body?.message, MAX_MESSAGE);
  const page = clean(body?.page, 120);

  if (name.length < 2) {
    return res.status(400).json({ ok: false, error: "invalid_name" });
  }
  const phone = normalizePhone(phoneRaw);
  if (phone.length !== 10) {
    return res.status(400).json({ ok: false, error: "invalid_phone" });
  }

  const enquiry = {
    name,
    phone: `+91${phone}`,
    service,
    message,
    page,
    time: new Date().toISOString()
  };

  const [emailResult, sheetResult] = await Promise.all([
    sendEmail(enquiry),
    saveToSheet(enquiry)
  ]);

  console.log("[enquiry]", JSON.stringify(enquiry));

  return res.status(200).json({
    ok: true,
    emailSent: emailResult.sent,
    sheetSaved: sheetResult.saved,
    logged: !emailResult.sent && !sheetResult.saved
  });
};

module.exports.config = {
  api: {
    bodyParser: {
      sizeLimit: "16kb"
    }
  }
};
