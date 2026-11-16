/**
 * MAA MANSA DEVI GLASS WORKS — Lead capture endpoint (Vercel serverless)
 *
 * Contact form ka enquiry WhatsApp ke saath PARALLEL yahan aata hai, taaki
 * koi lead drop na ho (WhatsApp band / popup blocked / customer offline).
 *
 * Optional channels (sirf env var set karo, koi code change nahi):
 *   1. BREVO_API_KEY  +  ENQUIRY_TO_EMAIL  -> enquiry email bhejta hai (Brevo/Sendinblue)
 *   2. RESEND_API_KEY +  ENQUIRY_TO_EMAIL  -> enquiry email bhejta hai (Resend REST API)
 *   3. SHEET_WEBHOOK_URL                   -> Google Sheets (Apps Script web app) me row likhta hai
 *   4. Koi nahi                             -> enquiry sirf Vercel logs me save hoti hai
 *      (response me logged:true aata hai)
 *
 * Hamesha HTTP 200 deta hai jab tak form valid hai, taaki client ko error
 * na dikhe aur WhatsApp flow kabhi na toote.
 */

const RESEND_URL = "https://api.resend.com/emails";
const BREVO_URL = "https://api.brevo.com/v3/smtp/email";
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

async function sendEmailBrevo(enquiry) {
  const apiKey = String(process.env.BREVO_API_KEY || "").trim();
  const to = String(process.env.ENQUIRY_TO_EMAIL || "").trim();
  if (!apiKey || !to) return { sent: false, reason: "not_configured" };

  const senderEmail = String(process.env.BREVO_SENDER_EMAIL || "").trim() || to;
  const senderName = String(process.env.BREVO_SENDER_NAME || "").trim()
    || "Maa Mansa Devi Glass Works";

  const lines = [
    `Name: ${enquiry.name}`,
    `Phone: ${enquiry.phone}`,
    `Service: ${enquiry.service || "-"}`,
    `Message: ${enquiry.message || "-"}`,
    `Page: ${enquiry.page || "-"}`,
    `Time: ${enquiry.time}`
  ];

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#f4f6f9;padding:24px">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e3e8ef">
        <div style="background:#102D4F;color:#ffffff;padding:18px 24px">
          <div style="font-size:17px;font-weight:700;letter-spacing:.3px">New Website Enquiry</div>
          <div style="font-size:12px;opacity:.85;margin-top:3px">MAA MANSA DEVI GLASS WORKS — Kaithal, Haryana</div>
        </div>
        <div style="padding:22px 24px">
          <table style="width:100%;border-collapse:collapse;font-size:14px;color:#23303f">
            <tr><td style="padding:7px 0;color:#6b7a8d;width:110px">Name</td><td style="padding:7px 0;font-weight:700">${escapeHtml(enquiry.name)}</td></tr>
            <tr><td style="padding:7px 0;color:#6b7a8d">Phone</td><td style="padding:7px 0;font-weight:700"><a href="tel:${escapeHtml(enquiry.phone)}" style="color:#0F6FB3;text-decoration:none">${escapeHtml(enquiry.phone)}</a></td></tr>
            <tr><td style="padding:7px 0;color:#6b7a8d">Service</td><td style="padding:7px 0">${escapeHtml(enquiry.service || "-")}</td></tr>
            <tr><td style="padding:7px 0;color:#6b7a8d">Message</td><td style="padding:7px 0;white-space:pre-wrap">${escapeHtml(enquiry.message || "-")}</td></tr>
            <tr><td style="padding:7px 0;color:#6b7a8d">Page</td><td style="padding:7px 0">${escapeHtml(enquiry.page || "-")}</td></tr>
            <tr><td style="padding:7px 0;color:#6b7a8d">Time</td><td style="padding:7px 0">${escapeHtml(enquiry.time)}</td></tr>
          </table>
        </div>
        <div style="padding:14px 24px;background:#f8fafc;border-top:1px solid #e3e8ef">
          <a href="tel:${escapeHtml(enquiry.phone)}" style="display:inline-block;background:#102D4F;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px;font-weight:600">Call Now</a>
          <a href="https://wa.me/${escapeHtml(enquiry.phone.replace(/[^0-9]/g, ""))}" style="display:inline-block;margin-left:8px;background:#25D366;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px;font-weight:600">WhatsApp</a>
        </div>
      </div>
    </div>`;

  try {
    const response = await fetch(BREVO_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
        "api-key": apiKey
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: to.split(",").map((s) => s.trim()).filter(Boolean).map((email) => ({ email })),
        // Customer ka email nahi hota (sirf phone), isliye reply business inbox me jaata hai
        replyTo: { email: to.split(",")[0].trim(), name: senderName },
        subject: `New Enquiry — ${enquiry.name} (${enquiry.service || "General"})`,
        htmlContent: html,
        textContent: lines.join("\n")
      })
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("[enquiry] brevo failed:", response.status, body.slice(0, 300));
      return { sent: false, reason: "email_failed" };
    }

    const data = await response.json().catch(() => ({}));
    return { sent: true, id: data?.messageId || "" };
  } catch (error) {
    console.error("[enquiry] brevo error:", error?.message || error);
    return { sent: false, reason: "email_failed" };
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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

  const [brevoResult, sheetResult] = await Promise.all([
    sendEmailBrevo(enquiry),
    saveToSheet(enquiry)
  ]);

  // Brevo na ho to Resend try karo (dono me se koi bhi ek kaafi hai)
  const emailResult = brevoResult.sent ? brevoResult : await sendEmail(enquiry);

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
