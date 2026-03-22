import Property from "../models/Property.js";
import User from "../models/User.js";
import path from 'path';
import Notification from "../models/Notification.js";
import { getEffectiveReservationPolicy } from "../utils/reservationPolicy.js";
import mongoose from "mongoose";

// Simple in-memory cache for public listing responses to reduce DB pressure
// Key: JSON string of query params; Value: { expiresAt: Date, payload: any }
const listingCache = new Map();

const LISTING_CACHE_ENABLED =
  String(process.env.ENABLE_LISTING_CACHE || "").toLowerCase() === "true" ||
  (String(process.env.NODE_ENV || "").toLowerCase() === "production" &&
    String(process.env.ENABLE_LISTING_CACHE || "").toLowerCase() !== "false");

function getCachedListing(key) {
  if (!LISTING_CACHE_ENABLED) return null;
  const rec = listingCache.get(key);
  if (!rec) return null;
  if (rec.expiresAt < Date.now()) {
    listingCache.delete(key);
    return null;
  }
  return rec.payload;
}

function setCachedListing(key, payload, ttlMs = 5000) {
  if (!LISTING_CACHE_ENABLED) return;
  listingCache.set(key, { expiresAt: Date.now() + ttlMs, payload });
}

function clearListingCache() {
  if (!LISTING_CACHE_ENABLED) return;
  listingCache.clear();
}

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toStringArray(v) {
  if (v == null) return [];
  if (Array.isArray(v)) return v.map(String).map((s) => s.trim()).filter(Boolean);
  const s = String(v).trim();
  if (!s) return [];
  // allow comma-separated values
  if (s.includes(",")) return s.split(",").map((x) => x.trim()).filter(Boolean);
  return [s];
}

function toNumberOrUndefined(v) {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  if (!Number.isFinite(n)) return undefined;
  return n;
}

function toMinorUnits(v) {
  const n = toNumberOrUndefined(v);
  if (n === undefined) return undefined;
  // Stripe-style minor units. For PKR this is paisa.
  return Math.round(n * 100);
}

function parseGeoFromBody(body) {
  const b = body || {};

  // Accept either { lat, lng } or { latitude, longitude } or { geo: { coordinates: [lng,lat] } }
  const latFromFields = toNumberOrUndefined(b.lat ?? b.latitude);
  const lngFromFields = toNumberOrUndefined(b.lng ?? b.lon ?? b.longitude);

  let lat = latFromFields;
  let lng = lngFromFields;

  if ((lat === undefined || lng === undefined) && b.geo && typeof b.geo === "object") {
    const coords = Array.isArray(b.geo.coordinates) ? b.geo.coordinates : undefined;
    if (Array.isArray(coords) && coords.length === 2) {
      const maybeLng = toNumberOrUndefined(coords[0]);
      const maybeLat = toNumberOrUndefined(coords[1]);
      if (maybeLat !== undefined && maybeLng !== undefined) {
        lng = lng ?? maybeLng;
        lat = lat ?? maybeLat;
      }
    }
  }

  const anyProvided =
    latFromFields !== undefined ||
    lngFromFields !== undefined ||
    (b.geo && typeof b.geo === "object" && Array.isArray(b.geo.coordinates));

  if (!anyProvided) return undefined;

  if (lat === undefined || lng === undefined) {
    throw new Error("Both lat and lng are required when providing coordinates");
  }

  if (lat < -90 || lat > 90) {
    throw new Error("lat must be between -90 and 90");
  }
  if (lng < -180 || lng > 180) {
    throw new Error("lng must be between -180 and 180");
  }

  return { type: "Point", coordinates: [lng, lat] };
}

function parseBbox(v) {
  // bbox=minLng,minLat,maxLng,maxLat
  if (!v) return null;
  const s = Array.isArray(v) ? String(v[0] || "") : String(v);
  const parts = s.split(",").map((x) => x.trim()).filter(Boolean);
  if (parts.length !== 4) return null;
  const nums = parts.map(Number);
  if (!nums.every((n) => Number.isFinite(n))) return null;
  const [minLng, minLat, maxLng, maxLat] = nums;
  return { minLng, minLat, maxLng, maxLat };
}

