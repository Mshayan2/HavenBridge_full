import express from "express";
import {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
  getMyBookings, // <-- new controller for customer bookings
  deleteMyBooking,
  getBookingsForMyProperties,
  respondToBooking,
} from "../controllers/bookingController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Customer can create booking
router.post("/", protect, createBooking);

// Customer can get own bookings
router.get("/my-bookings", protect, getMyBookings);

// Seller (property owner) can see bookings for their properties
router.get("/my-properties", protect, getBookingsForMyProperties);

// Seller responds to a booking (accept/reject)
router.put("/:id/respond", protect, respondToBooking);

// Customer can cancel their own booking
router.delete("/my/:id", protect, deleteMyBooking);

// Admin/staff can manage all bookings
router.get("/", protect, adminOnly, getAllBookings);
router.get("/:id", protect, adminOnly, getBookingById);
router.put("/:id", protect, adminOnly, updateBooking);
router.delete("/:id", protect, adminOnly, deleteBooking);

export default router;
