import express from "express";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import {
  createProperty,
  getProperties,
  getPropertyFacets,
  getPropertyById,
  getMyProperties,
  getReservationPolicy,
  updateProperty,
  deleteProperty,
  submitProperty,
  getAllProperties,
  getPendingProperties,
  approveProperty,
  rejectProperty,
  adminUpdateReservationPolicy,
  adminGetReservationPolicy,
  adminUpdateRentalPolicy,
  adminGetRentalPolicy,
  adminUpdatePropertyGeo,
} from "../controllers/propertyController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getProperties);

// Public facets/aggregations (must be before '/:id')
router.get("/facets", getPropertyFacets);

// Authenticated user routes
router.get('/mine', protect, getMyProperties);

// Admin endpoints for approval workflow (must come before "/:id" to avoid route collision)
router.get('/admin', protect, authorizeRoles("admin", "staff"), getAllProperties);
router.get('/admin/pending', protect, authorizeRoles("admin", "staff"), getPendingProperties);
router.put('/admin/:id/approve', protect, authorizeRoles("admin", "staff"), approveProperty);
router.put('/admin/:id/reject', protect, authorizeRoles("admin", "staff"), rejectProperty);
router.put('/admin/:id/reservation-policy', protect, authorizeRoles("admin", "staff"), adminUpdateReservationPolicy);
router.get('/admin/:id/reservation-policy', protect, authorizeRoles("admin", "staff"), adminGetReservationPolicy);
router.put('/admin/:id/rental-policy', protect, authorizeRoles("admin", "staff"), adminUpdateRentalPolicy);
router.get('/admin/:id/rental-policy', protect, authorizeRoles("admin", "staff"), adminGetRentalPolicy);
router.put('/admin/:id/geo', protect, authorizeRoles("admin", "staff"), adminUpdatePropertyGeo);

// Single-property route (after admin routes to avoid matching 'admin' as :id)
// Public reservation policy MUST come before "/:id" or it will never match.
router.get("/:id/reservation-policy", getReservationPolicy);

// Single-property route (after admin routes to avoid matching 'admin' as :id)
router.get("/:id", getPropertyById);

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeBase = path
      .basename(file.originalname || "file", ext)
      .replace(/[^a-zA-Z0-9-_]+/g, "-")
      .slice(0, 80);
    const id = crypto.randomBytes(8).toString("hex");
    cb(null, `${Date.now()}-${id}-${safeBase || "file"}${ext}`);
  }
});

const allowedPhotoMimes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const allowedDocMimes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);

function fileFilter(req, file, cb) {
  const field = file.fieldname;
  const mime = file.mimetype;
  const isPhotoField = field === "photos";
  const isDocField = ["titleDeed", "taxReceipt", "utilityBill", "idCard"].includes(field);

  if (isPhotoField && allowedPhotoMimes.has(mime)) return cb(null, true);
  if (isDocField && allowedDocMimes.has(mime)) return cb(null, true);

  return cb(new Error(`Unsupported file type for ${field}: ${mime}`));
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 20,
  },
});

// Customer submit route (accepts photos[] and multiple document fields)
const uploadFields = upload.fields([
  { name: 'photos', maxCount: 12 },
  { name: 'titleDeed', maxCount: 1 },
  { name: 'taxReceipt', maxCount: 1 },
  { name: 'utilityBill', maxCount: 1 },
  { name: 'idCard', maxCount: 1 }
]);

router.post('/submit', protect, uploadFields, submitProperty);


// Protected routes (admin & staff only)
router.post("/", protect, authorizeRoles("admin", "staff"), createProperty);
router.put("/:id", protect, authorizeRoles("admin", "staff"), updateProperty);
router.delete("/:id", protect, authorizeRoles("admin", "staff"), deleteProperty);

export default router;
