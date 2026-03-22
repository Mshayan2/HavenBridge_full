import Booking from "../models/Booking.js";
import Property from "../models/Property.js";
import Payment from "../models/Payment.js";
import LedgerEntry from "../models/LedgerEntry.js";
import Reservation from "../models/Reservation.js";
import Lease from "../models/Lease.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import mongoose from "mongoose";

async function notifyUsers(userIds, payload) {
  const uniq = Array.from(new Set((userIds || []).filter(Boolean).map(String)));
  if (uniq.length === 0) return;
  await Notification.insertMany(uniq.map((id) => ({ user: id, ...payload })));
}

import {
  getStripe,
  getBookingTokenAmount,
  getPaymentCurrency,
  getPlatformFeeBps,
} from "../utils/stripe.js";

import { easypaisa, jazzcash } from "../utils/payments/index.js";
import { paymentConfig } from "../config/paymentConfig.js";

import { getEffectiveReservationPolicy } from "../utils/reservationPolicy.js";

function getFrontendBaseUrl(req) {
  const envBase = process.env.FRONTEND_BASE_URL;
  const origin = req?.headers?.origin;

  // In production, set FRONTEND_BASE_URL explicitly.
  // In local dev, Vite may move ports (5173 -> 5174/5175). Prefer the request Origin if present.
  if (origin && origin.startsWith("http")) return origin;
  return envBase || "http://localhost:5173";
}

function safePushEvent(payment, type, message) {
  payment.events = payment.events || [];
  payment.events.push({ type, message, at: new Date() });
}

function getReservationDurationHours() {
  const raw = process.env.RESERVATION_DURATION_HOURS;
  const n = raw == null || raw === "" ? 48 : Number(raw);
  if (!Number.isFinite(n) || n <= 0 || n > 24 * 30) return 48;
  return n;
}

function isProviderEnabled(name) {
  const enabled = paymentConfig?.providersEnabled || [];
  return enabled.includes(name);
}

async function ensureStripeChargeLedgerEntry({ sessionId, payment, stripeSession }) {
  // Avoid creating duplicate ledger entries if Stripe retries webhooks.
  const existing = await LedgerEntry.findOne({ type: "stripe_charge", reference: sessionId }).lean();
  if (existing) return;

  await LedgerEntry.create({
    type: "stripe_charge",
    direction: "in",
    amount: stripeSession.amount_total ?? payment.amount,
    currency: (stripeSession.currency || payment.currency || "usd").toLowerCase(),
    payment: payment._id,
    booking: payment.booking,
    property: payment.property,
    reference: sessionId,
    notes: "Stripe checkout.session.completed",
  });
}

async function notifyPaymentPaid({ payment, message }) {
  const admins = await User.find({ role: "admin" }).select("_id");
  await notifyUsers([payment.customer, payment.seller, ...admins.map((a) => a._id)], {
    type: String(payment.purpose || "").startsWith("lease_") ? "rent_payment_paid" : "payment_paid",
    title: "Payment received",
    message,
    data: {
      payment: payment._id,
      booking: payment.booking,
      property: payment.property,
      lease: payment.lease,
      meta: {
        ...(payment.reservation ? { reservation: payment.reservation } : {}),
        ...(payment.lease ? { lease: payment.lease, installmentId: payment.leaseInstallment } : {}),
      },
    },
  });
}

