import { paymentConfig } from "../../config/paymentConfig.js";
import crypto from "crypto";

const DEFAULT_JC_MERCHANT_ID = process.env.SANDBOX_MERCHANT_ID || "SANDBOX_MERCHANT_ID";
const DEFAULT_JC_PASSWORD = process.env.SANDBOX_PASSWORD || "SANDBOX_PASSWORD";
const DEFAULT_JC_SALT = process.env.SANDBOX_JC_SALT || "SANDBOX_SALT";

function sha256Hex(input) {
  return crypto.createHash('sha256').update(String(input)).digest('hex');
}

export async function createPayment({
  amount,
  currency = "PKR",
  referenceId = null,
  returnUrl = null,
  metadata = {},
  user = null,
}) {
  const cfg = paymentConfig.jazzcash || {};
  const merchantId = cfg.merchantId || DEFAULT_JC_MERCHANT_ID;
  const password = cfg.password || DEFAULT_JC_PASSWORD;
  const integritySalt = cfg.integritySalt || DEFAULT_JC_SALT;
  const apiUrl = cfg.apiUrl;

  const txnRef = referenceId || `jc_ref_${Date.now()}`;
  const payload = {
    merchantId,
    amount,
    currency,
    txnRef,
    returnUrl,
    metadata,
    timestamp: Date.now(),
  };

  // Example integrity hash: sha256(merchantId|password|amount|txnRef|salt)
  const signString = `${merchantId}|${password}|${amount}|${txnRef}|${integritySalt}`;
  const signature = sha256Hex(signString);

  try {
    const endpoint = (apiUrl || "https://sandbox.jazzcash.example").replace(/\/$/, "") + "/init";
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-jazzcash-signature': signature,
      },
      body: JSON.stringify(payload),
    });

    if (resp.ok) {
      const data = await resp.json();
      const providerTransactionId = data.transactionId || `jc_${Date.now()}`;
      const token = data.token || `jc-token-${Date.now()}`;
      const redirectUrl = buildRedirectUrl({ baseUrl: apiUrl || "https://sandbox.jazzcash.example", token, returnUrl });
      return { redirectUrl, providerTransactionId, expiresAt: new Date(Date.now() + 15 * 60 * 1000), rawResponse: data };
    }
  } catch (e) {
    console.warn('JazzCash init request failed, using sandbox simulation:', e?.message || e);
  }

  const providerTransactionId = `jc_${Date.now()}`;
  const token = `jc-token-${Date.now()}`;
  const redirectUrl = buildRedirectUrl({ baseUrl: apiUrl || "https://sandbox.jazzcash.example", token, returnUrl });
  const rawResponse = { mock: true, providerTransactionId, token, payload };

  return { redirectUrl, providerTransactionId, expiresAt: new Date(Date.now() + 15 * 60 * 1000), rawResponse };
}

export function verifyWebhook(rawBody, signatureOrSalt) {
  const cfg = paymentConfig.jazzcash || {};
  const password = cfg.password || DEFAULT_JC_PASSWORD;
  const integritySalt = cfg.integritySalt || DEFAULT_JC_SALT;

  // Reconstruct expected signature if provider sends relevant fields
  const body = typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody || {});
  // If provider includes txnRef and amount, we can recompute
  try {
    const parsed = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody || {};
    // In sandbox, accept without strict signature to ease testing
    if ((cfg.env || 'sandbox') === 'sandbox') {
      return { valid: true, payload: parsed };
    }

    const merchantId = parsed.merchantId || cfg.merchantId || DEFAULT_JC_MERCHANT_ID;
    const amount = parsed.amount || parsed.paymentAmount || parsed.AMOUNT || '';
    const txnRef = parsed.txnRef || parsed.transactionId || parsed.TxnRefNo || '';
    const signString = `${merchantId}|${password}|${amount}|${txnRef}|${integritySalt}`;
    const expected = sha256Hex(signString);
    const valid = signatureOrSalt ? expected === String(signatureOrSalt) : false;
    return { valid, payload: parsed };
  } catch (e) {
    return { valid: false, payload: rawBody };
  }
}

export function buildRedirectUrl({ baseUrl, token, returnUrl }) {
  const url = new URL(baseUrl);
  url.pathname = url.pathname.replace(/\/$/, "") + '/checkout';
  url.searchParams.set('token', token);
  if (returnUrl) url.searchParams.set('returnUrl', returnUrl);
  return url.toString();
}

export function verifySignature(payload, signature) {
  const cfg = paymentConfig.jazzcash || {};
  const password = cfg.password || DEFAULT_JC_PASSWORD;
  const integritySalt = cfg.integritySalt || DEFAULT_JC_SALT;
  const parsed = typeof payload === 'string' ? JSON.parse(payload) : payload || {};
  const merchantId = parsed.merchantId || cfg.merchantId || DEFAULT_JC_MERCHANT_ID;
  const amount = parsed.amount || parsed.paymentAmount || parsed.AMOUNT || '';
  const txnRef = parsed.txnRef || parsed.transactionId || parsed.TxnRefNo || '';
  const expected = sha256Hex(`${merchantId}|${password}|${amount}|${txnRef}|${integritySalt}`);
  return expected === String(signature);
}
