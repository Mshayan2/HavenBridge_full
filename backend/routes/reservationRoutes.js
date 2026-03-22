import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getReservationQuote,
  startReservation,
  payRemainingBalance,
  listMyReservations,
  getMyReservationForProperty,
  resumeReservationFeePayment,
} from "../controllers/reservationController.js";

const router = express.Router();

router.get("/quote/:propertyId", getReservationQuote);
router.get("/property/:propertyId/mine", protect, getMyReservationForProperty);
router.get("/my", protect, listMyReservations);

router.post("/:propertyId/start", protect, startReservation);
router.post("/:reservationId/fee/checkout-session", protect, resumeReservationFeePayment);
router.post("/:reservationId/pay-remaining", protect, payRemainingBalance);

export default router;
