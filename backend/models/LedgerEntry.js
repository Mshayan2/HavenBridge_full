import mongoose from "mongoose";

const ledgerEntrySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["rtgs_incoming", "stripe_charge", "stripe_transfer", "adjustment", "gateway_incoming"],
      required: true,
    },

    direction: { type: String, enum: ["in", "out"], required: true },

    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, lowercase: true, trim: true },

    payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },

    reference: { type: String },
    notes: { type: String },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const LedgerEntry = mongoose.model("LedgerEntry", ledgerEntrySchema);
export default LedgerEntry;
