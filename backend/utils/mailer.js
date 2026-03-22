import nodemailer from "nodemailer";

function hasSmtpConfig() {
  return !!(process.env.SMTP_HOST && process.env.SMTP_PORT);
}

function buildTransporter() {
  const service = String(process.env.SMTP_SERVICE || "").trim();

  // Service-based config (e.g., Gmail). Requires SMTP_USER/SMTP_PASS.
  if (service) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
    return nodemailer.createTransport({
      service,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  if (!hasSmtpConfig()) return null;

  const port = Number(process.env.SMTP_PORT);
  const secure = String(process.env.SMTP_SECURE || "").toLowerCase() === "true" || port === 465;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined,
  });
}

let cachedTransporter = null;

export async function sendMail({ to, subject, text, html }) {
  const mailMode = String(process.env.MAIL_MODE || "").toLowerCase();
  const isTest = String(process.env.NODE_ENV || "").toLowerCase() === "test";

  // In tests, never try to send or log noisy output.
  if (isTest || mailMode === "silent") {
    return { delivered: false, skipped: true };
  }

  if (!cachedTransporter) cachedTransporter = buildTransporter();

  const from = process.env.SMTP_FROM || "HavenBridge <no-reply@havenbridge.local>";

  if (!cachedTransporter) {
    // Dev fallback: log the email so you can copy/paste the link.
    // eslint-disable-next-line no-console
    console.log("\n--- Email (SMTP not configured) ---");
    // eslint-disable-next-line no-console
    console.log({ to, from, subject, text });
    // eslint-disable-next-line no-console
    console.log("--- End Email ---\n");
    // Try to extract a debug URL from the plain text or html (first match)
    const combined = `${text || ""}\n${html || ""}`;
    const urlMatch = combined.match(/https?:\/\/[^\s)"']+/i);
    const debugUrl = urlMatch ? urlMatch[0] : null;
    return { delivered: false, logged: true, debugUrl };
  }

  try {
    await cachedTransporter.sendMail({ from, to, subject, text, html });
    return { delivered: true };
  } catch (e) {
    // Do not crash auth flows in production due to email provider outages.
    // eslint-disable-next-line no-console
    console.error("Email delivery failed:", e?.message || e);

    const combined = `${text || ""}\n${html || ""}`;
    const urlMatch = combined.match(/https?:\/\/[^\s)"']+/i);
    const debugUrl = urlMatch ? urlMatch[0] : null;
    return { delivered: false, failed: true, debugUrl, error: e?.message || String(e) };
  }
}
