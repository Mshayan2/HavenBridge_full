import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    staff: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional, assigned by admin

    // Distinguish between a simple visit request vs a "reserve" intent (booking-token flow)
    bookingType: {
      type: String,
      enum: ["visit", "reserve"],
      default: "visit",
      index: true,
    },

    bookingDate: { type: Date, required: true },
    // Optional richer contact / scheduling information useful for frontend
    visitTime: { type: String }, // e.g. "14:00" or slot description
    contactPhone: { type: String },
    contactEmail: { type: String },
    guests: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected", "cancelled", "completed"],
      default: "pending",
    },

    // Seller lifecycle signals (used to inform the buyer)
    sellerViewedAt: { type: Date },
    sellerRespondedAt: { type: Date },

    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