async function applyLeaseSideEffectsForPaidPayment({ payment, stripeSession }) {
  const purpose = String(payment.purpose || "");
  if (purpose !== "lease_deposit" && purpose !== "lease_rent") return;

  const leaseId = payment.lease || stripeSession?.metadata?.leaseId;
  const installmentId = payment.leaseInstallment || stripeSession?.metadata?.installmentId;
  if (!leaseId || !installmentId) return;

  const now = new Date();
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const freshPayment = await Payment.findById(payment._id).session(session);
    if (!freshPayment) {
      await session.abortTransaction();
      return;
    }

    const lease = await Lease.findById(leaseId).session(session);
    if (!lease) {
      await session.abortTransaction();
      return;
    }

    const installment = lease.installments?.id(installmentId);
    if (!installment) {
      safePushEvent(freshPayment, "lease_state", "Installment not found for lease payment");
      await freshPayment.save({ session });
      await session.commitTransaction();
      return;
    }

    if (String(installment.status || "due") === "paid") {
      await session.commitTransaction();
      return;
    }

    installment.status = "paid";
    installment.paidAt = now;
    installment.payment = freshPayment._id;

    // Backfill linkage on payment if missing
    if (!freshPayment.lease) freshPayment.lease = lease._id;
    if (!freshPayment.leaseInstallment) freshPayment.leaseInstallment = installment._id;

    await lease.save({ session });
    safePushEvent(freshPayment, "lease_state", `Marked ${installment.kind} installment paid`);
    await freshPayment.save({ session });

    await session.commitTransaction();
  } catch (e) {
    await session.abortTransaction();
    console.error("Lease side-effects failed:", e?.message || e);
  } finally {
    session.endSession();
  }
}

async function applyReservationSideEffectsForPaidPayment({ payment, stripeSession }) {
  // Reservation-side effects must be atomic to keep property status consistent.
  const purpose = String(payment.purpose || "");
  if (purpose !== "reservation_fee" && purpose !== "remaining_balance") return;

  const reservationId = payment.reservation || stripeSession?.metadata?.reservationId;
  if (!reservationId) return;

  const now = new Date();
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const freshPayment = await Payment.findById(payment._id).session(session);
    if (!freshPayment) {
      await session.abortTransaction();
      return;
    }

    const reservation = await Reservation.findById(reservationId).session(session);
    if (!reservation) {
      await session.abortTransaction();
      return;
    }

    const property = await Property.findById(reservation.property).session(session);
    if (!property) {
      await session.abortTransaction();
      return;
    }

    // Enforce non-expired semantics in webhook too (extra safety)
    const activeExpired = reservation.status === "active" && reservation.reservationExpiry && reservation.reservationExpiry < now;
    const pendingExpired = reservation.status === "pending_fee" && reservation.feeDueAt && reservation.feeDueAt < now;
    if (activeExpired || pendingExpired) {
      // Reservation already expired. Do not revive it here.
      safePushEvent(freshPayment, "reservation_state", "Reservation already expired when payment completed");
      await freshPayment.save({ session });
      await session.commitTransaction();
      return;
    }

    if (purpose === "reservation_fee") {
      if (reservation.status === "completed") {
        await session.commitTransaction();
        return;
      }

      // If it's already active, do nothing (idempotent)
      if (reservation.status !== "active") {
        reservation.status = "active";
      }

      // Start the 48h window when fee is confirmed
      if (!reservation.reservationExpiry) {
        reservation.reservationExpiry = new Date(now.getTime() + getReservationDurationHours() * 60 * 60 * 1000);
      }

      // Keep property locked to this reservation
      property.status = "reserved";
      property.currentReservation = reservation._id;

      await property.save({ session });
      await reservation.save({ session });

      safePushEvent(freshPayment, "reservation_state", "Reservation activated after fee payment");
      await freshPayment.save({ session });
    }

    if (purpose === "remaining_balance") {
      // Idempotency: if already completed, do nothing
      if (reservation.status === "completed") {
        await session.commitTransaction();
        return;
      }

      // Only allow completion from active
      if (reservation.status !== "active") {
        safePushEvent(freshPayment, "reservation_state", `Cannot complete reservation from status '${reservation.status}'`);
        await freshPayment.save({ session });
        await session.commitTransaction();
        return;
      }

      reservation.status = "completed";
      reservation.completedAt = now;

      property.status = "sold";
      property.currentReservation = undefined;

      await property.save({ session });
      await reservation.save({ session });

      safePushEvent(freshPayment, "reservation_state", "Reservation completed and property marked sold");
      await freshPayment.save({ session });
    }

    await session.commitTransaction();
  } catch (e) {
    await session.abortTransaction();
    // Don't throw: webhook should still ACK to Stripe, but we want logs for debugging.
    console.error("Reservation side-effects failed:", e?.message || e);
  } finally {
    session.endSession();
  }
}

