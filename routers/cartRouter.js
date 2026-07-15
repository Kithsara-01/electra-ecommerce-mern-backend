import express from "express";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cartController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All cart routes require authentication
router.use(protect);

/**
 * POST /api/cart/add
 * Add product to cart
 * Body: { productId, quantity }
 */
router.post("/add", addToCart);

/**
 * GET /api/cart
 * Get user's cart with populated product details
 */
router.get("/", getCart);

/**
 * PUT /api/cart/update
 * Update quantity of a cart item
 * Body: { productId, quantity }
 */
router.put("/update", updateCartItem);

/**
 * DELETE /api/cart/remove
 * Remove a product from cart
 * Body: { productId }
 */
router.delete("/remove", removeCartItem);

/**
 * DELETE /api/cart/clear
 * Clear all items from cart
 */
router.delete("/clear", clearCart);

export default router;
