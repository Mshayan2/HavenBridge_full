import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  addFavorite,
  listMyFavoriteIds,
  listMyFavorites,
  removeFavoriteByProperty,
} from "../controllers/favoriteController.js";

const router = express.Router();

// All favorites routes require auth
router.get("/", protect, listMyFavorites);
router.get("/ids", protect, listMyFavoriteIds);
router.post("/", protect, addFavorite);
router.delete("/property/:propertyId", protect, removeFavoriteByProperty);

export default router;
