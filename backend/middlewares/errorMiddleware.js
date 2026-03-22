// backend/middlewares/errorMiddleware.js

// 404 handler
export function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Route not found: ${req.method} ${req.originalUrl}`));
}

// Global error handler
export function errorHandler(err, req, res, next) {
  const isUploadError = err?.name === "MulterError" || String(err?.message || "").toLowerCase().includes("unsupported file type");
  const statusCode =
    (res.statusCode && res.statusCode !== 200 ? res.statusCode : null) ||
    (isUploadError ? 400 : 500);

  // Avoid leaking stack traces in production
  const isProd = String(process.env.NODE_ENV || "").toLowerCase() === "production";

  const message = err?.message || "Server error";
  const payload = {
    message,
  };

  if (!isProd) {
    payload.stack = err?.stack;
  }

  // eslint-disable-next-line no-console
  console.error("🔥 Error:", err);

  res.status(statusCode).json(payload);
}
