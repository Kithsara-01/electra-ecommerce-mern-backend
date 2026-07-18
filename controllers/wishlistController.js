import Wishlist from "../models/wishlist.js";
import Product from "../models/product.js";

// @desc    Get logged-in user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.find({ user: req.user._id }).populate(
      "product"
    );

    res.status(200).json({
      success: true,
      count: wishlist.length,
      wishlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist/:productId
// @access  Private
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const alreadyExists = await Wishlist.findOne({
      user: req.user._id,
      product: productId,
    });

    if (alreadyExists) {
      return res.status(400).json({
        success: false,
        message: "Product already exists in wishlist",
      });
    }

    const wishlistItem = await Wishlist.create({
      user: req.user._id,
      product: productId,
    });

    res.status(201).json({
      success: true,
      message: "Product added to wishlist",
      wishlistItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlistItem = await Wishlist.findOneAndDelete({
      user: req.user._id,
      product: productId,
    });

    if (!wishlistItem) {
      return res.status(404).json({
        success: false,
        message: "Wishlist item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

    // @desc    Check if a product is in the logged-in user's wishlist
    // @route   GET /api/wishlist/check/:productId
    // @access  Private
    export const checkWishlist = async (req, res) => {
    try {
        const wishlistItem = await Wishlist.findOne({
        user: req.user._id,
        product: req.params.productId,
        });

        res.status(200).json({
        success: true,
        isWishlisted: !!wishlistItem,
        });
    } catch (error) {
        res.status(500).json({
        success: false,
        message: error.message,
        });
    }
    };