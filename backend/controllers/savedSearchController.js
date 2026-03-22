import mongoose from "mongoose";
import SavedSearch from "../models/SavedSearch.js";
import Property from "../models/Property.js";
import Notification from "../models/Notification.js";

function sanitizeQuery(input) {
  // Allow only safe, expected keys used by /api/properties
  const allowed = new Set([
    "q",
    "searchMode",
    "location",
    "type",
    "types",
    "featured",
    "status",
    "features",
    "featuresMode",
    "minPrice",
    "maxPrice",
    "minArea",
    "maxArea",
    "bedrooms",
    "bathrooms",
    "minBedrooms",
    "maxBedrooms",
    "minBathrooms",
    "maxBathrooms",
    "sort",
    "bbox",
    "nearLat",
    "nearLng",
    "radiusKm",
  ]);

  const out = {};
  Object.entries(input || {}).forEach(([k, v]) => {
    if (!allowed.has(k)) return;
    if (v === undefined || v === null) return;
    const s = String(v).trim();
    if (s === "") return;
    out[k] = s;
  });
  return out;
}

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toStringArray(v) {
  if (v == null) return [];
  if (Array.isArray(v)) return v.map(String).map((s) => s.trim()).filter(Boolean);
  const s = String(v).trim();
  if (!s) return [];
  if (s.includes(",")) return s.split(",").map((x) => x.trim()).filter(Boolean);
  return [s];
}

function toNumberOrUndefined(v) {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  if (!Number.isFinite(n)) return undefined;
  return n;
}

function parseBbox(v) {
  if (!v) return null;
  const s = Array.isArray(v) ? String(v[0] || "") : String(v);
  const parts = s.split(",").map((x) => x.trim()).filter(Boolean);
  if (parts.length !== 4) return null;
  const nums = parts.map(Number);
  if (!nums.every((n) => Number.isFinite(n))) return null;
  const [minLng, minLat, maxLng, maxLat] = nums;
  return { minLng, minLat, maxLng, maxLat };
}

export function buildPublicPropertyFilterFromQuery(query) {
  // same approval logic as propertyController.getProperties
  const approvedFilter = {
    $or: [
      { "approval.status": "approved" },
      { approval: { $exists: false } },
      { "approval.status": { $exists: false } },
    ],
  };

  const {
    q,
    searchMode,
    location,
    type,
    types,
    featured,
    status,
    features,
    featuresMode,
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    bedrooms,
    bathrooms,
    minBedrooms,
    maxBedrooms,
    minBathrooms,
    maxBathrooms,
    bbox,
    nearLat,
    nearLng,
    radiusKm,
  } = query || {};

  const andFilters = [approvedFilter];

  const typeList = toStringArray(types ?? type);
  if (typeList.length === 1) andFilters.push({ type: typeList[0] });
  if (typeList.length > 1) andFilters.push({ type: { $in: typeList } });

  if (featured === "true" || featured === true) andFilters.push({ featured: true });

  if (location) {
    const rx = new RegExp(escapeRegex(location), "i");
    andFilters.push({ location: rx });
  }

  if (q) {
    const mode = String(searchMode || "regex").toLowerCase();
    const qq = String(q).trim();
    if (mode === "text") andFilters.push({ $text: { $search: qq } });
    else {
      const rx = new RegExp(escapeRegex(qq), "i");
      andFilters.push({ $or: [{ title: rx }, { description: rx }, { location: rx }, { features: rx }] });
    }
  }

  const statusList = toStringArray(status);
  if (statusList.length === 1) andFilters.push({ status: statusList[0] });
  if (statusList.length > 1) andFilters.push({ status: { $in: statusList } });

  const featureList = toStringArray(features);
  if (featureList.length > 0) {
    const mode = String(featuresMode || "any").toLowerCase();
    if (mode === "all") andFilters.push({ features: { $all: featureList } });
    else andFilters.push({ features: { $in: featureList } });
  }

  const priceFilter = {};
  if (minPrice !== undefined && minPrice !== "") priceFilter.$gte = Number(minPrice);
  if (maxPrice !== undefined && maxPrice !== "") priceFilter.$lte = Number(maxPrice);
  if (Object.keys(priceFilter).length) andFilters.push({ price: priceFilter });

  const areaFilter = {};
  if (minArea !== undefined && minArea !== "") areaFilter.$gte = Number(minArea);
  if (maxArea !== undefined && maxArea !== "") areaFilter.$lte = Number(maxArea);
  if (Object.keys(areaFilter).length) andFilters.push({ area: areaFilter });

  const bedMin = toNumberOrUndefined(minBedrooms ?? bedrooms);
  const bedMax = toNumberOrUndefined(maxBedrooms);
  if (bedMin !== undefined || bedMax !== undefined) {
    const f = {};
    if (bedMin !== undefined) f.$gte = bedMin;
    if (bedMax !== undefined) f.$lte = bedMax;
    andFilters.push({ bedrooms: f });
  }

  const bathMin = toNumberOrUndefined(minBathrooms ?? bathrooms);
  const bathMax = toNumberOrUndefined(maxBathrooms);
  if (bathMin !== undefined || bathMax !== undefined) {
    const f = {};
    if (bathMin !== undefined) f.$gte = bathMin;
    if (bathMax !== undefined) f.$lte = bathMax;
    andFilters.push({ bathrooms: f });
  }

  const parsedBbox = parseBbox(bbox);
  if (parsedBbox) {
    andFilters.push({
      geo: {
        $geoWithin: {
          $box: [
            [parsedBbox.minLng, parsedBbox.minLat],
            [parsedBbox.maxLng, parsedBbox.maxLat],
          ],
        },
      },
    });
  } else {
    const lat = toNumberOrUndefined(nearLat);
    const lng = toNumberOrUndefined(nearLng);
    const rKm = toNumberOrUndefined(radiusKm);
    if (lat !== undefined && lng !== undefined && rKm !== undefined && rKm > 0) {
      andFilters.push({
        geo: {
          $nearSphere: {
            $geometry: { type: "Point", coordinates: [lng, lat] },
            $maxDistance: Math.trunc(rKm * 1000),
          },
        },
      });
    }
  }

  return andFilters.length ? { $and: andFilters } : {};
}

