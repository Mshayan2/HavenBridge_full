// backend/middlewares/securityMiddleware.js
import rateLimit from "express-rate-limit";

export function buildCorsOptions() {
  const raw = process.env.CORS_ORIGIN;
  if (!raw) {
    // Default: allow local dev; in production set CORS_ORIGIN explicitly.
    return { origin: true, credentials: true };
  }

  const allowlist = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    origin(origin, cb) {
      // allow same-origin / server-to-server / curl
      if (!origin) return cb(null, true);
      if (allowlist.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  };
}

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300, // per IP
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30, // login/register endpoints
  standardHeaders: true,
  legacyHeaders: false,
});
