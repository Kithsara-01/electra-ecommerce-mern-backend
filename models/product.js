import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    altNames: {
      type: [String],
      default: [],
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    labelledPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    images: {
      type: [String],
      default: [],
      required: true,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    averageRating: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    brand: {
      type: String,
      trim: true,
    },

    model: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;