function computeNextRunAt(now, frequency) {
  const f = String(frequency || "daily").toLowerCase();
  const base = new Date(now);
  if (f === "instant") return new Date(base.getTime() + 15 * 60 * 1000);
  if (f === "weekly") return new Date(base.getTime() + 7 * 24 * 60 * 60 * 1000);
  return new Date(base.getTime() + 24 * 60 * 60 * 1000);
}

function buildPropertiesUrlQuery(query) {
  const params = new URLSearchParams();
  Object.entries(query || {}).forEach(([k, v]) => {
    if (v === undefined || v === null || String(v).trim() === "") return;
    params.set(k, String(v));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const listMySavedSearches = async (req, res) => {
  const list = await SavedSearch.find({ user: req.user._id }).sort({ createdAt: -1 });
  return res.status(200).json(list);
};

export const createSavedSearch = async (req, res) => {
  const { name, query, frequency, active } = req.body || {};
  const nm = String(name || "").trim();
  if (!nm) return res.status(400).json({ message: "name is required" });

  const sanitized = sanitizeQuery(query);
  const freq = String(frequency || "daily").toLowerCase();
  if (!["instant", "daily", "weekly"].includes(freq)) {
    return res.status(400).json({ message: "frequency must be instant, daily, or weekly" });
  }

  const now = new Date();
  const doc = await SavedSearch.create({
    user: req.user._id,
    name: nm,
    query: sanitized,
    frequency: freq,
    active: active !== false,
    nextRunAt: computeNextRunAt(now, freq),
  });

  return res.status(201).json(doc);
};

export const updateSavedSearch = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });

  const doc = await SavedSearch.findOne({ _id: id, user: req.user._id });
  if (!doc) return res.status(404).json({ message: "Saved search not found" });

  const { name, query, frequency, active } = req.body || {};
  if (name !== undefined) {
    const nm = String(name || "").trim();
    if (!nm) return res.status(400).json({ message: "name cannot be empty" });
    doc.name = nm;
  }

  if (query !== undefined) {
    doc.query = sanitizeQuery(query);
  }

  if (frequency !== undefined) {
    const freq = String(frequency || "").toLowerCase();
    if (!["instant", "daily", "weekly"].includes(freq)) {
      return res.status(400).json({ message: "frequency must be instant, daily, or weekly" });
    }
    doc.frequency = freq;
    doc.nextRunAt = computeNextRunAt(new Date(), freq);
  }

  if (active !== undefined) {
    doc.active = Boolean(active);
    if (doc.active && !doc.nextRunAt) {
      doc.nextRunAt = computeNextRunAt(new Date(), doc.frequency);
    }
  }

  await doc.save();
  return res.status(200).json(doc);
};

export const deleteSavedSearch = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });

  const deleted = await SavedSearch.findOneAndDelete({ _id: id, user: req.user._id });
  if (!deleted) return res.status(404).json({ message: "Saved search not found" });

  return res.status(200).json({ ok: true });
};

export const runSavedSearchNow = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid id" });

  const doc = await SavedSearch.findOne({ _id: id, user: req.user._id });
  if (!doc) return res.status(404).json({ message: "Saved search not found" });

  const now = new Date();
  const since = doc.lastNotifiedAt || doc.createdAt || new Date(0);

  const filter = buildPublicPropertyFilterFromQuery(doc.query || {});
  const matches = await Property.find({
    $and: [filter, { createdAt: { $gt: since } }],
  })
    .select("_id title price location createdAt")
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  doc.lastRunAt = now;
  doc.lastNotifiedAt = now;
  doc.nextRunAt = computeNextRunAt(now, doc.frequency);
  await doc.save();

  // Create notification if there are matches
  if (matches.length > 0) {
    const urlQuery = buildPropertiesUrlQuery(doc.query);
    await Notification.create({
      user: doc.user,
      type: "saved_search_match",
      title: `Saved search: ${doc.name}`,
      message: `${matches.length} new property(ies) match your saved search.`,
      data: {
        meta: {
          savedSearchId: doc._id,
          count: matches.length,
          url: `/properties${urlQuery}`,
          sample: matches.slice(0, 3),
        },
      },
    });
  }

  return res.status(200).json({ ok: true, newMatches: matches.length, sample: matches.slice(0, 10) });
};

export function _internalForJobs() {
  return { computeNextRunAt, sanitizeQuery, buildPropertiesUrlQuery };
}
