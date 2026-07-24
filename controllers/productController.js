import Product from "../models/product.js";
import { deleteProductImages } from "../utils/productImageService.js";

import {
  generateProductDescription,
  generateAlternativeNames,
} from "../services/geminiService.js";

// ==============================
// Create Product
// ==============================
export const createProduct = async (req, res) => {
  try {
    const {
      productId,
      name,
      altNames,
      description,
      price,
      labelledPrice,
      // Ensure `images` defaults to an empty array when not provided
      images = [],
      category,
      stock,
      brand,
      model,
      isAvailable,
    } = req.body;

    // Required field validation
    if (
      !productId ||
      !name ||
      !description ||
      price == null ||
      labelledPrice == null ||
      !category
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    // Duplicate Product ID
    const existingProduct = await Product.findOne({ productId });

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Product ID already exists.",
      });
    }

    // TODO:
    // Upload images to Supabase and replace images array
    // with returned public URLs.

    const product = await Product.create({
      productId,
      name,
      altNames,
      description,
      price,
      labelledPrice,
      images,
      category,
      stock,
      brand,
      model,
      isAvailable,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully.",
      product,
    });
  } catch (error) {
    console.error("Create Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create product.",
    });
  }
};

// ==============================
// Get All Products
// ==============================
export const getAllProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      brand,
      stockStatus,
      minPrice,
      maxPrice,
      sort = "newest",
      page = 1,
      limit = 10,
    } = req.query;
    const filter = {};

    // Customers see only available products
    if (!req.user || req.user.role !== "Admin") {
      filter.isAvailable = true;
    }

    // Search
    // Search
    // Search
    if (search) {
      filter.$or = [
        { productId: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { model: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { altNames: { $elemMatch: { $regex: search, $options: "i" } } },
      ];
    }

    // Category Filter
    if (category) {
      filter.category = category;
    }

    // Brand Filter
    if (brand) {
      filter.brand = brand;
    }

    // Stock Status Filter
    if (stockStatus && stockStatus !== "All") {
      switch (stockStatus) {
        case "In Stock":
          filter.stock = { $gt: 5 };
          break;

        case "Low Stock":
          filter.stock = { $gt: 0, $lte: 5 };
          break;

        case "Out of Stock":
          filter.stock = 0;
          break;

        default:
          break;
      }
    }

    // Price Filter
    if (minPrice || maxPrice) {
      filter.price = {};

      if (minPrice) {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    // Sorting
    let sortOption = {};

    switch (sort) {
      case "priceLow":
        sortOption.price = 1;
        break;

      case "priceHigh":
        sortOption.price = -1;
        break;

      case "oldest":
        sortOption.createdAt = 1;
        break;

      default:
        sortOption.createdAt = -1;
    }

    const currentPage = Number(page);
    const perPage = Number(limit);

    const totalProducts = await Product.countDocuments(filter);

    const lowStockCount = await Product.countDocuments({
      stock: { $gt: 0, $lte: 5 },
    });

    const outOfStockCount = await Product.countDocuments({
      stock: 0,
    });


    const products = await Product.find(filter)
      .sort(sortOption)
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    return res.status(200).json({
      success: true,
      totalProducts,
      lowStockCount,
      outOfStockCount,
      currentPage,
      totalPages: Math.ceil(totalProducts / perPage),
      products,
    });

  } catch (error) {
    console.error("Get Products Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products.",
    });
  }
};

// ==============================
// Get Single Product
// ==============================
export const getProductById = async (req, res) => {
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

    // Customers cannot view unavailable products
    if (
      !product.isAvailable &&
      (!req.user || req.user.role !== "Admin")
    ) {
      return res.status(403).json({
        success: false,
        message: "This product is unavailable.",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product.",
    });
  }
};

// ==============================
// Update Product
// ==============================
export const updateProduct = async (req, res) => {
  try {
    // Product ID cannot be updated
    if (req.body.productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID cannot be updated.",
      });
    }

    const existingProduct = await Product.findOne({
      productId: req.params.productId,
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const existingImages = existingProduct.images || [];
    const incomingImages = req.body.images;

    if (Array.isArray(incomingImages)) {
      const removedImages = existingImages.filter(
        (image) => !incomingImages.includes(image)
      );

      if (removedImages.length > 0) {
        await deleteProductImages(removedImages);
      }
    }

    const updatedProduct = await Product.findOneAndUpdate(
      {
        productId: req.params.productId,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Update Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update product.",
    });
  }
};

// ==============================
// Update Product Stock
// ==============================
export const updateProductStock = async (req, res) => {
  try {
    const { stock } = req.body;

    if (stock === undefined) {
      return res.status(400).json({
        success: false,
        message: "Stock is required.",
      });
    }

    const product = await Product.findOne({
      productId: req.params.productId,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    if (Number(stock) < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock cannot be negative.",
      });
    }

    product.stock = Number(stock);

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Stock updated successfully.",
      product,
    });
  } catch (error) {
    console.error("Update Stock Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update stock.",
    });
  }
};

// ==============================
// Delete Product
// ==============================
export const deleteProduct = async (req, res) => {
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
    await deleteProductImages(product.images);



    await Product.deleteOne({
      productId: req.params.productId,
    });

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete product.",
    });
  }
};

// ==============================
// Search Products
// ==============================
export const searchProducts = async (req, res) => {
  try {
    const { query } = req.params;

    const products = await Product.find({
      isAvailable: true,
      $or: [
        {
          name: {
            $regex: query,
            $options: "i",
          },
        },
        {
          description: {
            $regex: query,
            $options: "i",
          },
        },
        {
          altNames: {
            $elemMatch: {
              $regex: query,
              $options: "i",
            },
          },
        },
        {
          brand: {
            $regex: query,
            $options: "i",
          },
        },
        {
          model: {
            $regex: query,
            $options: "i",
          },
        },
        {
          category: {
            $regex: query,
            $options: "i",
          },
        },
      ],
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      totalProducts: products.length,
      products,
    });
  } catch (error) {
    console.error("Search Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to search products.",
    });
  }
};

// ==============================
// Generate AI Product Description
// ==============================
export const generateAIProductDescription = async (req, res) => {
  try {
    const { productName, category } = req.body;

    if (!productName || !category) {
      return res.status(400).json({
        success: false,
        message: "Product name and category are required.",
      });
    }

    const description = await generateProductDescription(
      productName,
      category
    );

    return res.status(200).json({
      success: true,
      description,
    });

  } catch (error) {
    console.error("Generate AI Description Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate product description.",
    });
  }
};


export const generateAIAlternativeNames = async (req, res) => {
  try {
    const { productName, category } = req.body;

    if (!productName || !category) {
      return res.status(400).json({
        success: false,
        message: "Product name and category are required.",
      });
    }

    const alternativeNames = await generateAlternativeNames(
      productName,
      category
    );

    return res.status(200).json({
      success: true,
      alternativeNames,
    });
  } catch (error) {
    console.error("AI Alternative Names Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate alternative names.",
    });
  }
};