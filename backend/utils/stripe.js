import Stripe from "stripe";

let stripeSingleton = null;
let warnedMissingStripe = false;

function isPlaceholderKey(key) {
  if (!key) return true;
  const s = String(key).trim();
  // Common placeholder strings used in .env templates
  if (s.includes("REPLACE_ME") || s.includes("YOUR_REAL_KEY_HERE") || s.includes("YOUR_KEY_HERE")) return true;
  return false;
}

export function isStripeConfigured() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return false;
  if (isPlaceholderKey(key)) return false;
  // Basic sanity check: Stripe secret keys look like sk_test_... or sk_live_...
  return /^sk_(test|live)_[A-Za-z0-9]+$/.test(String(key).trim());
}

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || isPlaceholderKey(key) || !/^sk_(test|live)_[A-Za-z0-9]+$/.test(String(key).trim())) {
    // In dev, don't crash the whole server — return null and let callers
    // handle the missing Stripe configuration with a clear error response.
    const logMode = String(process.env.STRIPE_MISSING_LOG || "once").toLowerCase();
    const shouldLog = logMode !== "none" && (!warnedMissingStripe || logMode === "always");
    if (shouldLog) {
      console.warn(
        "Stripe is not configured. Set STRIPE_SECRET_KEY in backend/.env (test mode is fine)."
      );
      warnedMissingStripe = true;
    }
    return null;
  }

  if (!stripeSingleton) {
    stripeSingleton = new Stripe(String(key).trim());
  }

  return stripeSingleton;
}

export function getPaymentCurrency() {
  // Default to Pakistan currency for this project
  return (process.env.PAYMENT_CURRENCY || "pkr").toLowerCase();
}

export function getBookingTokenAmount() {
  const raw = process.env.BOOKING_TOKEN_AMOUNT;
  const amount = Number(raw || 0);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(
      "Invalid BOOKING_TOKEN_AMOUNT. Set it in backend/.env as an integer in the smallest currency unit (e.g. 500000 = PKR 5,000.00)."
    );
  }
  return Math.trunc(amount);
}

export function getPlatformFeeBps() {
  const raw = process.env.PLATFORM_FEE_BPS;
  const bps = Number(raw || 0);
  if (!Number.isFinite(bps) || bps < 0) return 0;
  return Math.trunc(bps);
}
