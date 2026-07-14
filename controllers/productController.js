import Product from "../models/product.js";

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
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
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

    const products = await Product.find(filter)
      .sort(sortOption)
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    return res.status(200).json({
      success: true,
      totalProducts,
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

    // TODO:
    // If new images are uploaded,
    // delete old images from Supabase
    // then save new public URLs.

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

    // TODO:
    // Delete all product images
    // from Supabase before deleting product.

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