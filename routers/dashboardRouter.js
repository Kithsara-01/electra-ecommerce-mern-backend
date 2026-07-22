import express from "express";
import {
  getDashboardStats,
  getRevenueAnalytics,
  getNotificationCounts,
} from "../controllers/dashboardController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";



const router = express.Router();

router.get( "/stats", protect, authorize("Admin"), getDashboardStats);
router.get( "/revenue", protect, authorize("Admin"), getRevenueAnalytics);
router.get( "/notifications", protect, authorize("Admin"), getNotificationCounts);

export default router;