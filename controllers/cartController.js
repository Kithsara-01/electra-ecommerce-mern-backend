import Cart from "../models/cart.js";
import Product from "../models/product.js";

/**
 * Add product to cart
 * - Creates cart if doesn't exist
 * - Increases quantity if product already in cart
 * - Adds new item if product not in cart
 * - Validates product exists and is available
 * - Validates sufficient stock
 */
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    // Validate inputs
    if (!productId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Product ID and quantity are required",
      });
    }

    if (quantity < 1 || !Number.isInteger(quantity)) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer",
      });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if product is available
    if (!product.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "Product is not available for purchase",
      });
    }

    // Check stock availability
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${product.stock} items available`,
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create new cart
      cart = new Cart({
        userId,
        items: [
          {
            productId,
            quantity,
            
          },
        ],
      });
    } else {
      // Check if product already in cart
      const existingItem = cart.items.find(
        (item) => item.productId.toString() === productId
      );

      if (existingItem) {
        // Update quantity if product exists
        const newQuantity = existingItem.quantity + quantity;

        // Validate total quantity doesn't exceed stock
        if (newQuantity > product.stock) {
          return res.status(400).json({
            success: false,
            message: `Cannot add that quantity. Maximum available: ${product.stock}, Current in cart: ${existingItem.quantity}`,
          });
        }

        existingItem.quantity = newQuantity;
      } else {
        // Add new item to cart
        cart.items.push({
        productId,
        quantity,
        });
      }
    }

    await cart.save();

    // Populate product details
    await cart.populate(
        "items.productId",
        "productId name price labelledPrice images stock category brand model isAvailable"
    )

    return res.status(200).json({
      success: true,
      message: "Product added to cart successfully",
      cart,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return res.status(500).json({
      success: false,
      message: "Error adding product to cart",
      error: error.message,
    });
  }
};

/**
 * Get user's cart
 * - Returns cart with populated product details
 * - Returns empty array if no cart exists
 */
export const getCart = async (req, res) => {
  try {
    const userId = req.user._id;

    let cart = await Cart.findOne({ userId }).populate(
        "items.productId",
        "productId name price labelledPrice images stock category brand model isAvailable"
        );

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart is empty",
        cart: {
          userId,
          items: [],
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cart retrieved successfully",
      cart,
    });
  } catch (error) {
    console.error("Error retrieving cart:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving cart",
      error: error.message,
    });
  }
};

/**
 * Update quantity of a cart item
 * - Quantity must be at least 1
 * - Cannot exceed product stock
 * - Returns updated cart
 */
export const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    // Validate inputs
    if (!productId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Product ID and quantity are required",
      });
    }

    if (quantity < 1 || !Number.isInteger(quantity)) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    // Find cart
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Find item in cart
    const cartItem = cart.items.find(
      (item) => item.productId.toString() === productId
    );
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    // Verify product exists and has sufficient stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Cannot update quantity. Maximum available: ${product.stock}`,
      });
    }

    // Update quantity
    cartItem.quantity = quantity;
    await cart.save();

    // Populate product details
    await cart.populate(
        "items.productId",
        "productId name price labelledPrice images stock category brand model isAvailable"
        )

    return res.status(200).json({
      success: true,
      message: "Cart item updated successfully",
      cart,
    });
  } catch (error) {
    console.error("Error updating cart item:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating cart item",
      error: error.message,
    });
  }
};

/**
 * Remove a product from cart
 * - Removes single product entirely from cart
 * - Returns updated cart
 */
export const removeCartItem = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Find cart
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Check if product exists in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    // Remove item from cart
    cart.items.splice(itemIndex, 1);
    await cart.save();

    // Populate product details
    await cart.populate(
        "items.productId",
        "productId name price labelledPrice images stock category brand model isAvailable"
    );

    return res.status(200).json({
      success: true,
      message: "Product removed from cart successfully",
      cart,
    });
  } catch (error) {
    console.error("Error removing cart item:", error);
    return res.status(500).json({
      success: false,
      message: "Error removing product from cart",
      error: error.message,
    });
  }
};

/**
 * Clear all items from cart
 * - Keeps cart document
 * - Empties items array
 * - Returns success message
 */
export const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Clear items
    cart.items = [];
    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      cart,
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return res.status(500).json({
      success: false,
      message: "Error clearing cart",
      error: error.message,
    });
  }
};
