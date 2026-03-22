import { getBookingTokenAmount, getPaymentCurrency, isStripeConfigured } from "./stripe.js";

function toBool(v, defaultValue) {
  if (v === undefined || v === null) return defaultValue;
  if (typeof v === "boolean") return v;
  const s = String(v).toLowerCase().trim();
  if (["true", "1", "yes", "y", "on"].includes(s)) return true;
  if (["false", "0", "no", "n", "off"].includes(s)) return false;
  return defaultValue;
}

function toInt(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

/**
 * Compute the effective reservation/payment policy for a property.
 *
 * Sources of truth:
 * 1) property.reservation.* (highest priority)
 * 2) env defaults
 * 3) app defaults (Pakistan)
 *
 * paymentsEnabled/provider is global today (Stripe), but kept separate so we can
 * add manual/local gateways later without changing the UI contract.
 */
export function getEffectiveReservationPolicy(property) {
  const propRes = (property && property.reservation) || {};

  const enabled = toBool(propRes.enabled, toBool(process.env.DEFAULT_RESERVATION_ENABLED, true));
  const tokenRequired = toBool(
    propRes.tokenRequired,
    toBool(process.env.DEFAULT_RESERVATION_TOKEN_REQUIRED, false)
  );

  // Currency: property override -> env -> stripe util default
  const currency = String(propRes.currency || process.env.PAYMENT_CURRENCY || getPaymentCurrency() || "pkr")
    .toLowerCase()
    .trim();

  // Token amount in minor units:
  // property override -> BOOKING_TOKEN_AMOUNT env -> 0
  let tokenAmountMinor = 0;
  if (tokenRequired) {
    const override = toInt(propRes.tokenAmountMinor);
    if (override !== null && override > 0) {
      tokenAmountMinor = override;
    } else {
      try {
        tokenAmountMinor = getBookingTokenAmount();
      } catch {
        tokenAmountMinor = 0;
      }
    }
  }

  // Do not initialize Stripe (or warn) just to compute UI policy.
  const stripeConfigured = isStripeConfigured();
  const paymentsEnabled = stripeConfigured;

  return {
    enabled,
    tokenRequired,
    tokenAmountMinor,
    currency,
    paymentsEnabled,
    provider: paymentsEnabled ? "stripe" : "none",
    stripeConfigured,
  };
}
