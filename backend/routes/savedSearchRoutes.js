import express from "express";
import {
  createSavedSearch,
  deleteSavedSearch,
  listMySavedSearches,
  runSavedSearchNow,
  updateSavedSearch,
} from "../controllers/savedSearchController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", listMySavedSearches);
router.post("/", createSavedSearch);
router.put("/:id", updateSavedSearch);
router.delete("/:id", deleteSavedSearch);
router.post("/:id/run", runSavedSearchNow);

export default router;
