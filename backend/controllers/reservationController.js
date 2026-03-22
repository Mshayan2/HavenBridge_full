import mongoose from "mongoose";
import Property from "../models/Property.js";
import Reservation from "../models/Reservation.js";
import Payment from "../models/Payment.js";
import { getStripe, isStripeConfigured } from "../utils/stripe.js";

function getFrontendBaseUrl(req) {
  const envBase = process.env.FRONTEND_BASE_URL;
  const origin = req?.headers?.origin;
  if (origin && origin.startsWith("http")) return origin;
  return envBase || "http://localhost:5173";
}

function getReservationFeePercent() {
  const raw = process.env.RESERVATION_FEE_PERCENT;
  const n = raw == null || raw === "" ? 2 : Number(raw);
  if (!Number.isFinite(n) || n <= 0 || n > 100) return 2;
  return n;
}

function getReservationDurationHours() {
  const raw = process.env.RESERVATION_DURATION_HOURS;
  const n = raw == null || raw === "" ? 48 : Number(raw);
  if (!Number.isFinite(n) || n <= 0 || n > 24 * 30) return 48;
  return n;
}

function getFeePaymentWindowMinutes() {
  const raw = process.env.RESERVATION_FEE_WINDOW_MINUTES;
  const n = raw == null || raw === "" ? 30 : Number(raw);
  if (!Number.isFinite(n) || n <= 1 || n > 24 * 60) return 30;
  return n;
}

function toMinorUnitFromMajor(amountMajor, currency = "pkr") {
  // Stripe expects amounts in minor units.
  // In this project, property.price is stored in *major* units (e.g. PKR 1,000,000).
  // Convert major -> minor (PKR/USD: 2 decimals).
  const cur = String(currency || "pkr").toLowerCase();
  const n = Number(amountMajor);
  if (!Number.isFinite(n) || n < 0) return 0;

  // If you later add zero-decimal currencies, handle them here.
  const factor = 100;
  return Math.trunc(Math.round(n * factor));
}

async function getCheckoutUrlForSession(stripe, checkoutSessionId) {
  if (!checkoutSessionId) return null;
  try {
    const sess = await stripe.checkout.sessions.retrieve(checkoutSessionId);
    return sess?.url || null;
  } catch {
    return null;
  }
}

export const getReservationQuote = async (req, res) => {
  const { propertyId } = req.params;
  const property = await Property.findById(propertyId).select("price status reservation approval").lean();
  if (!property) return res.status(404).json({ message: "Property not found" });

  if (property?.approval?.status && property.approval.status !== "approved") {
    return res.status(400).json({ message: "Property is not approved for reservation" });
  }

  if (property?.reservation?.enabled === false) {
    return res.status(400).json({ message: "Reservations are disabled for this property" });
  }

  const feePercent = getReservationFeePercent();
  const currency = "pkr";
  const priceMajor = Math.trunc(Number(property.price || 0));
  const priceMinor = toMinorUnitFromMajor(priceMajor, currency);
  const feeMinor = Math.max(0, Math.trunc((priceMinor * feePercent) / 100));
  const remainingMinor = Math.max(0, priceMinor - feeMinor);

  const stripeConfigured = isStripeConfigured();

  return res.status(200).json({
    propertyId,
    propertyPriceMajor: priceMajor,
    propertyPrice: priceMinor,
    reservationFeePercent: feePercent,
    reservationFee: feeMinor,
    remainingAmount: remainingMinor,
    currency,
    durationHours: getReservationDurationHours(),
    feeWindowMinutes: getFeePaymentWindowMinutes(),
    propertyStatus: property.status,
    paymentsEnabled: stripeConfigured,
    provider: stripeConfigured ? "stripe" : "none",
    stripeConfigured,
  });
};

export const getMyReservationForProperty = async (req, res) => {
  const { propertyId } = req.params;
  const now = new Date();

  const r = await Reservation.findOne({
    property: propertyId,
    customer: req.user._id,
    status: { $in: ["pending_fee", "active"] },
  })
    .populate("property")
    .populate("feePayment")
    .populate("remainingPayment");

  if (!r) return res.status(200).json(null);

  // If reservation is logically expired but not yet swept, report as expired.
  const isPendingExpired = r.status === "pending_fee" && r.feeDueAt && r.feeDueAt < now;
  const isActiveExpired = r.status === "active" && r.reservationExpiry && r.reservationExpiry < now;
  if (isPendingExpired || isActiveExpired) {
    return res.status(200).json({ ...r.toObject(), status: "expired" });
  }

  return res.status(200).json(r);
};

export const listMyReservations = async (req, res) => {
  const list = await Reservation.find({ customer: req.user._id })
    .sort({ createdAt: -1 })
    .populate("property")
    .populate("feePayment")
    .populate("remainingPayment");

  res.status(200).json(list);
};