async function postPaymentHandler(payment, providerPayload) {
  // Create a ledger entry for incoming gateway funds
  try {
    await LedgerEntry.create({
      type: "gateway_incoming",
      direction: "in",
      amount: payment.amount,
      currency: payment.currency,
      payment: payment._id,
      booking: payment.booking,
      property: payment.property,
      reference: providerPayload?.transactionId || providerPayload?.providerTransactionId || providerPayload?.txnRef || undefined,
      notes: `Incoming ${payment.provider} payment`,
    });
  } catch (e) {
    console.error("Failed to create ledger entry for gateway payment:", e?.message || e);
  }

  // Apply business side-effects (reservation/lease) similarly to Stripe path
  try {
    await applyReservationSideEffectsForPaidPayment({ payment, stripeSession: {} });
  } catch (e) {
    console.error("Reservation side-effects failed (gateway):", e?.message || e);
  }

  try {
    await applyLeaseSideEffectsForPaidPayment({ payment, stripeSession: {} });
  } catch (e) {
    console.error("Lease side-effects failed (gateway):", e?.message || e);
  }

  // Send notifications similar to Stripe
  try {
    const purpose = String(payment.purpose || "");
    const message =
      purpose === "reservation_fee"
        ? "Reservation fee received. Your reservation is now active."
        : purpose === "remaining_balance"
        ? "Remaining balance received. The property is now marked as sold."
        : purpose === "lease_deposit"
        ? "Lease deposit payment received."
        : purpose === "lease_rent"
        ? "Rent payment received."
        : "A payment was received successfully.";

    await notifyPaymentPaid({ payment, message });
  } catch (e) {
    console.error("Notification on gateway payment failed:", e?.message || e);
  }

  return { payment, providerPayload };
}

export const createBookingTokenCheckoutSession = async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    return res.status(500).json({
      message:
        "Stripe is not configured. Set STRIPE_SECRET_KEY in backend/.env (test mode is fine).",
    });
  }

  const { bookingId } = req.body || {};
  if (!bookingId) {
    return res.status(400).json({ message: "bookingId is required" });
  }

  const booking = await Booking.findById(bookingId).populate({
    path: "property",
    populate: { path: "createdBy", select: "email name stripeAccountId" },
  });

  if (!booking) return res.status(404).json({ message: "Booking not found" });
  if (booking.customer.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized for this booking" });
  }

  // Booking token payments are only for reservation intent bookings
  if (booking.bookingType !== "reserve") {
    return res.status(400).json({ message: "Booking token payments are only available for reservations." });
  }

  // Prevent paying tokens for bookings that are no longer actionable
  if (["rejected", "cancelled", "completed"].includes(String(booking.status || "").toLowerCase())) {
    return res.status(400).json({ message: `Cannot pay booking token for a booking in status '${booking.status}'.` });
  }

  const property = booking.property;
  if (!property) return res.status(400).json({ message: "Booking has no property" });

  // Enforce per-property reservation/payment policy
  const policy = getEffectiveReservationPolicy(property);
  if (!policy.enabled) {
    return res.status(400).json({ message: "Reservations are disabled for this property." });
  }
  if (!policy.tokenRequired) {
    return res.status(400).json({ message: "This reservation does not require a token payment." });
  }

  const seller = property.createdBy;

  const amount = Number(policy.tokenAmountMinor) || 0;
  const currency = String(policy.currency || getPaymentCurrency() || "pkr").toLowerCase();
  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(500).json({ message: "Invalid booking token amount configuration." });
  }

  // If there's already a paid payment for this booking token, don't create duplicates.
  const existingPaid = await Payment.findOne({
    purpose: "booking_token",
    booking: booking._id,
    status: { $in: ["paid", "released"] },
  });

  if (existingPaid) {
    return res.status(409).json({ message: "Booking token already paid" });
  }

  const payment = await Payment.create({
    purpose: "booking_token",
    booking: booking._id,
    property: property._id,
    customer: booking.customer,
    seller: seller?._id,
    amount,
    currency,
    provider: "stripe",
    status: "pending",
    events: [{ type: "created", message: "Checkout session requested", at: new Date() }],
  });

  const base = getFrontendBaseUrl(req);
  const successUrl = `${base}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${base}/payment/cancel?session_id={CHECKOUT_SESSION_ID}`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: req.user.email,
    metadata: {
      paymentId: payment._id.toString(),
      bookingId: booking._id.toString(),
      purpose: "booking_token",
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency,
          unit_amount: amount,
          product_data: {
            name: "Booking token",
            description: property.title ? `Booking token for: ${property.title}` : "Booking token",
          },
        },
      },
    ],
  });

  payment.stripe = payment.stripe || {};
  payment.stripe.checkoutSessionId = session.id;
  safePushEvent(payment, "checkout_session_created", `Session ${session.id} created`);
  await payment.save();

  return res.status(200).json({ url: session.url, paymentId: payment._id });
};

