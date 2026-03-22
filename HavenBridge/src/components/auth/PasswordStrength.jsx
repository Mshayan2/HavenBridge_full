import React, { useMemo } from "react";

function scorePassword(password, { email = "", phone = "" } = {}) {
  const p = String(password || "");
  if (!p) return { score: 0, label: "Empty" };

  const lower = p.toLowerCase();
  const hasLower = /[a-z]/.test(p);
  const hasUpper = /[A-Z]/.test(p);
  const hasDigit = /\d/.test(p);
  const hasSymbol = /[^A-Za-z0-9]/.test(p);

  const uniqueChars = new Set(p).size;
  const repeatsPenalty = uniqueChars < Math.max(6, Math.floor(p.length / 2));

  const emailPart = String(email || "").trim().toLowerCase();
  const phoneDigits = String(phone || "").replace(/\D/g, "");

  const containsEmail = emailPart && emailPart.length >= 4 && lower.includes(emailPart);
  const containsPhone = phoneDigits && phoneDigits.length >= 6 && lower.includes(phoneDigits);

  // Common weak patterns
  const common = ["password", "123456", "qwerty", "letmein", "admin", "welcome"];
  const containsCommon = common.some((w) => lower.includes(w));

  let score = 0;

  // Length
  if (p.length >= 12) score += 2;
  else if (p.length >= 10) score += 1;

  // Complexity
  score += hasLower ? 0.5 : 0;
  score += hasUpper ? 0.5 : 0;
  score += hasDigit ? 0.5 : 0;
  score += hasSymbol ? 0.5 : 0;

  // Bonuses
  if (p.length >= 16) score += 0.5;

  // Penalties
  if (containsCommon) score -= 2;
  if (containsEmail) score -= 2;
  if (containsPhone) score -= 1;
  if (repeatsPenalty) score -= 0.5;

  // Clamp to 0..4
  score = Math.max(0, Math.min(4, Math.round(score)));

  const labels = ["Very weak", "Weak", "Okay", "Strong", "Very strong"];
  return { score, label: labels[score] };
}

export default function PasswordStrength({ password, email, phone }) {
  const { score, label } = useMemo(() => scorePassword(password, { email, phone }), [password, email, phone]);

  const colors = ["bg-red-500", "bg-orange-500", "bg-amber-500", "bg-teal-600", "bg-green-600"];
  const width = ((score + 1) / 5) * 100;

  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-gray-700">Password strength</div>
        <div className="text-xs text-gray-600">{label}</div>
      </div>
      <div className="mt-2 h-2 w-full bg-gray-100 rounded">
        <div className={`h-2 rounded ${colors[score]}`} style={{ width: `${width}%` }} />
      </div>
      <ul className="mt-2 text-[11px] text-gray-600 list-disc pl-5 space-y-1">
        <li>Use 12+ characters (longer is better).</li>
        <li>Mix upper/lowercase, numbers, and symbols.</li>
        <li>Avoid using your email/phone or common words.</li>
      </ul>
    </div>
  );
}
