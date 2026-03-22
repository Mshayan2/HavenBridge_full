import express from "express";
import {
  adminListPayments,
  adminRecordManualIncoming,
  adminReleasePaymentToSeller,
  createEasyPaisaPayment,
  createJazzCashPayment,
  createBookingTokenCheckoutSession,
  easypaisaReturnHandler,
  easypaisaWebhook,
  getPaymentStatus,
  getPaymentsStatus,
  jazzcashReturnHandler,
  jazzcashWebhook,
  adminListNonStripePayments,
  adminReleaseNonStripePayment,
  sellerCreateConnectOnboardingLink,
  sellerGetConnectStatus,
} from "../controllers/paymentController.js";

import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Customer: create Stripe Checkout session to pay the booking token
router.post("/booking-token/checkout-session", protect, createBookingTokenCheckoutSession);

// Customer: create EasyPaisa/JazzCash payment sessions
router.post("/easypaisa/create", protect, createEasyPaisaPayment);
router.post("/jazzcash/create", protect, createJazzCashPayment);

// Public: EasyPaisa/JazzCash webhooks
router.post("/easypaisa/webhook", easypaisaWebhook);
router.post("/jazzcash/webhook", jazzcashWebhook);

// Public: provider return handlers (optional)
router.get("/easypaisa/return", easypaisaReturnHandler);
router.get("/jazzcash/return", jazzcashReturnHandler);

// Public: payments status (stripe configured, currency, booking token amount)
router.get("/status", getPaymentsStatus);

// Public: payment status by id/reference
router.get("/:id/status", getPaymentStatus);

// Seller: Stripe Connect onboarding
router.get("/seller/connect/status", protect, sellerGetConnectStatus);
router.post("/seller/connect/onboard", protect, sellerCreateConnectOnboardingLink);

// Admin: payments management
router.get("/admin", protect, adminOnly, adminListPayments);
router.post("/admin/manual", protect, adminOnly, adminRecordManualIncoming);
router.post("/admin/release/:id", protect, adminOnly, adminReleasePaymentToSeller);
router.get('/admin/nonstripe', protect, adminOnly, adminListNonStripePayments);
router.post('/admin/release-nonstripe/:id', protect, adminOnly, adminReleaseNonStripePayment);

export default router;