export const stripeWebhook = async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    return res.status(500).json({
      message:
        "Stripe is not configured. Set STRIPE_SECRET_KEY in backend/.env (test mode is fine).",
    });
  }

  const signature = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || webhookSecret === "whsec_REPLACE_ME") {
    return res.status(500).json({ message: "Stripe webhook is not configured" });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const paymentId = session?.metadata?.paymentId;

        if (!paymentId) break;

        const payment = await Payment.findById(paymentId);
        if (!payment) break;

        const purpose = String(session?.metadata?.purpose || payment.purpose || "");

        // Idempotency: don't re-mark already paid/released
        if (payment.status !== "paid" && payment.status !== "released") {
          payment.status = "paid";
          payment.stripe = payment.stripe || {};
          payment.stripe.checkoutSessionId = session.id;
          if (session.payment_intent) payment.stripe.paymentIntentId = session.payment_intent;
          safePushEvent(payment, "paid", "Checkout session completed");
          await payment.save();
        }

        // Ledger: incoming funds to platform (idempotent)
        await ensureStripeChargeLedgerEntry({ sessionId: session.id, payment, stripeSession: session });

        // Purpose-specific side effects (reservation lifecycle)
        await applyReservationSideEffectsForPaidPayment({ payment, stripeSession: session });

        // Purpose-specific side effects (lease installments)
        await applyLeaseSideEffectsForPaidPayment({ payment, stripeSession: session });

        // Notifications
        const message =
          purpose === "reservation_fee"
            ? "Reservation fee received. Your reservation is now active."
            : purpose === "remaining_balance"
              ? "Remaining balance received. The property is now marked as sold."
              : purpose === "lease_deposit"
                ? "Lease deposit payment received."
                : purpose === "lease_rent"
                  ? "Rent payment received."
                  : "A booking token payment was received successfully.";
        await notifyPaymentPaid({ payment, message });

        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object;
        const paymentId = session?.metadata?.paymentId;
        if (!paymentId) break;
        const payment = await Payment.findById(paymentId);
        if (!payment) break;

        if (payment.status === "created" || payment.status === "pending") {
          payment.status = "cancelled";
          payment.stripe = payment.stripe || {};
          payment.stripe.checkoutSessionId = session.id;
          safePushEvent(payment, "cancelled", "Checkout session expired");
          await payment.save();
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object;
        const payment = await Payment.findOne({ "stripe.paymentIntentId": pi.id });
        if (payment && payment.status !== "paid" && payment.status !== "released") {
          payment.status = "failed";
          safePushEvent(payment, "failed", "Payment intent failed");
          await payment.save();
        }
        break;
      }

      default:
        break;
    }

    return res.json({ received: true });
  } catch (err) {
    console.error("Stripe webhook handler error:", err);
    return res.status(500).json({ message: "Webhook handler failed" });
  }
};

