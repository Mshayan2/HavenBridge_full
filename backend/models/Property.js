import mongoose from "mongoose";

const geoSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      // Do NOT default this; if we default type without coordinates,
      // Mongo geospatial queries can crash with "Can't extract geo keys".
      default: undefined,
    },
    coordinates: {
      type: [Number],
      default: undefined,
      validate: {
        validator: function (v) {
          if (v == null) return true;
          return Array.isArray(v) && v.length === 2 && v.every((n) => Number.isFinite(n));
        },
        message: "geo.coordinates must be [lng, lat]",
      },
    },
  },
  { _id: false }
);

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    area: { type: Number },
    location: { type: String, required: true },
    type: { type: String, enum: ["plot", "house", "villa", "apartment"], required: true },
    // Property availability status (reservation flow)
    // NOTE: Keep "booked" for backward compatibility with older records.
    status: { type: String, enum: ["available", "reserved", "booked", "sold", "rented"], default: "available" },
    currentReservation: { type: mongoose.Schema.Types.ObjectId, ref: "Reservation" },
    featured: { type: Boolean, default: false },
    bedrooms: { type: Number },
    bathrooms: { type: Number },
    features: [{ type: String }],
    images: [{ type: String }],
    documents: {
      titleDeed: { type: String },
      taxReceipt: { type: String },
      utilityBill: { type: String },
      idCard: { type: String }
    },
    // Admin approval workflow
    approval: {
      // NOTE: no default here. We set it explicitly in controllers.
      // This avoids older records (missing approval) being treated as pending.
      status: { type: String, enum: ["pending", "approved", "rejected"] },
      reason: { type: String },
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      reviewedAt: { type: Date }
    },

    // Reservation / payment policy (per property)
    // This controls whether Reserve is enabled, whether a token payment is required,
    // and what amount/currency should be used if payments are enabled.
    reservation: {
      enabled: { type: Boolean, default: true },
      tokenRequired: { type: Boolean, default: false },
      // Amount in minor units (Stripe expects minor units). Example: 500000 = PKR 5,000.00
      tokenAmountMinor: { type: Number },
      currency: { type: String, default: "pkr", lowercase: true, trim: true },
    },

    // Rental / lease policy (Phase 6)
    // If enabled, tenants can request a lease and pay rent installments.
    rental: {
      enabled: { type: Boolean, default: false },
      monthlyRentMinor: { type: Number, min: 0 },
      depositMinor: { type: Number, min: 0 },
      currency: { type: String, default: "pkr", lowercase: true, trim: true },
      minTermMonths: { type: Number, min: 1 },
    },

    // Optional location coordinates for map search.
    // Stored as GeoJSON Point: coordinates are [lng, lat].
    // Critical: keep geo undefined unless explicitly provided.
    // Otherwise nested defaults could create { type: 'Point' } with missing coordinates.
    geo: { type: geoSchema, default: undefined },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // ensure admin who creates is stored
  },
  { timestamps: true }
);

// Helpful indexes for typical query patterns
propertySchema.index({ "approval.status": 1, createdAt: -1 });
propertySchema.index({ "approval.status": 1, featured: 1, createdAt: -1 });
propertySchema.index({ price: 1 });
propertySchema.index({ type: 1 });
propertySchema.index({ location: 1 });
propertySchema.index({ status: 1, createdAt: -1 });
propertySchema.index({ currentReservation: 1 });

// Text search index for advanced filtering (Phase 2/3)
propertySchema.index(
  { title: "text", description: "text", location: "text", features: "text" },
  {
    weights: { title: 10, location: 5, description: 2, features: 1 },
    name: "property_text_search",
  }
);

// Geo index for map search (Phase 5)
// IMPORTANT: Use a partial index so documents without valid geo don't break $geoWithin/$near queries.
propertySchema.index(
  { geo: "2dsphere" },
  {
    name: "geo_2dsphere",
    partialFilterExpression: {
      "geo.type": "Point",
      "geo.coordinates": { $exists: true },
    },
  }
);

const Property = mongoose.model("Property", propertySchema);
export default Property;
