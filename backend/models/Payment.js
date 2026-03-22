import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    purpose: {
      type: String,
      enum: ["booking_token", "reservation_fee", "remaining_balance", "lease_deposit", "lease_rent"],
      required: true,
    },

    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    reservation: { type: mongoose.Schema.Types.ObjectId, ref: "Reservation" },
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },

    lease: { type: mongoose.Schema.Types.ObjectId, ref: "Lease" },
    // Points to Lease.installments._id (subdocument id). Not a ref.
    leaseInstallment: { type: mongoose.Schema.Types.ObjectId },

    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Amount in the smallest currency unit (e.g. cents)
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, lowercase: true, trim: true },

    provider: { type: String, enum: ["stripe", "manual", "easypaisa", "jazzcash"], default: "stripe" },

    referenceId: { type: String },
    providerTransactionId: { type: String },
    providerReference: { type: String },
    redirectUrl: { type: String },
    expiresAt: { type: Date },
    returnUrl: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    webhookVerified: { type: Boolean, default: false },
    rawResponse: { type: mongoose.Schema.Types.Mixed, default: {} },
    failureReason: { type: String },

    status: {
      type: String,
      enum: ["created", "pending", "paid", "failed", "released", "cancelled", "refunded"],
      default: "created",
    },

    stripe: {
      checkoutSessionId: { type: String },
      paymentIntentId: { type: String },
      chargeId: { type: String },
      transferId: { type: String },
    },

    manual: {
      method: { type: String }, // e.g. RTGS/NEFT/Cash
      reference: { type: String },
      receivedAt: { type: Date },
    },

    release: {
      releasedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      releasedAt: { type: Date },
      notes: { type: String },
    },

    // Small audit trail (do not store full webhook payloads here)
    events: [
      {
        type: { type: String },
        at: { type: Date, default: Date.now },
        message: { type: String },
      },
    ],
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