export const createEasyPaisaPayment = async (req, res) => {
  const { amount, currency = "PKR", referenceId = null, returnUrl = null, metadata = {} } = req.body || {};

  if (!isProviderEnabled("easypaisa")) {
    return res.status(503).json({ message: "EasyPaisa is not enabled" });
  }

  if (!amount || !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
    return res.status(400).json({ message: "amount must be a positive number" });
  }

  const payment = await Payment.create({
    purpose: "booking_token",
    amount: Math.trunc(Number(amount)),
    currency: String(currency || "PKR").toLowerCase(),
    provider: "easypaisa",
    status: "pending",
    referenceId,
    metadata,
    returnUrl,
    events: [{ type: "created", message: "EasyPaisa payment requested", at: new Date() }],
  });

  const { redirectUrl, providerTransactionId, expiresAt, rawResponse } = await easypaisa.createPayment({
    amount: payment.amount,
    currency: payment.currency,
    referenceId: referenceId || payment._id.toString(),
    returnUrl,
    metadata,
    user: req.user || null,
  });

  payment.providerTransactionId = providerTransactionId;
  payment.redirectUrl = redirectUrl;
  payment.expiresAt = expiresAt;
  payment.rawResponse = rawResponse;
  await payment.save();

  return res.status(200).json({ paymentId: payment._id, redirectUrl });
};

export const easypaisaWebhook = async (req, res) => {
  const signatureHeader = req.headers["x-easypaisa-signature"] || null;
  const { valid, payload } = easypaisa.verifyWebhook(req.body, signatureHeader);
  if (!valid) return res.status(400).send("invalid signature");

  const providerTransactionId = payload?.transactionId || payload?.providerTransactionId || payload?.txnRef;
  const payment = await Payment.findOne({ provider: "easypaisa", providerTransactionId });
  if (!payment) return res.status(404).send("payment not found");

  if (["paid", "failed", "refunded"].includes(payment.status) && payment.webhookVerified) {
    return res.status(200).send("already processed");
  }

  const statusRaw = String(payload?.status || "").toLowerCase();
  payment.status = statusRaw.includes("success") ? "paid" : "failed";
  payment.webhookVerified = true;
  payment.rawResponse = payload;
  await payment.save();

  await postPaymentHandler(payment, payload).catch(() => null);
  return res.status(200).send("ok");
};

export const easypaisaReturnHandler = async (req, res) => {
  // Optional: user-facing redirect handler (kept minimal in skeleton)
  return res.status(200).send("EasyPaisa return received. Please verify payment status.");
};

export const createJazzCashPayment = async (req, res) => {
  const { amount, currency = "PKR", referenceId = null, returnUrl = null, metadata = {} } = req.body || {};

  if (!isProviderEnabled("jazzcash")) {
    return res.status(503).json({ message: "JazzCash is not enabled" });
  }

  if (!amount || !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
    return res.status(400).json({ message: "amount must be a positive number" });
  }

  const payment = await Payment.create({
    purpose: "booking_token",
    amount: Math.trunc(Number(amount)),
    currency: String(currency || "PKR").toLowerCase(),
    provider: "jazzcash",
    status: "pending",
    referenceId,
    metadata,
    returnUrl,
    events: [{ type: "created", message: "JazzCash payment requested", at: new Date() }],
  });

  const { redirectUrl, providerTransactionId, expiresAt, rawResponse } = await jazzcash.createPayment({
    amount: payment.amount,
    currency: payment.currency,
    referenceId: referenceId || payment._id.toString(),
    returnUrl,
    metadata,
    user: req.user || null,
  });

  payment.providerTransactionId = providerTransactionId;
  payment.redirectUrl = redirectUrl;
  payment.expiresAt = expiresAt;
  payment.rawResponse = rawResponse;
  await payment.save();

  return res.status(200).json({ paymentId: payment._id, redirectUrl });
};

