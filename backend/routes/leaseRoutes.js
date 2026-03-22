import express from "express";
import {
  requestLease,
  listMyLeases,
  listLandlordLeases,
  getLeaseById,
  approveLease,
  rejectLease,
  createLeaseCheckoutSession,
} from "../controllers/leaseController.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Tenant: request a new lease
router.post("/", protect, requestLease);

// Tenant: my leases
router.get("/my", protect, listMyLeases);

// Landlord: leases for my properties
router.get("/landlord", protect, listLandlordLeases);

// Tenant: pay an installment
router.post("/:id/checkout-session", protect, createLeaseCheckoutSession);

// Landlord/Admin: approve/reject
router.put("/:id/approve", protect, approveLease);
router.put("/:id/reject", protect, rejectLease);

// Get one lease (participant-only)
router.get("/:id", protect, getLeaseById);

export default router;
