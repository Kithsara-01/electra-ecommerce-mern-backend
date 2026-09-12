import express from "express";

import {
  createReview,
  getProductReviews,
  getAllReviews,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Public
router.get("/product/:productId", getProductReviews);

// Admin
router.get("/admin", protect, authorize("Admin"), getAllReviews);

// Customer
router.post("/", protect, createReview);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);

export default router;