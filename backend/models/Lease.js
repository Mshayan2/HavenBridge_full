import mongoose from "mongoose";

const leaseInstallmentSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ["deposit", "rent"], required: true },
    dueDate: { type: Date, required: true },
    amountMinor: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, lowercase: true, trim: true },
    status: { type: String, enum: ["due", "paid", "void"], default: "due" },
    paidAt: { type: Date },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
  },
  { timestamps: true }
);

const leaseSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true, index: true },
    landlord: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    status: {
      type: String,
      enum: ["pending", "active", "rejected", "cancelled", "ended"],
      default: "pending",
      index: true,
    },

    requestedAt: { type: Date, default: Date.now },

    // Requested/approved terms
    startDate: { type: Date },
    endDate: { type: Date },
    termMonths: { type: Number, min: 1 },

    monthlyRentMinor: { type: Number, required: true, min: 0 },
    depositMinor: { type: Number, min: 0 },
    currency: { type: String, required: true, lowercase: true, trim: true },

    message: { type: String },

    decision: {
      decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      decidedAt: { type: Date },
      reason: { type: String },
    },

    installments: [leaseInstallmentSchema],
  },
  { timestamps: true }
);

// Only one active lease per property at a time
leaseSchema.index(
  { property: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "active" }, name: "uniq_active_lease_per_property" }
);

leaseSchema.index({ tenant: 1, property: 1, createdAt: -1 });
leaseSchema.index({ landlord: 1, createdAt: -1 });

const Lease = mongoose.model("Lease", leaseSchema);
export default Lease;