function normalizePropertyDoc(p) {
  const obj = p?.toObject ? p.toObject() : p;
  if (!obj) return obj;

  // Back-compat: older records may not have approval; treat them as approved in public responses.
  if (!obj.approval || !obj.approval.status) {
    obj.approval = { status: 'approved' };
  }

  if (Array.isArray(obj.images)) {
    obj.images = obj.images.map(img => {
      if (!img) return img;
      if (img.startsWith('http://') || img.startsWith('https://')) return img;
      if (img.startsWith('/uploads/')) return img;
      return "/uploads/" + img.split(/\\|\//).pop();
    });
  }
  if (obj.documents) {
    Object.keys(obj.documents).forEach(k => {
      const v = obj.documents[k];
      if (v && !v.startsWith('/uploads/')) obj.documents[k] = '/uploads/' + v.split(/\\|\//).pop();
    });
  }

  // Back-compat: ensure reservation policy object exists for older records.
  // (Defaults are Pakistan-focused; per-property overrides live in `reservation`.)
  if (!obj.reservation) {
    obj.reservation = { enabled: true, tokenRequired: false, currency: 'pkr' };
  } else {
    if (obj.reservation.enabled === undefined) obj.reservation.enabled = true;
    if (obj.reservation.tokenRequired === undefined) obj.reservation.tokenRequired = false;
    if (!obj.reservation.currency) obj.reservation.currency = 'pkr';
  }

  // Back-compat: ensure rental policy object exists for older records.
  if (!obj.rental) {
    obj.rental = { enabled: false, currency: 'pkr' };
  } else {
    if (obj.rental.enabled === undefined) obj.rental.enabled = false;
    if (!obj.rental.currency) obj.rental.currency = 'pkr';
  }

  return obj;
}

// @desc    Get effective reservation/payment policy for a property
// @route   GET /api/properties/:id/reservation-policy
// @access  Public
export const getReservationPolicy = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid property id" });
    }
    const property = await Property.findById(id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    // Public: only approved (or legacy missing approval treated as approved)
    if (property.approval && property.approval.status && property.approval.status !== 'approved') {
      return res.status(404).json({ message: "Property not found" });
    }

    const policy = getEffectiveReservationPolicy(property);
    return res.status(200).json({ propertyId: property._id, ...policy });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

async function notify(userId, payload) {
  if (!userId) return;
  await Notification.create({ user: userId, ...payload });
}

// @desc    Create a new property
// @route   POST /api/properties
// @access  Admin/Staff
export const createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      location,
      type,
      area,
      featured,
      bedrooms,
      bathrooms,
      features,
      listingType,
      rentalDeposit,
      rentalMinTermMonths,
      rentalCurrency,
    } = req.body;

    let geo;
    try {
      geo = parseGeoFromBody(req.body);
    } catch (e) {
      return res.status(400).json({ message: e.message || "Invalid coordinates" });
    }

    if (!title || !description || !price || !location || !type || !area) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const listingMode = String(listingType || "sale").toLowerCase().trim();
    const isRent = listingMode === "rent" || listingMode === "rental";
    const featuresNormalized = toStringArray(features);

    const property = await Property.create({
      title,
      description,
      price: toNumberOrUndefined(price) ?? price,
      area: toNumberOrUndefined(area) ?? area,
      location,
      type,
      featured: featured === true || featured === 'true',
      bedrooms: bedrooms ? Number(bedrooms) : undefined,
      bathrooms: bathrooms ? Number(bathrooms) : undefined,
      features: featuresNormalized.length ? featuresNormalized : undefined,
      rental: isRent
        ? {
            enabled: true,
            monthlyRentMinor: toMinorUnits(price),
            depositMinor: toMinorUnits(rentalDeposit),
            currency: String(rentalCurrency || 'pkr').toLowerCase().trim() || 'pkr',
            minTermMonths: toNumberOrUndefined(rentalMinTermMonths) ?? 6,
          }
        : { enabled: false, currency: 'pkr' },
      geo,
      createdBy: req.user._id,
      // Admin/staff-created listings are assumed approved immediately
      approval: { status: 'approved', reviewedBy: req.user._id, reviewedAt: new Date() },
    });

    res.status(201).json(property);
    // Clear listing cache so new property appears promptly
    clearListingCache();
  } catch (error) {
      console.error("approveProperty error:", error);
      const msg = error?.message || "Failed to approve property";
      const isNetworkErr = String(msg).toLowerCase().includes("timed out") || String(error?.name).toLowerCase().includes("mongonetworkerror") || String(error?.name).toLowerCase().includes("networkerror");
      if (isNetworkErr) {
        return res.status(503).json({ message: "Database temporarily unavailable. Please try again shortly." });
      }
      res.status(500).json({ message: msg });
  }
};