export const startReservation = async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    return res.status(503).json({
      code: "STRIPE_NOT_CONFIGURED",
      message: "Stripe is not configured. Set STRIPE_SECRET_KEY in backend/.env (test mode is fine).",
    });
  }

  const { propertyId } = req.params;
  const now = new Date();

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Only one active reservation per user
    const existingUser = await Reservation.findOne({
      customer: req.user._id,
      status: { $in: ["pending_fee", "active"] },
    }).session(session);
    if (existingUser) {
      await session.abortTransaction();
      return res.status(409).json({ message: "You already have an active reservation" });
    }

    const property = await Property.findById(propertyId).session(session);
    if (!property) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Property not found" });
    }

    if (property.approval?.status && property.approval.status !== "approved") {
      await session.abortTransaction();
      return res.status(400).json({ message: "Property is not approved for reservation" });
    }

    if (property.reservation?.enabled === false) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Reservations are disabled for this property" });
    }

    if (String(property.status) === "sold") {
      await session.abortTransaction();
      return res.status(409).json({ message: "Property is already sold" });
    }

    if (String(property.status) !== "available") {
      await session.abortTransaction();
      return res.status(409).json({ message: "Property is not available" });
    }

    const feePercent = getReservationFeePercent();
    const currency = "pkr";
    const priceMajor = Math.trunc(Number(property.price || 0));
    const priceMinor = toMinorUnitFromMajor(priceMajor, currency);
    const feeMinor = Math.max(0, Math.trunc((priceMinor * feePercent) / 100));
    const remainingMinor = Math.max(0, priceMinor - feeMinor);

    const feeDueAt = new Date(now.getTime() + getFeePaymentWindowMinutes() * 60 * 1000);

    const reservation = await Reservation.create(
      [
        {
          property: property._id,
          customer: req.user._id,
          propertyPriceMajor: priceMajor,
          propertyPrice: priceMinor,
          reservationFeePercent: feePercent,
          reservationFee: feeMinor,
          remainingAmount: remainingMinor,
          currency,
          status: "pending_fee",
          feeDueAt,
        },
      ],
      { session }
    );

    const created = reservation[0];

    // Lock property immediately to prevent race-condition double booking
    property.status = "reserved";
    property.currentReservation = created._id;
    await property.save({ session });

    const payment = await Payment.create(
      [
        {
          purpose: "reservation_fee",
          reservation: created._id,
          property: property._id,
          customer: req.user._id,
          seller: property.createdBy,
          amount: feeMinor,
          currency,
          provider: "stripe",
          status: "pending",
          events: [{ type: "created", message: "Reservation fee checkout requested", at: new Date() }],
        },
      ],
      { session }
    );

    const payDoc = payment[0];
    created.feePayment = payDoc._id;
    await created.save({ session });

    const base = getFrontendBaseUrl(req);
    const successUrl = `${base}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${base}/payment/cancel?session_id={CHECKOUT_SESSION_ID}`;

    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: req.user.email,
      metadata: {
        paymentId: payDoc._id.toString(),
        reservationId: created._id.toString(),
        purpose: "reservation_fee",
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: feeMinor,
            product_data: {
              name: "Reservation fee",
              description: property.title ? `Reservation fee for: ${property.title}` : "Reservation fee",
            },
          },
        },
      ],
    });

    payDoc.stripe = payDoc.stripe || {};
    payDoc.stripe.checkoutSessionId = checkout.id;
    await payDoc.save({ session });

    await session.commitTransaction();
    return res.status(200).json({ reservationId: created._id, paymentId: payDoc._id, url: checkout.url });
  } catch (err) {
    await session.abortTransaction();
    // Duplicate key errors from unique partial indexes -> conflict
    if (String(err?.code) === "11000") {
      return res.status(409).json({ message: "Reservation conflict (already reserved)" });
    }
    return res.status(500).json({ message: err?.message || "Failed to start reservation" });
  } finally {
    session.endSession();
  }
};

