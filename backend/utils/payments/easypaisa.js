import { paymentConfig } from "../../config/paymentConfig.js";
import crypto from "crypto";

const DEFAULT_SANDBOX_MERCHANT_ID = process.env.SANDBOX_MERCHANT_ID || "SANDBOX_MERCHANT_ID";
const DEFAULT_SANDBOX_API_KEY = process.env.SANDBOX_API_KEY || "SANDBOX_API_KEY";

function computeHmac(secret, data) {
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

export async function createPayment({
  amount,
  currency = "PKR",
  referenceId = null,
  returnUrl = null,
  metadata = {},
  user = null,
}) {
  const cfg = paymentConfig.easypaisa || {};
  const merchantId = cfg.merchantId || DEFAULT_SANDBOX_MERCHANT_ID;
  const apiKey = cfg.merchantKey || DEFAULT_SANDBOX_API_KEY;
  const apiUrl = cfg.apiUrl;

  const payload = {
    merchantId,
    amount,
    currency,
    referenceId: referenceId || `ep_ref_${Date.now()}`,
    returnUrl,
    metadata,
    timestamp: Date.now(),
  };

  const payloadString = JSON.stringify(payload);
  const signature = computeHmac(apiKey, payloadString);

  // Attempt real HTTP call to provider; on failure, fall back to sandbox simulation
  try {
    const endpoint = (apiUrl || "https://sandbox.easypaisa.example").replace(/\/$/, "") + "/init";
    const resp = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-easypaisa-signature": signature,
      },
      body: payloadString,
    });

    if (resp.ok) {
      const data = await resp.json();
      // Expecting { token, transactionId }
      const providerTransactionId = data.transactionId || `ep_${Date.now()}`;
      const token = data.token || `ep-token-${Date.now()}`;
      const redirectUrl = buildRedirectUrl({ baseUrl: apiUrl || "https://sandbox.easypaisa.example", token, returnUrl });
      return { redirectUrl, providerTransactionId, expiresAt: new Date(Date.now() + 15 * 60 * 1000), rawResponse: data };
    }
  } catch (e) {
    // network / provider not reachable — fall back to sandbox simulation
    console.warn('EasyPaisa init request failed, using sandbox simulation:', e?.message || e);
  }

  // Sandbox simulation
  const providerTransactionId = `ep_${Date.now()}`;
  const token = `ep-token-${Date.now()}`;
  const redirectUrl = buildRedirectUrl({ baseUrl: apiUrl || "https://sandbox.easypaisa.example", token, returnUrl });
  const rawResponse = { mock: true, providerTransactionId, token, payload };

  return { redirectUrl, providerTransactionId, expiresAt: new Date(Date.now() + 15 * 60 * 1000), rawResponse };
}

export function verifyWebhook(rawBody, signatureHeader) {
  const cfg = paymentConfig.easypaisa || {};
  const apiKey = cfg.callbackSecret || cfg.merchantKey || DEFAULT_SANDBOX_API_KEY;

  const bodyString = typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody || {});
  // In sandbox env, accept webhook without strict signature comparison to ease testing.
  if ((cfg.env || 'sandbox') === 'sandbox') {
    return { valid: true, payload: rawBody };
  }

  const expected = computeHmac(apiKey, bodyString);
  const valid = signatureHeader ? expected === String(signatureHeader) : false;
  return { valid, payload: rawBody };
}

export function buildRedirectUrl({ baseUrl, token, returnUrl }) {
  const url = new URL(baseUrl);
  url.pathname = url.pathname.replace(/\/$/, "") + "/checkout";
  url.searchParams.set("token", token);
  if (returnUrl) url.searchParams.set("returnUrl", returnUrl);
  return url.toString();
}

export function verifySignature(payload, signature) {
  const cfg = paymentConfig.easypaisa || {};
  const apiKey = cfg.callbackSecret || cfg.merchantKey || DEFAULT_SANDBOX_API_KEY;
  const bodyString = typeof payload === 'string' ? payload : JSON.stringify(payload || {});
  const expected = computeHmac(apiKey, bodyString);
  return expected === String(signature);
}
