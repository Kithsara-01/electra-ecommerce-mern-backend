import express from "express";

import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  searchProducts,
  updateProduct,
} from "../controllers/productController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const productRouter = express.Router();

// Public Routes
productRouter.get("/", getAllProducts);
productRouter.get("/search/:query", searchProducts);

// Admin Routes
productRouter.get("/admin", protect, authorize("Admin"), getAllProducts);
productRouter.post("/", protect, authorize("Admin"), createProduct);
productRouter.put("/:productId", protect, authorize("Admin"), updateProduct);
productRouter.delete("/:productId", protect, authorize("Admin"), deleteProduct);

// Public Route
productRouter.get("/:productId", getProductById);

export default productRouter;