export const jazzcashWebhook = async (req, res) => {
  const signatureHeader = req.headers["x-jazzcash-signature"] || null;
  const { valid, payload } = jazzcash.verifyWebhook(req.body, signatureHeader);
  if (!valid) return res.status(400).send("invalid signature");

  const providerTransactionId = payload?.transactionId || payload?.providerTransactionId || payload?.TxnRefNo;
  const payment = await Payment.findOne({ provider: "jazzcash", providerTransactionId });
  if (!payment) return res.status(404).send("payment not found");

  if (["paid", "failed", "refunded"].includes(payment.status) && payment.webhookVerified) {
    return res.status(200).send("already processed");
  }

  payment.status = payload?.ResponseCode === "000" ? "paid" : "failed";
  payment.webhookVerified = true;
  payment.rawResponse = payload;
  await payment.save();

  await postPaymentHandler(payment, payload).catch(() => null);
  return res.status(200).send("ok");
};

export const jazzcashReturnHandler = async (req, res) => {
  return res.status(200).send("JazzCash return received. Please verify payment status.");
};

export const getPaymentStatus = async (req, res) => {
  const id = req.params?.id || req.query?.referenceId;
  if (!id) return res.status(400).json({ message: "id is required" });

  const payment = (await Payment.findById(id)) || (await Payment.findOne({ referenceId: id }));
  if (!payment) return res.status(404).json({ message: "Payment not found" });

  return res.status(200).json({
    id: payment._id,
    provider: payment.provider,
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
    redirectUrl: payment.redirectUrl,
    expiresAt: payment.expiresAt,
  });
};

export const adminListPayments = async (req, res) => {
  const payments = await Payment.find()
    .sort({ createdAt: -1 })
    .populate("booking")
    .populate("property")
    .populate("customer", "name email role")
    .populate("seller", "name email role stripeAccountId");

  res.status(200).json(payments);
};

export const adminReleasePaymentToSeller = async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    return res.status(500).json({
      message:
        "Stripe is not configured. Set STRIPE_SECRET_KEY in backend/.env (test mode is fine).",
    });
  }

  const { id } = req.params;
  const payment = await Payment.findById(id);
  if (!payment) return res.status(404).json({ message: "Payment not found" });

  if (payment.provider !== "stripe") {
    return res.status(400).json({ message: "Only Stripe payments can be released automatically" });
  }

  if (payment.status !== "paid") {
    return res
      .status(400)
      .json({ message: `Payment must be paid before release (status: ${payment.status})` });
  }

  if (!payment.seller) {
    return res.status(400).json({ message: "Payment has no seller attached" });
  }

  const seller = await User.findById(payment.seller);
  if (!seller?.stripeAccountId) {
    return res.status(400).json({ message: "Seller has not completed Stripe onboarding" });
  }

  const bps = getPlatformFeeBps();
  const fee = Math.round((payment.amount * bps) / 10000);
  const transferAmount = payment.amount - fee;

  if (transferAmount <= 0) {
    return res.status(400).json({ message: "Transfer amount must be greater than 0" });
  }

  const transfer = await stripe.transfers.create({
    amount: transferAmount,
    currency: payment.currency,
    destination: seller.stripeAccountId,
    metadata: {
      paymentId: payment._id.toString(),
      purpose: payment.purpose,
    },
  });

  payment.status = "released";
  payment.stripe = payment.stripe || {};
  payment.stripe.transferId = transfer.id;
  payment.release = payment.release || {};
  payment.release.releasedBy = req.user._id;
  payment.release.releasedAt = new Date();
  safePushEvent(payment, "released", `Transfer ${transfer.id} created`);
  await payment.save();

  await LedgerEntry.create({
    type: "stripe_transfer",
    direction: "out",
    amount: transferAmount,
    currency: payment.currency,
    payment: payment._id,
    booking: payment.booking,
    property: payment.property,
    reference: transfer.id,
    notes: fee > 0 ? `Transfer to seller (fee retained: ${fee})` : "Transfer to seller",
    createdBy: req.user._id,
  });

  await notifyUsers([payment.customer, payment.seller], {
    type: "payment_released",
    title: "Payment released",
    message: "An admin released the booking token payment to the seller.",
    data: { payment: payment._id, booking: payment.booking, property: payment.property },
  });

  res.status(200).json({ ok: true, payment, transferId: transfer.id, fee });
};

