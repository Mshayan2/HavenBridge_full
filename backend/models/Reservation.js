import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // propertyPriceMajor is the listing price in major units as stored on Property (e.g. PKR 1,000,000)
    // propertyPrice is the same price in minor units (e.g. PKR * 100) used for Stripe calculations
    propertyPriceMajor: { type: Number, min: 0 },
    propertyPrice: { type: Number, required: true, min: 0 },
    reservationFeePercent: { type: Number, required: true, min: 0, max: 100 },
    reservationFee: { type: Number, required: true, min: 0 },
    remainingAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, lowercase: true, trim: true },

    status: {
      type: String,
      enum: ["pending_fee", "active", "expired", "completed"],
      default: "pending_fee",
      index: true,
    },

    feeDueAt: { type: Date, required: true },
    reservationExpiry: { type: Date },
    expiredAt: { type: Date },
    completedAt: { type: Date },

    feePayment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    remainingPayment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
  },
  { timestamps: true }
);

// Prevent double booking (race-condition safe): only one pending/active reservation per property
reservationSchema.index(
  { property: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["pending_fee", "active"] } },
  }
);

// Allow only one active reservation per user (pending_fee or active)
reservationSchema.index(
  { customer: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["pending_fee", "active"] } },
  }
);

const Reservation = mongoose.model("Reservation", reservationSchema);
export default Reservation;
