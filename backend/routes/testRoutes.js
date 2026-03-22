import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import { sendMail } from "../utils/mailer.js";

const router = express.Router();

// Public route
router.get("/public", (req, res) => {
  res.json({ message: "This is a public route" });
});

// Protected route (any logged-in user)
router.get("/protected", protect, (req, res) => {
  res.json({ message: `Hello ${req.user.name}, this is a protected route` });
});

// Admin-only route
router.get("/admin-only", protect, authorizeRoles("admin"), (req, res) => {
  res.json({ message: `Hello ${req.user.name}, you are an admin` });
});

// Staff & Admin route
router.get("/staff-admin", protect, authorizeRoles("admin", "staff"), (req, res) => {
  res.json({ message: `Hello ${req.user.name}, you are staff or admin` });
});

// Admin-only: send a test email to validate SMTP configuration
router.post("/send-email", protect, authorizeRoles("admin"), async (req, res, next) => {
  try {
    const to = String(req.body?.to || "").trim();
    if (!to) return res.status(400).json({ message: "to is required" });

    const result = await sendMail({
      to,
      subject: "HavenBridge SMTP test",
      text: `This is a test email from HavenBridge.\n\nTime: ${new Date().toISOString()}`,
      html: `<p>This is a test email from <b>HavenBridge</b>.</p><p>Time: <code>${new Date().toISOString()}</code></p>`,
    });

    return res.status(200).json({ ok: true, result });
  } catch (err) {
    next(err);
  }
});

export default router;