export const adminRecordManualIncoming = async (req, res) => {
  const { bookingId, amount, currency, method, reference, notes, markReleased } = req.body || {};

  if (!bookingId) return res.status(400).json({ message: "bookingId is required" });
  if (!amount || !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
    return res.status(400).json({ message: "amount must be a positive number" });
  }

  const booking = await Booking.findById(bookingId).populate({
    path: "property",
    populate: { path: "createdBy", select: "email name" },
  });

  if (!booking) return res.status(404).json({ message: "Booking not found" });

  const property = booking.property;
  const seller = property?.createdBy;

  const payment = await Payment.create({
    purpose: "booking_token",
    booking: booking._id,
    property: property?._id,
    customer: booking.customer,
    seller: seller?._id,
    amount: Math.trunc(Number(amount)),
    currency: (currency || getPaymentCurrency()).toLowerCase(),
    provider: "manual",
    status: markReleased ? "released" : "paid",
    manual: {
      method: method || "RTGS",
      reference,
      receivedAt: new Date(),
    },
    release: markReleased
      ? { releasedBy: req.user._id, releasedAt: new Date(), notes: notes || "" }
      : undefined,
    events: [
      {
        type: "manual_recorded",
        message: `Manual incoming recorded (${method || "RTGS"})`,
        at: new Date(),
      },
    ],
  });

  await LedgerEntry.create({
    type: "rtgs_incoming",
    direction: "in",
    amount: payment.amount,
    currency: payment.currency,
    payment: payment._id,
    booking: booking._id,
    property: property?._id,
    reference,
    notes: notes || "Manual incoming recorded",
    createdBy: req.user._id,
  });

  if (markReleased) {
    await LedgerEntry.create({
      type: "adjustment",
      direction: "out",
      amount: payment.amount,
      currency: payment.currency,
      payment: payment._id,
      booking: booking._id,
      property: property?._id,
      reference: reference || "manual",
      notes: "Marked released (manual payout/settlement assumed)",
      createdBy: req.user._id,
    });
  }

  const admins = await User.find({ role: "admin" }).select("_id");
  await notifyUsers(
    [payment.customer, payment.seller, ...admins.map((a) => a._id)],
    {
      type: "payment_paid",
      title: "Manual payment recorded",
      message: `Manual payment recorded (${payment.manual?.method || "manual"}).`,
      data: { payment: payment._id, booking: payment.booking, property: payment.property },
    }
  );

  if (markReleased) {
    await notifyUsers([payment.customer, payment.seller], {
      type: "payment_released",
      title: "Payment marked released",
      message: "Manual payment was marked as released to seller.",
      data: { payment: payment._id, booking: payment.booking, property: payment.property },
    });
  }

  res.status(201).json(payment);
};

export const adminListNonStripePayments = async (req, res) => {
  const payments = await Payment.find({ provider: { $ne: 'stripe' } })
    .sort({ createdAt: -1 })
    .populate('booking')
    .populate('property')
    .populate('customer', 'name email role')
    .populate('seller', 'name email role');

  res.status(200).json(payments);
};

export const adminReleaseNonStripePayment = async (req, res) => {
  const { id } = req.params;
  const payment = await Payment.findById(id);
  if (!payment) return res.status(404).json({ message: 'Payment not found' });

  if (payment.provider === 'stripe') {
    return res.status(400).json({ message: 'Use Stripe release endpoint for Stripe payments' });
  }

  if (payment.status !== 'paid') {
    return res.status(400).json({ message: `Payment must be paid before release (status: ${payment.status})` });
  }

  if (!payment.seller) {
    return res.status(400).json({ message: 'Payment has no seller attached' });
  }

  payment.status = 'released';
  payment.release = payment.release || {};
  payment.release.releasedBy = req.user._id;
  payment.release.releasedAt = new Date();
  safePushEvent(payment, 'released', 'Admin released non-Stripe payment');
  await payment.save();

  // Ledger entry for payout simulation
  await LedgerEntry.create({
    type: 'manual_transfer',
    direction: 'out',
    amount: payment.amount,
    currency: payment.currency,
    payment: payment._id,
    booking: payment.booking,
    property: payment.property,
    reference: `manual_release_${payment._id}`,
    notes: 'Admin released non-Stripe payment to seller',
    createdBy: req.user._id,
  });

  await notifyUsers([payment.customer, payment.seller], {
    type: 'payment_released',
    title: 'Payment released',
    message: 'An admin released the payment to the seller.',
    data: { payment: payment._id, booking: payment.booking, property: payment.property },
  });

  res.status(200).json({ ok: true, payment });
};

