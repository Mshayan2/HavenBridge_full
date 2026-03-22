import mongoose from "mongoose";
import Lease from "../models/Lease.js";
import Property from "../models/Property.js";
import Payment from "../models/Payment.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

import { getStripe } from "../utils/stripe.js";

function getFrontendBaseUrl(req) {
  const envBase = process.env.FRONTEND_BASE_URL;
  const origin = req?.headers?.origin;
  if (origin && origin.startsWith("http")) return origin;
  return envBase || "http://localhost:5173";
}

function addMonths(d, months) {
  const dt = new Date(d);
  const day = dt.getDate();
  dt.setMonth(dt.getMonth() + months);
  // handle month rollover (e.g., Jan 31 -> Mar 2). Clamp back to last day of target month.
  if (dt.getDate() !== day) {
    dt.setDate(0);
  }
  return dt;
}

async function notifyUsers(userIds, payload) {
  const uniq = Array.from(new Set((userIds || []).filter(Boolean).map(String)));
  if (uniq.length === 0) return;
  await Notification.insertMany(uniq.map((id) => ({ user: id, ...payload })));
}

function getUserLabel(u) {
  if (!u) return "Someone";
  return u.name || u.email || "Someone";
}

function isRetryableMongoTxnError(err) {
  const labels = err?.errorLabels;
  if (Array.isArray(labels) && (labels.includes("TransientTransactionError") || labels.includes("UnknownTransactionCommitResult"))) {
    return true;
  }
  const msg = String(err?.message || "").toLowerCase();
  return (
    msg.includes("transienttransactionerror") ||
    msg.includes("unknowntransactioncommitresult") ||
    msg.includes("please retry your operation") ||
    msg.includes("catalog changes")
  );
}

export const requestLease = async (req, res) => {
  try {
    const { propertyId, startDate, termMonths, message } = req.body || {};

    if (!propertyId || !mongoose.isValidObjectId(propertyId)) {
      return res.status(400).json({ message: "propertyId is required" });
    }

    const property = await Property.findById(propertyId).populate("createdBy", "name email role");
    if (!property) return res.status(404).json({ message: "Property not found" });

    if (property.approval && property.approval.status && property.approval.status !== "approved") {
      return res.status(400).json({ message: "This property is not available for lease yet." });
    }

    if (String(property.status || "available") !== "available") {
      return res.status(400).json({ message: `Property is not available (status: ${property.status})` });
    }

    const rental = property.rental || {};
    if (!rental.enabled) {
      return res.status(400).json({ message: "This property is not enabled for rent/lease." });
    }

    const monthlyRentMinor = Number(rental.monthlyRentMinor ?? 0);
    if (!Number.isFinite(monthlyRentMinor) || monthlyRentMinor <= 0) {
      return res.status(400).json({ message: "This property has no valid monthly rent configured." });
    }

    const depositMinor = Number(rental.depositMinor ?? 0);
    if (!Number.isFinite(depositMinor) || depositMinor < 0) {
      return res.status(400).json({ message: "This property has an invalid deposit configured." });
    }

    const currency = String(rental.currency || "pkr").toLowerCase();

    const landlordId = property.createdBy?._id || property.createdBy;
    if (String(landlordId) === String(req.user._id)) {
      return res.status(400).json({ message: "You cannot request a lease on your own property." });
    }

    const minTerm = Number(rental.minTermMonths ?? 6);
    const term = Number(termMonths ?? minTerm);
    if (!Number.isFinite(term) || term < 1 || term > 120) {
      return res.status(400).json({ message: "termMonths must be between 1 and 120" });
    }
    if (Number.isFinite(minTerm) && term < minTerm) {
      return res.status(400).json({ message: `Minimum term is ${minTerm} month(s).` });
    }

    const start = startDate ? new Date(startDate) : new Date();
    if (Number.isNaN(start.getTime())) {
      return res.status(400).json({ message: "Invalid startDate" });
    }

    const existing = await Lease.findOne({
      property: property._id,
      tenant: req.user._id,
      status: { $in: ["pending", "active"] },
    }).lean();

    if (existing) {
      return res.status(409).json({ message: "You already have a pending/active lease request for this property." });
    }

    const lease = await Lease.create({
      property: property._id,
      landlord: landlordId,
      tenant: req.user._id,
      status: "pending",
      startDate: start,
      termMonths: Math.trunc(term),
      monthlyRentMinor: Math.trunc(monthlyRentMinor),
      depositMinor: Math.trunc(depositMinor),
      currency,
      message: message ? String(message).slice(0, 2000) : "",
      installments: [],
    });

    const admins = await User.find({ role: "admin" }).select("_id");
    await notifyUsers([landlordId, ...admins.map((a) => a._id)], {
      type: "lease_requested",
      title: "New lease request",
      message: `${getUserLabel(req.user)} requested a lease for "${property.title || "property"}".`,
      data: { property: property._id, lease: lease._id, meta: { tenant: req.user._id } },
    });

    return res.status(201).json(lease);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

export const listMyLeases = async (req, res) => {
  const leases = await Lease.find({ tenant: req.user._id })
    .sort({ createdAt: -1 })
    .populate("property")
    .populate("landlord", "name email role")
    .populate("tenant", "name email role");
  return res.status(200).json(leases);
};

export const listLandlordLeases = async (req, res) => {
  const leases = await Lease.find({ landlord: req.user._id })
    .sort({ createdAt: -1 })
    .populate("property")
    .populate("landlord", "name email role")
    .populate("tenant", "name email role");
  return res.status(200).json(leases);
};

export const getLeaseById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid lease id" });
  }

  const lease = await Lease.findById(id)
    .populate("property")
    .populate("landlord", "name email role")
    .populate("tenant", "name email role");

  if (!lease) return res.status(404).json({ message: "Lease not found" });

  const isParticipant =
    String(lease.tenant?._id || lease.tenant) === String(req.user._id) ||
    String(lease.landlord?._id || lease.landlord) === String(req.user._id) ||
    ["admin", "staff"].includes(String(req.user.role || "").toLowerCase());

  if (!isParticipant) {
    return res.status(403).json({ message: "Not authorized" });
  }

  return res.status(200).json(lease);
};

