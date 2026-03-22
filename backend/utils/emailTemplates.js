function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buttonHtml(url, label) {
  const safeUrl = escapeHtml(url);
  const safeLabel = escapeHtml(label);
  return `
    <div style="margin: 24px 0;">
      <a href="${safeUrl}" target="_blank" rel="noreferrer"
         style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:600;">
        ${safeLabel}
      </a>
    </div>
  `;
}

function shell({ title, intro, ctaUrl, ctaLabel, outro, appName }) {
  const safeApp = escapeHtml(appName || "HavenBridge");
  return `
  <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; background:#f6f7fb; padding:24px;">
    <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
      <div style="background:#0f766e;color:#fff;padding:18px 22px;font-weight:700;letter-spacing:.2px;">
        ${safeApp}
      </div>
      <div style="padding:22px; color:#111827;">
        <h2 style="margin:0 0 10px 0; font-size:20px;">${escapeHtml(title)}</h2>
        <p style="margin:0 0 14px 0; color:#374151; line-height:1.5;">${escapeHtml(intro)}</p>
        ${ctaUrl ? buttonHtml(ctaUrl, ctaLabel) : ""}
        ${outro ? `<p style="margin:14px 0 0 0; color:#6b7280; line-height:1.5;">${escapeHtml(outro)}</p>` : ""}
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:18px 0;" />
        <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.5;">
          If you didn’t request this, you can safely ignore this email.
        </p>
      </div>
    </div>
  </div>
  `;
}

export function buildVerifyEmailEmail({ verifyUrl, appName = "HavenBridge" } = {}) {
  const subject = `${appName}: Verify your email`;
  const text = `Verify your email for ${appName}: ${verifyUrl}\n\nIf you didn't create an account, ignore this email.`;
  const html = shell({
    title: "Verify your email",
    intro: "Thanks for signing up. Please verify your email to activate your account.",
    ctaUrl: verifyUrl,
    ctaLabel: "Verify email",
    outro: "This link will expire soon for your security.",
    appName,
  });

  return { subject, text, html };
}

export function buildResetPasswordEmail({ resetUrl, appName = "HavenBridge" } = {}) {
  const subject = `${appName}: Reset your password`;
  const text = `Reset your password for ${appName}: ${resetUrl}\n\nIf you didn't request a reset, ignore this email.`;
  const html = shell({
    title: "Reset your password",
    intro: "We received a request to reset your password. If this was you, use the button below.",
    ctaUrl: resetUrl,
    ctaLabel: "Reset password",
    outro: "For your security, this link expires soon.",
    appName,
  });

  return { subject, text, html };
}