// Public status endpoint (no auth) to let the frontend know if Stripe is available
export const getPaymentsStatus = async (req, res) => {
  try {
    const stripe = getStripe();
    const webhookConfigured = !!process.env.STRIPE_WEBHOOK_SECRET && process.env.STRIPE_WEBHOOK_SECRET !== "whsec_REPLACE_ME";
    const stripeConfigured = Boolean(stripe);
    const currency = (process.env.PAYMENT_CURRENCY || "pkr").toLowerCase();
    let bookingTokenAmount = 0;
    try {
      bookingTokenAmount = getBookingTokenAmount();
    } catch (e) {
      bookingTokenAmount = 0;
    }

    return res.status(200).json({
      // Global payments availability (today: Stripe only). Keep as a separate flag
      // so we can add other providers (manual/local gateways) without changing the UI contract.
      paymentsEnabled: stripeConfigured,
      provider: stripeConfigured ? "stripe" : "none",
      stripeConfigured,
      webhookConfigured,
      currency,
      bookingTokenAmount,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const sellerCreateConnectOnboardingLink = async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    return res.status(500).json({
      message:
        "Stripe is not configured. Set STRIPE_SECRET_KEY in backend/.env (test mode is fine).",
    });
  }

  const refreshUrl = process.env.STRIPE_CONNECT_REFRESH_URL;
  const returnUrl = process.env.STRIPE_CONNECT_RETURN_URL;
  // Project is for Pakistan by default
  const country = process.env.STRIPE_DEFAULT_COUNTRY || "PK";

  if (!refreshUrl || !returnUrl) {
    return res
      .status(500)
      .json({ message: "Stripe Connect URLs are not configured (STRIPE_CONNECT_REFRESH_URL/RETURN_URL)" });
  }

  const user = await User.findById(req.user._id);
  if (!user) return res.status(401).json({ message: "User not found" });

  if (!user.stripeAccountId) {
    const acct = await stripe.accounts.create({
      type: "express",
      country,
      email: user.email,
      capabilities: {
        transfers: { requested: true },
      },
    });

    user.stripeAccountId = acct.id;
    user.stripeOnboardingComplete = false;
    user.stripeOnboardingUpdatedAt = new Date();
    await user.save();
  }

  const link = await stripe.accountLinks.create({
    account: user.stripeAccountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: "account_onboarding",
  });

  res.status(200).json({ url: link.url, accountId: user.stripeAccountId });
};

export const sellerGetConnectStatus = async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    return res.status(500).json({
      message:
        "Stripe is not configured. Set STRIPE_SECRET_KEY in backend/.env (test mode is fine).",
    });
  }

  const user = await User.findById(req.user._id);
  if (!user) return res.status(401).json({ message: "User not found" });

  if (!user.stripeAccountId) {
    return res.status(200).json({
      hasAccount: false,
      onboardingComplete: false,
    });
  }

  const acct = await stripe.accounts.retrieve(user.stripeAccountId);

  const onboardingComplete = Boolean(acct.details_submitted && acct.payouts_enabled);

  user.stripeOnboardingComplete = onboardingComplete;
  user.stripeOnboardingUpdatedAt = new Date();
  await user.save();

  res.status(200).json({
    hasAccount: true,
    accountId: user.stripeAccountId,
    onboardingComplete,
    payoutsEnabled: Boolean(acct.payouts_enabled),
    detailsSubmitted: Boolean(acct.details_submitted),
    chargesEnabled: Boolean(acct.charges_enabled),
  });
};