export const approveLease = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid lease id" });
  }

  // Retry a couple of times for transient MongoDB transaction/catalog-change errors.
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const lease = await Lease.findById(id).session(session);
      if (!lease) {
        await session.abortTransaction();
        return res.status(404).json({ message: "Lease not found" });
      }

      const isAdmin = ["admin", "staff"].includes(String(req.user.role || "").toLowerCase());
      const isLandlord = String(lease.landlord) === String(req.user._id);
      if (!isAdmin && !isLandlord) {
        await session.abortTransaction();
        return res.status(403).json({ message: "Not authorized" });
      }

      if (lease.status !== "pending") {
        await session.abortTransaction();
        return res.status(400).json({ message: `Cannot approve a lease in status '${lease.status}'.` });
      }

      const property = await Property.findById(lease.property).session(session);
      if (!property) {
        await session.abortTransaction();
        return res.status(400).json({ message: "Lease has no property" });
      }

      if (String(property.status || "available") !== "available") {
        await session.abortTransaction();
        return res.status(400).json({ message: `Property is not available (status: ${property.status})` });
      }

      const start = req.body?.startDate ? new Date(req.body.startDate) : lease.startDate || new Date();
      if (Number.isNaN(start.getTime())) {
        await session.abortTransaction();
        return res.status(400).json({ message: "Invalid startDate" });
      }

      const term = req.body?.termMonths != null ? Number(req.body.termMonths) : Number(lease.termMonths || 0);
      if (!Number.isFinite(term) || term < 1 || term > 120) {
        await session.abortTransaction();
        return res.status(400).json({ message: "termMonths must be between 1 and 120" });
      }

      const currency = String(lease.currency || property.rental?.currency || "pkr").toLowerCase();
      const monthlyRentMinor = Number(lease.monthlyRentMinor);
      const depositMinor = Number(lease.depositMinor ?? 0);

      const installments = [];
      if (Number.isFinite(depositMinor) && depositMinor > 0) {
        installments.push({
          kind: "deposit",
          dueDate: new Date(),
          amountMinor: Math.trunc(depositMinor),
          currency,
          status: "due",
        });
      }

      for (let i = 0; i < Math.trunc(term); i += 1) {
        installments.push({
          kind: "rent",
          dueDate: addMonths(start, i),
          amountMinor: Math.trunc(monthlyRentMinor),
          currency,
          status: "due",
        });
      }

      lease.status = "active";
      lease.startDate = start;
      lease.termMonths = Math.trunc(term);
      lease.endDate = addMonths(start, Math.trunc(term));
      lease.decision = {
        decidedBy: req.user._id,
        decidedAt: new Date(),
        reason: req.body?.reason ? String(req.body.reason).slice(0, 1000) : "",
      };
      lease.installments = installments;

      property.status = "rented";

      await property.save({ session });
      const updatedLease = await lease.save({ session });

      await session.commitTransaction();
      session.endSession();

      await notifyUsers([updatedLease.tenant], {
        type: "lease_approved",
        title: "Lease approved",
        message: `Your lease request for "${property.title || "property"}" was approved.`,
        data: { property: property._id, lease: updatedLease._id },
      });

      return res.status(200).json(updatedLease);
    } catch (e) {
      await session.abortTransaction();
      session.endSession();

      // Uniqueness errors (active lease per property)
      if (String(e?.code) === "11000") {
        return res.status(409).json({ message: "Another active lease already exists for this property." });
      }

      if (attempt < 3 && isRetryableMongoTxnError(e)) {
        // eslint-disable-next-line no-console
        console.warn(`[lease] approveLease transient error, retrying (attempt ${attempt}/3):`, e?.message || e);
        continue;
      }

      return res.status(500).json({ message: e.message });
    }
  }
};

