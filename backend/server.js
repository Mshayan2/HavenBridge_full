import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

import helmet from "helmet";
import morgan from "morgan";
import { apiRateLimiter, buildCorsOptions } from "./middlewares/securityMiddleware.js";
import { errorHandler, notFound } from "./middlewares/errorMiddleware.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { stripeWebhook } from "./controllers/paymentController.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import newsRoutes from "./routes/newsRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import { startReservationExpiryJob } from "./jobs/reservationExpiryJob.js";
import savedSearchRoutes from "./routes/savedSearchRoutes.js";
import { startSavedSearchAlertsJob } from "./jobs/savedSearchAlertsJob.js";
import messageRoutes from "./routes/messageRoutes.js";
import leaseRoutes from "./routes/leaseRoutes.js";
import { autoSeedIfEmpty } from "./scripts/autoSeed.js";

dotenv.config();

const app = express();

// Debug: log all incoming requests (helps diagnose missing routes)
app.use((req, res, next) => {
  // eslint-disable-next-line no-console
  console.log(`[req] ${req.method} ${req.originalUrl}`);
  next();
});

function logEmailConfigStatus() {
  const nodeEnv = String(process.env.NODE_ENV || "").toLowerCase();
  const mailMode = String(process.env.MAIL_MODE || "").toLowerCase();
  const service = String(process.env.SMTP_SERVICE || "").trim();
  const host = String(process.env.SMTP_HOST || "").trim();
  const port = String(process.env.SMTP_PORT || "").trim();
  const from = String(process.env.SMTP_FROM || "").trim();

  const hasService = !!service;
  const hasHost = !!(host && port);
  const enabled = (hasService || hasHost) && mailMode !== "silent";

  if (!enabled) {
    console.warn(
      "[email] SMTP is NOT configured (or MAIL_MODE=silent). Verification/reset emails will NOT be delivered."
    );
    if (nodeEnv === "production") {
      console.warn(
        "[email] Configure SMTP_SERVICE (e.g. gmail) OR SMTP_HOST/SMTP_PORT plus SMTP_USER/SMTP_PASS in backend/.env"
      );
    }
    return;
  }

  console.log(
    `[email] delivery enabled via ${hasService ? `service=${service}` : `host=${host}:${port}`}${from ? `, from=${from}` : ""}`
  );
}

// For API responses we want fresh data (avoid 304 Not Modified issues in browsers)
app.disable("etag");

// -----------------------
// Connect to Database
// -----------------------
// Make startup deterministic: wait for DB connection attempts before listening.
// Wrap startup in an async IIFE to avoid relying on top-level await.
(async () => {
  await connectDB();

  // Auto-seed sample data if DB is empty (dev convenience)
  await autoSeedIfEmpty();

  logEmailConfigStatus();

  // Background job: auto-expire reservations
  startReservationExpiryJob({ intervalMs: 60_000 });

  // Background job: saved search alerts (in-app notifications)
  startSavedSearchAlertsJob({ intervalMs: 60_000 });

  // -----------------------
  // Start Server
  // -----------------------
  const PORT = process.env.PORT || 5000;
  const HOST = process.env.HOST || "0.0.0.0";
  app.listen(PORT, HOST, () => {
    console.log(`Server running on ${HOST}:${PORT} (press Ctrl+C to stop)`);
  });
})().catch((err) => {
  console.error("Fatal startup error:", err?.message || err);
  process.exit(1);
});

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files over HTTP
app.use(
  "/uploads",
  express.static(uploadsDir, {
    // Uploaded assets are content-addressed by filename (timestamp/random in multer),
    // so it's safe to cache them aggressively.
    maxAge: process.env.NODE_ENV === "production" ? "30d" : "1h",
    immutable: process.env.NODE_ENV === "production",
  })
);

// -----------------------
// Middleware
// -----------------------
app.use(helmet());

// Morgan logging: skip aborted/cancelled requests (those show "- - ms - -" which is noise)
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev", {
  skip: (req, res) => {
    // Skip preflight noise
    if (req.method === "OPTIONS") return true;
    // Skip logging for aborted requests (client closed connection before response)
    // These appear as "- - ms - -" and clutter the logs
    return req.aborted || res.writableEnded === false && req.socket?.destroyed;
  }
}));

app.use(cors(buildCorsOptions()));
app.use(apiRateLimiter);

// Prevent browser/proxy caching for API JSON endpoints
app.use("/api", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  next();
});

// Stripe webhook MUST receive the raw request body
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), stripeWebhook);

app.use(express.json()); // Parse JSON bodies

// Lightweight health check (no auth)
app.get("/api/health", (req, res) => {
  const dbState = mongoose.connection?.readyState;
  const dbStateLabel =
    dbState === 1 ? "connected" :
    dbState === 2 ? "connecting" :
    dbState === 0 ? "disconnected" :
    "unknown";

  res.status(200).json({
    ok: true,
    uptime: process.uptime(),
    db: { readyState: dbState ?? null, status: dbStateLabel },
  });
});

// -----------------------
// Routes
// -----------------------

// Test Routes
app.use("/api/test", testRoutes);

// Authentication Routes
app.use("/api/auth", authRoutes);

// Property Routes
app.use("/api/properties", propertyRoutes);

// Booking Routes
app.use("/api/bookings", bookingRoutes);

// Reservation Routes
app.use("/api/reservations", reservationRoutes);

// Favorites / Wishlist Routes
app.use("/api/favorites", favoriteRoutes);

// Saved Searches / Alerts
app.use("/api/saved-searches", savedSearchRoutes);

// User Routes (admin)
app.use("/api/users", userRoutes);

// Payments Routes
app.use("/api/payments", paymentRoutes);

// Notifications Routes
app.use("/api/notifications", notificationRoutes);

// News feed proxy (avoids CORS issues for frontend fetching external RSS)
app.use("/api/news", newsRoutes);

// Contact form endpoint
app.use("/api/contact", contactRoutes);

// Messaging Routes
app.use("/api/messages", messageRoutes);

// Lease / Rent Routes (Phase 6)
app.use("/api/leases", leaseRoutes);

// -----------------------
// Root Route
// -----------------------
app.get("/", (req, res) => {
  res.send("API is running...");
});

// -----------------------
// Error Handling (Optional)
// -----------------------
app.use(notFound);
app.use(errorHandler);


// (server starts after DB connect above)