export const resumeReservationFeePayment = async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    return res.status(503).json({
      code: "STRIPE_NOT_CONFIGURED",
      message: "Stripe is not configured. Set STRIPE_SECRET_KEY in backend/.env (test mode is fine).",
    });
  }

  const { reservationId } = req.params;
  const now = new Date();

  const reservation = await Reservation.findById(reservationId).populate("property").populate("feePayment");
  if (!reservation) return res.status(404).json({ message: "Reservation not found" });
  if (String(reservation.customer) !== String(req.user._id)) {
    return res.status(403).json({ message: "Not authorized" });
  }

  if (reservation.status !== "pending_fee") {
    return res.status(400).json({ message: `Reservation must be pending fee (status: ${reservation.status})` });
  }

  if (reservation.feeDueAt && reservation.feeDueAt < now) {
    return res.status(409).json({ message: "Fee payment window has expired" });
  }

  const paymentId = reservation.feePayment?._id || reservation.feePayment;
  if (!paymentId) return res.status(400).json({ message: "Reservation has no fee payment" });
  const payment = await Payment.findById(paymentId);
  if (!payment) return res.status(400).json({ message: "Fee payment not found" });
  if (payment.status === "paid" || payment.status === "released") {
    return res.status(409).json({ message: "Reservation fee already paid" });
  }

  // Try to reuse existing checkout session
  const existingUrl = await getCheckoutUrlForSession(stripe, payment?.stripe?.checkoutSessionId);
  if (existingUrl) return res.status(200).json({ url: existingUrl, paymentId: payment._id });

  const property = reservation.property;
  const base = getFrontendBaseUrl(req);
  const successUrl = `${base}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${base}/payment/cancel?session_id={CHECKOUT_SESSION_ID}`;

  const currency = reservation.currency || "pkr";
  const amount = Math.trunc(Number(reservation.reservationFee || 0));
  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ message: "Invalid reservation fee" });
  }

  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: req.user.email,
    metadata: {
      paymentId: payment._id.toString(),
      reservationId: reservation._id.toString(),
      purpose: "reservation_fee",
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency,
          unit_amount: amount,
          product_data: {
            name: "Reservation fee",
            description: property?.title ? `Reservation fee for: ${property.title}` : "Reservation fee",
          },
        },
      },
    ],
  });

  payment.stripe = payment.stripe || {};
  payment.stripe.checkoutSessionId = checkout.id;
  payment.status = "pending";
  payment.events = payment.events || [];
  payment.events.push({ type: "checkout_session_created", message: `Session ${checkout.id} created`, at: new Date() });
  await payment.save();

  return res.status(200).json({ url: checkout.url, paymentId: payment._id });
};

export const payRemainingBalance = async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    return res.status(503).json({
      code: "STRIPE_NOT_CONFIGURED",
      message: "Stripe is not configured. Set STRIPE_SECRET_KEY in backend/.env (test mode is fine).",
    });
  }

  const { reservationId } = req.params;
  const now = new Date();

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const reservation = await Reservation.findById(reservationId).session(session);
    if (!reservation) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Reservation not found" });
    }

    if (String(reservation.customer) !== String(req.user._id)) {
      await session.abortTransaction();
      return res.status(403).json({ message: "Not authorized" });
    }

    if (reservation.status !== "active") {
      await session.abortTransaction();
      return res.status(400).json({ message: `Reservation must be active (status: ${reservation.status})` });
    }

    if (reservation.reservationExpiry && reservation.reservationExpiry < now) {
      await session.abortTransaction();
      return res.status(409).json({ message: "Reservation has expired" });
    }

    // Prevent duplicates / reuse existing pending checkout if available
    const existingAny = await Payment.findOne({
      purpose: "remaining_balance",
      reservation: reservation._id,
      status: { $in: ["pending", "paid", "released"] },
    }).session(session);
    if (existingAny) {
      if (existingAny.status === "paid" || existingAny.status === "released") {
        await session.abortTransaction();
        return res.status(409).json({ message: "Remaining balance already paid" });
      }

      // pending: try to reuse checkout url
      const url = await getCheckoutUrlForSession(stripe, existingAny?.stripe?.checkoutSessionId);
      await session.abortTransaction();
      if (url) return res.status(200).json({ url, paymentId: existingAny._id });
      // fall through: create a new session below
    }

    const property = await Property.findById(reservation.property).session(session);
    if (!property) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Reservation has no property" });
    }

    if (String(property.status) === "sold") {
      await session.abortTransaction();
      return res.status(409).json({ message: "Property already sold" });
    }

    const amount = Math.trunc(Number(reservation.remainingAmount || 0));
    if (!Number.isFinite(amount) || amount <= 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Invalid remaining amount" });
    }

    const currency = reservation.currency || "pkr";
    const pay = await Payment.create(
      [
        {
          purpose: "remaining_balance",
          reservation: reservation._id,
          property: property._id,
          customer: reservation.customer,
          seller: property.createdBy,
          amount,
          currency,
          provider: "stripe",
          status: "pending",
          events: [{ type: "created", message: "Remaining balance checkout requested", at: new Date() }],
        },
      ],
      { session }
    );

    const payDoc = pay[0];
    reservation.remainingPayment = payDoc._id;
    await reservation.save({ session });

    const base = getFrontendBaseUrl(req);
    const successUrl = `${base}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${base}/payment/cancel?session_id={CHECKOUT_SESSION_ID}`;

    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: req.user.email,
      metadata: {
        paymentId: payDoc._id.toString(),
        reservationId: reservation._id.toString(),
        purpose: "remaining_balance",
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: amount,
            product_data: {
              name: "Remaining balance",
              description: property.title ? `Remaining balance for: ${property.title}` : "Remaining balance",
            },
          },
        },
      ],
    });

    payDoc.stripe = payDoc.stripe || {};
    payDoc.stripe.checkoutSessionId = checkout.id;
    await payDoc.save({ session });

    await session.commitTransaction();
    return res.status(200).json({ url: checkout.url, paymentId: payDoc._id });
  } catch (err) {
    await session.abortTransaction();
    return res.status(500).json({ message: err?.message || "Failed to start remaining payment" });
  } finally {
    session.endSession();
  }
};