export const rejectLease = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid lease id" });
    }

    const lease = await Lease.findById(id);
    if (!lease) return res.status(404).json({ message: "Lease not found" });

    const isAdmin = ["admin", "staff"].includes(String(req.user.role || "").toLowerCase());
    const isLandlord = String(lease.landlord) === String(req.user._id);
    if (!isAdmin && !isLandlord) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (lease.status !== "pending") {
      return res.status(400).json({ message: `Cannot reject a lease in status '${lease.status}'.` });
    }

    lease.status = "rejected";
    lease.decision = {
      decidedBy: req.user._id,
      decidedAt: new Date(),
      reason: req.body?.reason ? String(req.body.reason).slice(0, 1000) : "Rejected",
    };

    const updated = await lease.save();

    await notifyUsers([updated.tenant], {
      type: "lease_rejected",
      title: "Lease rejected",
      message: "Your lease request was rejected.",
      data: { lease: updated._id, property: updated.property, meta: { reason: updated.decision.reason } },
    });

    return res.status(200).json(updated);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

export const createLeaseCheckoutSession = async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    return res.status(500).json({
      message: "Stripe is not configured. Set STRIPE_SECRET_KEY in backend/.env (test mode is fine).",
    });
  }

  const { id } = req.params;
  const { installmentId } = req.body || {};

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid lease id" });
  }

  if (!installmentId) {
    return res.status(400).json({ message: "installmentId is required" });
  }

  const lease = await Lease.findById(id).populate({ path: "property", populate: { path: "createdBy", select: "email name role stripeAccountId" } });
  if (!lease) return res.status(404).json({ message: "Lease not found" });

  if (String(lease.tenant) !== String(req.user._id)) {
    return res.status(403).json({ message: "Not authorized for this lease" });
  }

  if (lease.status !== "active") {
    return res.status(400).json({ message: `Lease is not active (status: ${lease.status})` });
  }

  const installment = lease.installments?.id(installmentId);
  if (!installment) {
    return res.status(404).json({ message: "Installment not found" });
  }

  if (String(installment.status || "due") !== "due") {
    return res.status(400).json({ message: `Installment is not payable (status: ${installment.status})` });
  }

  const amount = Number(installment.amountMinor);
  const currency = String(installment.currency || lease.currency || "pkr").toLowerCase();
  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ message: "Invalid installment amount" });
  }

  // Avoid duplicate paid payments for same lease installment
  const existingPaid = await Payment.findOne({
    lease: lease._id,
    leaseInstallment: installment._id,
    status: { $in: ["paid", "released"] },
  }).lean();

  if (existingPaid) {
    return res.status(409).json({ message: "This installment is already paid." });
  }

  const purpose = installment.kind === "deposit" ? "lease_deposit" : "lease_rent";

  const payment = await Payment.create({
    purpose,
    lease: lease._id,
    leaseInstallment: installment._id,
    property: lease.property?._id || lease.property,
    customer: lease.tenant,
    seller: lease.landlord,
    amount: Math.trunc(amount),
    currency,
    provider: "stripe",
    status: "pending",
    events: [{ type: "created", message: "Lease checkout session requested", at: new Date() }],
  });

  const base = getFrontendBaseUrl(req);
  const successUrl = `${base}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${base}/payment/cancel?session_id={CHECKOUT_SESSION_ID}`;

  const propertyTitle = lease.property?.title || "Property";
  const productName = installment.kind === "deposit" ? "Lease deposit" : "Monthly rent";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: req.user.email,
    metadata: {
      paymentId: payment._id.toString(),
      leaseId: lease._id.toString(),
      installmentId: installment._id.toString(),
      purpose,
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency,
          unit_amount: Math.trunc(amount),
          product_data: {
            name: productName,
            description: `${productName} for: ${propertyTitle}`,
          },
        },
      },
    ],
  });

  payment.stripe = payment.stripe || {};
  payment.stripe.checkoutSessionId = session.id;
  payment.events = payment.events || [];
  payment.events.push({ type: "checkout_session_created", message: `Session ${session.id} created`, at: new Date() });
  await payment.save();

  return res.status(200).json({ url: session.url, paymentId: payment._id });
};
