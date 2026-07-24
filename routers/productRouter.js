import express from "express";

import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  updateProductStock,
  deleteProduct,
  searchProducts,
  generateAIProductDescription,
  generateAIAlternativeNames,
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

productRouter.post("/ai-description", protect, authorize("Admin"), generateAIProductDescription);
productRouter.post( "/ai-alternative-names", protect, authorize("Admin"), generateAIAlternativeNames);

productRouter.put("/:productId", protect, authorize("Admin"), updateProduct);
productRouter.patch("/:productId/stock", protect, authorize("Admin"), updateProductStock);
productRouter.delete("/:productId", protect, authorize("Admin"), deleteProduct);

// Public Route
productRouter.get("/:productId", getProductById);

export default productRouter;