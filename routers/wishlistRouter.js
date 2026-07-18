import express from "express";
import { getWishlist, addToWishlist, removeFromWishlist, checkWishlist,} from "../controllers/wishlistController.js";
import { protect } from "../middlewares/authMiddleware.js";

const wishlistRouter = express.Router();

// Get logged-in user's wishlist
wishlistRouter.get("/", protect, getWishlist);

// Add product to wishlist
wishlistRouter.get("/check/:productId", protect, checkWishlist);
wishlistRouter.post("/:productId", protect, addToWishlist);

// Remove product from wishlist
wishlistRouter.delete("/:productId", protect, removeFromWishlist);

export default wishlistRouter;