import express from "express";

import { placeOrder, getMyOrders, getAllOrders, updateOrderStatus, cancelOrder, getOrderById } from "../controllers/orderController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// ========================================
// Customer Routes
// ========================================

// Place Order
router.post("/", protect, placeOrder);

// Get Logged-in Customer Orders
router.get("/my-orders", protect, getMyOrders);

// Get Single Order
router.get("/:orderId", protect, getOrderById);

// Cancel Order
router.put("/:orderId/cancel", protect, cancelOrder);

// ========================================
// Admin Routes
// ========================================

// Get All Orders
router.get( "/", protect, authorize("Admin"), getAllOrders);

// Update Order Status
router.put( "/:orderId", protect, authorize("Admin"), updateOrderStatus);

export default router;