import mongoose from "mongoose";

const savedSearchSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    name: { type: String, required: true, trim: true },

    // Query params for /api/properties as a flat object
    // Example: { q: "lahore", location: "dha", minPrice: "10000000", types: "house,villa" }
    query: { type: mongoose.Schema.Types.Mixed, default: {} },

    active: { type: Boolean, default: true },

    frequency: {
      type: String,
      enum: ["instant", "daily", "weekly"],
      default: "daily",
      index: true,
    },

    lastRunAt: { type: Date },
    lastNotifiedAt: { type: Date },
    nextRunAt: { type: Date, index: true },
  },
  { timestamps: true }
);

savedSearchSchema.index({ user: 1, createdAt: -1 });
savedSearchSchema.index({ user: 1, name: 1 }, { unique: true });

const SavedSearch = mongoose.model("SavedSearch", savedSearchSchema);
export default SavedSearch;
