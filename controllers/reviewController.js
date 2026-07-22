import Review from "../models/review.js";
import Product from "../models/product.js";

// Helper function to update product rating
const updateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId });

  const totalReviews = reviews.length;

  const averageRating =
    totalReviews === 0
      ? 0
      : reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

  await Product.findByIdAndUpdate(productId, {
    averageRating: Number(averageRating.toFixed(1)),
    totalReviews,
  });
};

// Create Review
export const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Rating and comment are required.",
      });
    }

    const product = await Product.findOne({
        productId,
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const existingReview = await Review.findOne({
      product: product._id,
      customer: req.user._id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product.",
      });
    }

    const review = await Review.create({
      product: product._id,
      customer: req.user._id,
      rating,
      comment,
    });

    await updateProductRating(product._id);

    return res.status(201).json({
      success: true,
      message: "Review added successfully.",
      review,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Product Reviews
export const getProductReviews = async (req, res) => {
    try {
      const product = await Product.findOne({
        productId: req.params.productId,
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found.",
        });
      }

      const reviews = await Review.find({
        product: product._id,
      })
        .populate("customer", "name profileImage")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        reviews,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
// Update Review
export const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    if (review.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    review.rating = rating;
    review.comment = comment;

    await review.save();

    await updateProductRating(review.product);

    return res.status(200).json({
      success: true,
      message: "Review updated successfully.",
      review,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Review
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    if (review.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    const productId = review.product;

    await review.deleteOne();

    await updateProductRating(productId);

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};