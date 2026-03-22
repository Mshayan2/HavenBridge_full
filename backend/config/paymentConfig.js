import dotenv from "dotenv";

dotenv.config();

const parseCsv = (value) =>
  String(value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export const paymentConfig = {
  providersEnabled: parseCsv(process.env.PAYMENT_PROVIDERS_ENABLED),

  easypaisa: {
    env: process.env.EASYPAYSA_ENV || "sandbox",
    apiUrl:
      process.env.EASYPAYSA_ENV === "production"
        ? process.env.EASYPAYSA_API_URL
        : process.env.EASYPAYSA_SANDBOX_API_URL || "https://sandbox.easypaisa.example",
    merchantId: process.env.EASYPAYSA_MERCHANT_ID || null,
    merchantKey: process.env.EASYPAYSA_MERCHANT_KEY || null,
    callbackSecret: process.env.EASYPAYSA_CALLBACK_SECRET || null,
  },

  jazzcash: {
    env: process.env.JAZZCASH_ENV || "sandbox",
    apiUrl:
      process.env.JAZZCASH_ENV === "production"
        ? process.env.JAZZCASH_API_URL
        : process.env.JAZZCASH_SANDBOX_API_URL || "https://sandbox.jazzcash.example",
    merchantId: process.env.JAZZCASH_MERCHANT_ID || null,
    password: process.env.JAZZCASH_PASSWORD || null,
    integritySalt: process.env.JAZZCASH_INTEGRITY_SALT || null,
  },
};