// @desc    Submit a property (customer-facing) -> creates listing with 'pending' status
// @route   POST /api/properties/submit
// @access  Authenticated users (customers)
export const submitProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      location,
      type,
      area,
      bedrooms,
      bathrooms,
      features,
      listingType,
      rentalDeposit,
      rentalMinTermMonths,
      rentalCurrency,
    } = req.body;

    let geo;
    try {
      geo = parseGeoFromBody(req.body);
    } catch (e) {
      return res.status(400).json({ message: e.message || "Invalid coordinates" });
    }

    if (!title || !description || !price || !location || !type) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    // Some deployments want customer-submitted properties to appear immediately.
    // Control via env var REQUIRE_PROPERTY_APPROVAL (default: false)
    const requireApproval = String(process.env.REQUIRE_PROPERTY_APPROVAL || 'false').toLowerCase() === 'true';

    const listingMode = String(listingType || "sale").toLowerCase().trim();
    const isRent = listingMode === "rent" || listingMode === "rental";
    const featuresNormalized = toStringArray(features);

    const propertyData = {
      title,
      description,
      price: toNumberOrUndefined(price) ?? price,
      area: toNumberOrUndefined(area) ?? area,
      location,
      type,
      geo,
      createdBy: req.user._id,
      status: 'available',
      approval: requireApproval ? { status: 'pending' } : { status: 'approved', reviewedBy: req.user._id, reviewedAt: new Date() },
      bedrooms: toNumberOrUndefined(bedrooms),
      bathrooms: toNumberOrUndefined(bathrooms),
      features: featuresNormalized.length ? featuresNormalized : undefined,
      rental: isRent
        ? {
            enabled: true,
            monthlyRentMinor: toMinorUnits(price),
            depositMinor: toMinorUnits(rentalDeposit),
            currency: String(rentalCurrency || 'pkr').toLowerCase().trim() || 'pkr',
            minTermMonths: toNumberOrUndefined(rentalMinTermMonths) ?? 6,
          }
        : { enabled: false, currency: 'pkr' },
    };

    // Handle uploaded files (multer stores them on disk and exposes req.files)
    if (req.files) {
      // photos[] -> store web-safe paths like /uploads/filename
      if (req.files.photos) {
        propertyData.images = req.files.photos.map(f => "/uploads/" + (f.filename || path.basename(f.path)));
      }
      propertyData.documents = {};
      if (req.files.titleDeed && req.files.titleDeed[0]) propertyData.documents.titleDeed = "/uploads/" + (req.files.titleDeed[0].filename || path.basename(req.files.titleDeed[0].path));
      if (req.files.taxReceipt && req.files.taxReceipt[0]) propertyData.documents.taxReceipt = "/uploads/" + (req.files.taxReceipt[0].filename || path.basename(req.files.taxReceipt[0].path));
      if (req.files.utilityBill && req.files.utilityBill[0]) propertyData.documents.utilityBill = "/uploads/" + (req.files.utilityBill[0].filename || path.basename(req.files.utilityBill[0].path));
      if (req.files.idCard && req.files.idCard[0]) propertyData.documents.idCard = "/uploads/" + (req.files.idCard[0].filename || path.basename(req.files.idCard[0].path));
    }

    const property = await Property.create(propertyData);

    // If files were uploaded via multipart/form-data they should be handled here (multer not wired yet).
    res.status(201).json(property);
    // Clear listing cache so new property appears promptly if it is approved
    clearListingCache();
  } catch (error) {
      console.error("rejectProperty error:", error);
      const msg = error?.message || "Failed to reject property";
      const isNetworkErr = String(msg).toLowerCase().includes("timed out") || String(error?.name).toLowerCase().includes("mongonetworkerror") || String(error?.name).toLowerCase().includes("networkerror");
      if (isNetworkErr) {
        return res.status(503).json({ message: "Database temporarily unavailable. Please try again shortly." });
      }
      res.status(500).json({ message: msg });
  }
};

  // @desc    Get all properties for admins (including pending/rejected)
  // @route   GET /api/properties/admin
  // @access  Admin/Staff
  export const getAllProperties = async (req, res) => {
    try {
      const properties = await Property.find().populate("createdBy", "name email role");
        const normalized = properties.map(normalizePropertyDoc);
      res.status(200).json(normalized);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // @desc    Get pending properties (admin)
  // @route   GET /api/properties/admin/pending
  // @access  Admin/Staff
  export const getPendingProperties = async (req, res) => {
    try {
      const properties = await Property.find({ 'approval.status': 'pending' }).populate("createdBy", "name email role");
      res.status(200).json(properties);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // @desc    Approve a property
  // @route   PUT /api/properties/admin/:id/approve
  // @access  Admin/Staff
  export const approveProperty = async (req, res) => {
    try {
      const property = await Property.findById(req.params.id);
      if (!property) return res.status(404).json({ message: "Property not found" });
      property.approval = property.approval || {};
      property.approval.status = 'approved';
      property.approval.reason = req.body.reason || '';
      property.approval.reviewedBy = req.user._id;
      property.approval.reviewedAt = new Date();
        // Clean up malformed geo documents (some legacy records may have geo.type without coordinates)
        try {
          if (property.geo && (!Array.isArray(property.geo.coordinates) || property.geo.coordinates.length !== 2)) {
            // Remove geo entirely when coordinates are missing
            property.geo = undefined;
          }
        } catch (e) {
          // ignore and proceed to save
          console.warn('geo cleanup failed:', e?.message || e);
        }

        const updated = await property.save();

      // Fire-and-forget notification so notification delivery failures don't break the admin flow
      (async () => {
        try {
          await notify(property.createdBy, {
            type: "property_approved",
            title: "Your property was approved",
            message: `Your listing "${property.title || "property"}" is now live.`,
            data: { property: property._id },
          });
        } catch (err) {
          console.error("Failed to create approval notification:", err?.message || err);
        }
      })();

      res.status(200).json(updated);
      // Invalidate listing cache so approval changes reflect
      clearListingCache();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // @desc    Reject a property
  // @route   PUT /api/properties/admin/:id/reject
  // @access  Admin/Staff
  export const rejectProperty = async (req, res) => {
    try {
      const property = await Property.findById(req.params.id);
      if (!property) return res.status(404).json({ message: "Property not found" });
      property.approval = property.approval || {};
      property.approval.status = 'rejected';
      property.approval.reason = req.body.reason || 'Rejected by admin';
      property.approval.reviewedBy = req.user._id;
      property.approval.reviewedAt = new Date();
        // Clean up malformed geo if present to avoid validation errors on save
        try {
          if (property.geo && (!Array.isArray(property.geo.coordinates) || property.geo.coordinates.length !== 2)) {
            property.geo = undefined;
          }
        } catch (e) {
          console.warn('geo cleanup failed:', e?.message || e);
        }

        const updated = await property.save();

      // Fire-and-forget notification; don't block on notification errors
      (async () => {
        try {
          await notify(property.createdBy, {
            type: "property_rejected",
            title: "Your property was rejected",
            message: property.approval.reason || "Your listing was rejected by admin.",
            data: { property: property._id, meta: { reason: property.approval.reason } },
          });
        } catch (err) {
          console.error("Failed to create rejection notification:", err?.message || err);
        }
      })();

      res.status(200).json(updated);
      // Invalidate listing cache so rejection changes reflect
      clearListingCache();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

// @desc    Get all properties
// @route   GET /api/properties
// @access  Public
export const getProperties = async (req, res) => {
  try {
    // Public endpoint: return approved properties.
    // Back-compat: older records may not have an `approval` field yet.
    const approvedFilter = {
      $or: [
        { 'approval.status': 'approved' },
        { approval: { $exists: false } },
        { 'approval.status': { $exists: false } },
      ],
    };

    const {
      q,
      searchMode,
      location,
      listing,
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
      sort,
      bbox,
      nearLat,
      nearLng,
      radiusKm,
    } = req.query;

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 50);
    const skip = (page - 1) * limit;

    const andFilters = [approvedFilter];

    // Listing intent (Phase 6)
    // listing=rent => rental.enabled true
    // listing=sale => rental.enabled not true / missing
    const listingMode = String(listing || "").toLowerCase().trim();
    if (listingMode === "rent") {
      andFilters.push({ "rental.enabled": true });
    } else if (listingMode === "sale") {
      andFilters.push({ $or: [{ "rental.enabled": { $ne: true } }, { rental: { $exists: false } }] });
    }

    // Type (single or multi)
    const typeList = toStringArray(types ?? type);
    if (typeList.length === 1) andFilters.push({ type: typeList[0] });
    if (typeList.length > 1) andFilters.push({ type: { $in: typeList } });

    if (featured === 'true' || featured === true) {
      andFilters.push({ featured: true });
    }

    if (location) {
      const rx = new RegExp(escapeRegex(location), 'i');
      andFilters.push({ location: rx });
    }

    // Text search (optional) or regex fallback
    if (q) {
      const mode = String(searchMode || "regex").toLowerCase();
      const qq = String(q).trim();
      if (mode === "text") {
        andFilters.push({ $text: { $search: qq } });
      } else {
        const rx = new RegExp(escapeRegex(qq), 'i');
        andFilters.push({ $or: [{ title: rx }, { description: rx }, { location: rx }, { features: rx }] });
      }
    }

    // Status filter (public can still browse reserved/sold if desired)
    const statusList = toStringArray(status);
    if (statusList.length === 1) andFilters.push({ status: statusList[0] });
    if (statusList.length > 1) andFilters.push({ status: { $in: statusList } });

    // Features filter: features=pool&features=garden
    const featureList = toStringArray(features);
    if (featureList.length > 0) {
      const mode = String(featuresMode || "any").toLowerCase();
      if (mode === "all") andFilters.push({ features: { $all: featureList } });
      else andFilters.push({ features: { $in: featureList } });
    }

    const priceFilter = {};
    if (minPrice !== undefined && minPrice !== '') priceFilter.$gte = Number(minPrice);
    if (maxPrice !== undefined && maxPrice !== '') priceFilter.$lte = Number(maxPrice);
    if (Object.keys(priceFilter).length) andFilters.push({ price: priceFilter });

    const areaFilter = {};
    if (minArea !== undefined && minArea !== '') areaFilter.$gte = Number(minArea);
    if (maxArea !== undefined && maxArea !== '') areaFilter.$lte = Number(maxArea);
    if (Object.keys(areaFilter).length) andFilters.push({ area: areaFilter });

    // Bedrooms / bathrooms min/max (keep legacy bedrooms/bathrooms as min)
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

    // Geo filters (Phase 5 UI uses these)
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

    const mongoFilter = andFilters.length ? { $and: andFilters } : {};

    // Attempt to serve from in-memory cache for identical query parameters
    const cacheKey = JSON.stringify({ q, searchMode, location, listing, type, types, featured, status, features, featuresMode, minPrice, maxPrice, minArea, maxArea, bedrooms, bathrooms, minBedrooms, maxBedrooms, minBathrooms, maxBathrooms, sort, bbox, nearLat, nearLng, radiusKm, page, limit });
    const cached = getCachedListing(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    let sortSpec = { createdAt: -1 };
    switch (String(sort || '').toLowerCase()) {
      case 'price_asc':
        sortSpec = { price: 1, createdAt: -1 };
        break;
      case 'price_desc':
        sortSpec = { price: -1, createdAt: -1 };
        break;
      case 'area_asc':
        sortSpec = { area: 1, createdAt: -1 };
        break;
      case 'area_desc':
        sortSpec = { area: -1, createdAt: -1 };
        break;
      case 'beds_desc':
        sortSpec = { bedrooms: -1, createdAt: -1 };
        break;
      case 'beds_asc':
        sortSpec = { bedrooms: 1, createdAt: -1 };
        break;
      case 'baths_desc':
        sortSpec = { bathrooms: -1, createdAt: -1 };
        break;
      case 'baths_asc':
        sortSpec = { bathrooms: 1, createdAt: -1 };
        break;
      case 'oldest':
        sortSpec = { createdAt: 1 };
        break;
      case 'relevance':
        // Only meaningful when using $text
        sortSpec = { score: { $meta: "textScore" }, createdAt: -1 };
        break;
      case 'newest':
      default:
        sortSpec = { createdAt: -1 };
        break;
    }

    // For public listing queries, use lean() + projection and a sensible maxTimeMS
    // to avoid long-running queries causing server stalls. Only select fields
    // needed by the listing to reduce document size.
    const projection = "title price images location bedrooms bathrooms area featured createdAt approval createdBy status type features geo reservation rental";

    const findQuery = Property.find(mongoFilter)
      .select(projection)
      .select(String(sort || '').toLowerCase() === 'relevance' ? { score: { $meta: "textScore" } } : {})
      .populate("createdBy", "name email role")
      .sort(sortSpec)
      .skip(skip)
      .limit(limit)
      .lean()
      .maxTimeMS(8000);

    const countQuery = Property.countDocuments(mongoFilter).maxTimeMS(8000);

    const [total, docs] = await Promise.all([countQuery.exec(), findQuery.exec()]);

    const items = docs.map(normalizePropertyDoc);

    const payload = {
      items,
      page,
      limit,
      total,
      pages: Math.max(Math.ceil(total / limit), 1),
    };

    // Cache featured listings a bit longer; normal queries short TTL
    const ttl = (String(featured) === 'true') ? 30000 : 5000;
    setCachedListing(cacheKey, payload, ttl);
    return res.status(200).json(payload);
  } catch (error) {
    console.error("getProperties error:", error);
    // If the error indicates network / server selection problems, return 503 so clients can retry
    const msg = error?.message || "Failed to fetch properties";
    const isNetworkErr = String(msg).toLowerCase().includes("timed out") || String(msg).toLowerCase().includes("server selection") || String(error?.name).toLowerCase().includes("mongonetworkerror");
    if (isNetworkErr) {
      return res.status(503).json({ message: "Database temporarily unavailable. Please try again shortly." });
    }
    // Fallback to 500 for other errors
    res.status(500).json({ message: msg });
  }
};

// @desc    Get properties created by the authenticated user (all approval states)
// @route   GET /api/properties/mine
// @access  Protected
export const getMyProperties = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const {
      q,
      searchMode,
      status,
      approval,
      sort,
    } = req.query;

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 50);
    const skip = (page - 1) * limit;

    const andFilters = [{ createdBy: userId }];

    // Optional full-text/regex search scoped to user's listings
    if (q) {
      const mode = String(searchMode || "regex").toLowerCase();
      const qq = String(q).trim();
      if (mode === "text") andFilters.push({ $text: { $search: qq } });
      else {
        const rx = new RegExp(escapeRegex(qq), 'i');
        andFilters.push({ $or: [{ title: rx }, { description: rx }, { location: rx }, { features: rx }] });
      }
    }

    // Filter by listing status (available|reserved|sold)
    const statusList = toStringArray(status);
    if (statusList.length === 1) andFilters.push({ status: statusList[0] });
    if (statusList.length > 1) andFilters.push({ status: { $in: statusList } });

    // Filter by approval state(s) (approved|pending|rejected)
    const approvalList = toStringArray(approval);
    if (approvalList.length === 1) andFilters.push({ 'approval.status': approvalList[0] });
    if (approvalList.length > 1) andFilters.push({ 'approval.status': { $in: approvalList } });

    const mongoFilter = andFilters.length ? { $and: andFilters } : {};

    let sortSpec = { createdAt: -1 };
    switch (String(sort || '').toLowerCase()) {
      case 'oldest':
        sortSpec = { createdAt: 1 };
        break;
      case 'price_asc':
        sortSpec = { price: 1, createdAt: -1 };
        break;
      case 'price_desc':
        sortSpec = { price: -1, createdAt: -1 };
        break;
      default:
        sortSpec = { createdAt: -1 };
    }

    const projection = "title price images location bedrooms bathrooms area featured createdAt approval createdBy status type features geo reservation rental";

    const findQuery = Property.find(mongoFilter)
      .select(projection)
      .populate("createdBy", "name email role")
      .sort(sortSpec)
      .skip(skip)
      .limit(limit)
      .lean()
      .maxTimeMS(8000);

    const countQuery = Property.countDocuments(mongoFilter).maxTimeMS(8000);

    const [total, docs] = await Promise.all([countQuery.exec(), findQuery.exec()]);
    const items = docs.map(normalizePropertyDoc);

    return res.status(200).json({
      items,
      page,
      limit,
      total,
      pages: Math.max(Math.ceil(total / limit), 1),
    });
  } catch (error) {
    console.error("getMyProperties error:", error);
    const msg = error?.message || "Failed to fetch your properties";
    res.status(500).json({ message: msg });
  }
};

// @desc    Facets/aggregations for public property browsing
// @route   GET /api/properties/facets
// @access  Public
export const getPropertyFacets = async (req, res) => {
  try {
    const approvedFilter = {
      $or: [
        { 'approval.status': 'approved' },
        { approval: { $exists: false } },
        { 'approval.status': { $exists: false } },
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
    } = req.query;

    const andFilters = [approvedFilter];

    const typeList = toStringArray(types ?? type);
    if (typeList.length === 1) andFilters.push({ type: typeList[0] });
    if (typeList.length > 1) andFilters.push({ type: { $in: typeList } });

    if (featured === 'true' || featured === true) andFilters.push({ featured: true });

    if (location) {
      const rx = new RegExp(escapeRegex(location), 'i');
      andFilters.push({ location: rx });
    }

    if (q) {
      const mode = String(searchMode || "regex").toLowerCase();
      const qq = String(q).trim();
      if (mode === "text") andFilters.push({ $text: { $search: qq } });
      else {
        const rx = new RegExp(escapeRegex(qq), 'i');
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
    if (minPrice !== undefined && minPrice !== '') priceFilter.$gte = Number(minPrice);
    if (maxPrice !== undefined && maxPrice !== '') priceFilter.$lte = Number(maxPrice);
    if (Object.keys(priceFilter).length) andFilters.push({ price: priceFilter });

    const areaFilter = {};
    if (minArea !== undefined && minArea !== '') areaFilter.$gte = Number(minArea);
    if (maxArea !== undefined && maxArea !== '') areaFilter.$lte = Number(maxArea);
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

    const mongoFilter = andFilters.length ? { $and: andFilters } : {};

    const pipeline = [
      { $match: mongoFilter },
      {
        $facet: {
          price: [
            {
              $group: {
                _id: null,
                min: { $min: "$price" },
                max: { $max: "$price" },
              },
            },
          ],
          area: [
            {
              $group: {
                _id: null,
                min: { $min: "$area" },
                max: { $max: "$area" },
              },
            },
          ],
          types: [
            { $group: { _id: "$type", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          statuses: [
            { $group: { _id: "$status", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          bedrooms: [
            { $group: { _id: "$bedrooms", count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
          ],
          bathrooms: [
            { $group: { _id: "$bathrooms", count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
          ],
        },
      },
    ];

    const [out] = await Property.aggregate(pipeline).option({ maxTimeMS: 8000 });
    const priceAgg = out?.price?.[0] || {};
    const areaAgg = out?.area?.[0] || {};

    return res.status(200).json({
      price: { min: priceAgg.min ?? null, max: priceAgg.max ?? null },
      area: { min: areaAgg.min ?? null, max: areaAgg.max ?? null },
      types: out?.types || [],
      statuses: out?.statuses || [],
      bedrooms: out?.bedrooms || [],
      bathrooms: out?.bathrooms || [],
    });
  } catch (error) {
    console.error("getPropertyFacets error:", error);
    return res.status(500).json({ message: error?.message || "Failed to fetch facets" });
  }
};

// @desc    Get single property by ID
// @route   GET /api/properties/:id
// @access  Public
export const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid property id" });
    }

    const property = await Property.findById(id)
      .populate("createdBy", "name email role")
      .lean()
      .maxTimeMS(8000);
    if (!property) return res.status(404).json({ message: "Property not found" });
    // Only return details for approved properties (public)
    // Back-compat: if approval is missing, treat as approved.
    if (property.approval && property.approval.status && property.approval.status !== 'approved') {
      return res.status(404).json({ message: "Property not found" });
    }
    const normalized = normalizePropertyDoc(property);
    // Include computed policy so the frontend can render Reserve consistently.
    normalized.reservationPolicy = getEffectiveReservationPolicy(property);
    res.status(200).json(normalized);
  } catch (error) {
    // Cast errors and similar should not be 500s
    const msg = error?.message || "Failed to load property";
    if (String(msg).toLowerCase().includes("cast to objectid")) {
      return res.status(400).json({ message: "Invalid property id" });
    }
    res.status(500).json({ message: msg });
  }
};

// @desc    Update reservation/payment policy for a property (admin)
// @route   PUT /api/properties/admin/:id/reservation-policy
// @access  Admin/Staff
export const adminUpdateReservationPolicy = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid property id" });
    }

    const property = await Property.findById(id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    const { enabled, tokenRequired, tokenAmountMinor, currency } = req.body || {};

    property.reservation = property.reservation || {};

    if (enabled !== undefined) property.reservation.enabled = Boolean(enabled);
    if (tokenRequired !== undefined) property.reservation.tokenRequired = Boolean(tokenRequired);

    if (tokenAmountMinor !== undefined) {
      const n = Number(tokenAmountMinor);
      if (!Number.isFinite(n) || n < 0) {
        return res.status(400).json({ message: "tokenAmountMinor must be a non-negative number (minor units)." });
      }
      property.reservation.tokenAmountMinor = Math.trunc(n);
    }

    if (currency !== undefined) {
      const c = String(currency || "").toLowerCase().trim();
      if (!c) {
        return res.status(400).json({ message: "currency is required when provided" });
      }
      property.reservation.currency = c;
    }

    const updated = await property.save();
    clearListingCache();
    return res.status(200).json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc    Get reservation policy for a property (admin) — useful for admin UIs/tools
// @route   GET /api/properties/admin/:id/reservation-policy
// @access  Admin/Staff
export const adminGetReservationPolicy = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid property id" });
    }

    const property = await Property.findById(id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    const effective = getEffectiveReservationPolicy(property);
    return res.status(200).json({ propertyId: property._id, reservation: property.reservation || {}, reservationPolicy: effective });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc    Update rental/lease policy for a property (admin)
// @route   PUT /api/properties/admin/:id/rental-policy
// @access  Admin/Staff
export const adminUpdateRentalPolicy = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid property id" });
    }

    const property = await Property.findById(id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    const { enabled, monthlyRentMinor, depositMinor, currency, minTermMonths } = req.body || {};

    property.rental = property.rental || {};

    if (enabled !== undefined) property.rental.enabled = Boolean(enabled);

    if (monthlyRentMinor !== undefined) {
      const n = Number(monthlyRentMinor);
      if (!Number.isFinite(n) || n < 0) {
        return res.status(400).json({ message: "monthlyRentMinor must be a non-negative number (minor units)." });
      }
      property.rental.monthlyRentMinor = Math.trunc(n);
    }

    if (depositMinor !== undefined) {
      const n = Number(depositMinor);
      if (!Number.isFinite(n) || n < 0) {
        return res.status(400).json({ message: "depositMinor must be a non-negative number (minor units)." });
      }
      property.rental.depositMinor = Math.trunc(n);
    }

    if (minTermMonths !== undefined) {
      const n = Number(minTermMonths);
      if (!Number.isFinite(n) || n < 1 || n > 120) {
        return res.status(400).json({ message: "minTermMonths must be between 1 and 120." });
      }
      property.rental.minTermMonths = Math.trunc(n);
    }

    if (currency !== undefined) {
      const c = String(currency || "").toLowerCase().trim();
      if (!c) {
        return res.status(400).json({ message: "currency is required when provided" });
      }
      property.rental.currency = c;
    }

    const updated = await property.save();
    clearListingCache();
    return res.status(200).json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc    Get rental policy for a property (admin)
// @route   GET /api/properties/admin/:id/rental-policy
// @access  Admin/Staff
export const adminGetRentalPolicy = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid property id" });
    }

    const property = await Property.findById(id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    return res.status(200).json({ propertyId: property._id, rental: property.rental || {} });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc    Update a property
// @route   PUT /api/properties/:id
// @access  Admin/Staff
export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    const { title, description, price, location, type, status, area } = req.body;

    // Optional geo update
    if (req.body && (req.body.clearGeo === true || req.body.clearGeo === 'true')) {
      property.geo = undefined;
    } else {
      try {
        const maybeGeo = parseGeoFromBody(req.body);
        if (maybeGeo) property.geo = maybeGeo;
      } catch (e) {
        return res.status(400).json({ message: e.message || "Invalid coordinates" });
      }
    }

    if (title) property.title = title;
    if (description) property.description = description;
    if (price) property.price = price;
    if (area) property.area = area;
    if (location) property.location = location;
    if (type) property.type = type;
    if (status) property.status = status;

    const updatedProperty = await property.save();
    // Invalidate listing cache so updates are reflected
    clearListingCache();
    res.status(200).json(updatedProperty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update property geo coordinates (admin)
// @route   PUT /api/properties/admin/:id/geo
// @access  Admin/Staff
export const adminUpdatePropertyGeo = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid property id" });
    }

    const property = await Property.findById(id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    let geo;
    try {
      geo = parseGeoFromBody(req.body);
    } catch (e) {
      return res.status(400).json({ message: e.message || "Invalid coordinates" });
    }

    if (!geo) {
      return res.status(400).json({ message: "lat/lng are required" });
    }

    property.geo = geo;
    const updated = await property.save();
    clearListingCache();
    return res.status(200).json(updated);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

// @desc    Delete a property
// @route   DELETE /api/properties/:id
// @access  Admin/Staff
export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    await property.deleteOne();
    // Invalidate listing cache so deletions are reflected
    clearListingCache();
    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
