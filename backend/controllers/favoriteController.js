import mongoose from "mongoose";
import Favorite from "../models/Favorite.js";
import Property from "../models/Property.js";

function isPubliclyVisibleProperty(p) {
  // Back-compat: if approval missing, treat as approved (same behavior as propertyController public endpoints)
  const status = p?.approval?.status;
  return !status || status === "approved";
}

// @desc    List current user's favorites (populated)
// @route   GET /api/favorites
// @access  Private
export const listMyFavorites = async (req, res) => {
  const { page, limit } = req.query;
  const p = Math.max(parseInt(page, 10) || 1, 1);
  const l = Math.min(Math.max(parseInt(limit, 10) || 24, 1), 100);
  const skip = (p - 1) * l;

  const projection = "title price images location bedrooms bathrooms area featured createdAt approval status";

  const [total, docs] = await Promise.all([
    Favorite.countDocuments({ user: req.user._id }),
    Favorite.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(l)
      .populate({ path: "property", select: projection })
      .lean(),
  ]);

  // Filter out properties that are not publicly visible anymore
  const items = (docs || []).filter((f) => f.property && isPubliclyVisibleProperty(f.property));

  res.status(200).json({ items, page: p, limit: l, total, pages: Math.max(Math.ceil(total / l), 1) });
};

// @desc    List current user's favorite property IDs (lightweight)
// @route   GET /api/favorites/ids
// @access  Private
export const listMyFavoriteIds = async (req, res) => {
  const docs = await Favorite.find({ user: req.user._id }).select("property").lean();
  const ids = (docs || []).map((d) => String(d.property)).filter(Boolean);
  res.status(200).json({ propertyIds: ids });
};

// @desc    Add a property to favorites
// @route   POST /api/favorites
// @access  Private
export const addFavorite = async (req, res) => {
  const { propertyId } = req.body || {};
  if (!propertyId || !mongoose.isValidObjectId(propertyId)) {
    return res.status(400).json({ message: "Valid propertyId is required" });
  }

  const property = await Property.findById(propertyId).select("approval").lean();
  if (!property || !isPubliclyVisibleProperty(property)) {
    return res.status(404).json({ message: "Property not found" });
  }

  try {
    const doc = await Favorite.create({ user: req.user._id, property: propertyId });
    return res.status(201).json({ _id: doc._id, user: doc.user, property: doc.property, createdAt: doc.createdAt });
  } catch (err) {
    // Duplicate favorite -> treat as success (idempotent)
    if (err?.code === 11000) {
      const existing = await Favorite.findOne({ user: req.user._id, property: propertyId }).lean();
      return res.status(200).json(existing);
    }
    return res.status(500).json({ message: err?.message || "Failed to add favorite" });
  }
};

// @desc    Remove a property from favorites
// @route   DELETE /api/favorites/property/:propertyId
// @access  Private
export const removeFavoriteByProperty = async (req, res) => {
  const { propertyId } = req.params;
  if (!propertyId || !mongoose.isValidObjectId(propertyId)) {
    return res.status(400).json({ message: "Valid propertyId is required" });
  }

  const out = await Favorite.deleteOne({ user: req.user._id, property: propertyId });
  // Idempotent: deleting non-existent favorite is still OK
  return res.status(200).json({ ok: true, deleted: out?.deletedCount || 0 });
};
