import Order from "../models/order.js";
import Cart from "../models/cart.js";
import Product from "../models/product.js";
import { getDeliveryFee } from "../utils/delivery.js";

// ===============================
// Place Order
// ===============================
export const placeOrder = async (req, res) => {
  try {
    const user = req.user;

    const {
      customerName,
      email,
      phone,
      streetAddress,
      city,
      district,
      postalCode,
      deliveryNotes,
      paymentMethod = "Cash on Delivery",
    } = req.body;

    // ===============================
    // Validation
    // ===============================
    if (!customerName || !customerName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Customer name is required.",
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required.",
      });
    }

    if (!streetAddress || !streetAddress.trim()) {
      return res.status(400).json({
        success: false,
        message: "Street address is required.",
      });
    }

    if (!city || !city.trim()) {
      return res.status(400).json({
        success: false,
        message: "City is required.",
      });
    }

    if (!district || !district.trim()) {
      return res.status(400).json({
        success: false,
        message: "District is required.",
      });
    }

    if (!postalCode || !postalCode.trim()) {
      return res.status(400).json({
        success: false,
        message: "Postal code is required.",
      });
    }

    // Find user's cart
    const cart = await Cart.findOne({ userId: user._id }).populate(
      "items.productId"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty.",
      });
    }

    // Create order items
    const items = cart.items.map((item) => ({
      productId: item.productId._id,
      name: item.productId.name,
      image: item.productId.images?.[0] || "",
      price: item.productId.price,
      quantity: item.quantity,
    }));

    // ===============================
    // Check Stock Availability
    // ===============================
    for (const item of cart.items) {
      const product = await Product.findById(item.productId._id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `${item.productId.name} not found.`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} item(s) available for ${product.name}.`,
        });
      }
    }

    // ===============================
    // Calculate Pricing
    // ===============================
    const subtotal = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    const deliveryFee = getDeliveryFee(district);

    const discount = 0;

    const grandTotal = subtotal + deliveryFee - discount;
    const totalAmount = subtotal; // For backward compatibility

    // ===============================
    // Generate Delivery Address
    // ===============================
    const deliveryAddress = [
      streetAddress.trim(),
      city.trim(),
      district.trim(),
      postalCode.trim(),
    ]
      .filter(Boolean)
      .join(", ");

    // Save order
    const order = await Order.create({
      userId: user._id,
      customerName: customerName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      deliveryAddress,
      streetAddress: streetAddress.trim(),
      city: city.trim(),
      district: district.trim(),
      postalCode: postalCode.trim(),
      deliveryNotes: deliveryNotes ? deliveryNotes.trim() : "",
      items,
      subtotal,
      deliveryFee,
      discount,
      grandTotal,
      totalAmount,
      paymentMethod,
      orderStatus: "Pending",
    });

    // ===============================
    // Reduce Product Stock
    // ===============================
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(
        item.productId._id,
        {
          $inc: {
            stock: -item.quantity,
          },
        }
      );
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    return res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      order,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to place order.",
    });
  }
};

// ===============================
// Get Single Order
// ===============================
export const getOrderById = async (req, res) => {
  try {
    const user = req.user;
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (user.role === "Admin") {
      return res.status(200).json({
        success: true,
        order,
      });
    }

    if (order.userId.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this order.",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to load order.",
    });
  }
};

// ===============================
// Get My Orders
// ===============================
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to load orders.",
    });
  }
};

// ===============================
// Get All Orders (Admin)
// ===============================
export const getAllOrders = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const search = req.query.search?.trim() || "";
    const status = req.query.status || "All";

    const query = {};

    // Search
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    // Status Filter
    if (status !== "All") {
      query.orderStatus = status;
    }

    const totalOrders = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalPages = Math.ceil(totalOrders / limit);

    return res.status(200).json({
      success: true,
      orders,
      totalOrders,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to load orders.",
    });
  }
};

// ===============================
// Update Order Status (Admin)
// ===============================
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    const statusTransitionMap = {
      Pending: ["Pending", "Processing", "Cancelled"],
      Processing: ["Processing", "Shipped", "Cancelled"],
      Shipped: ["Shipped", "Delivered"],
      Delivered: ["Delivered"],
      Cancelled: ["Cancelled"],
    };

    const allowedStatuses = statusTransitionMap[order.orderStatus] || [];

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status transition.",
      });
    }

    order.orderStatus = orderStatus;

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      order,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update order status.",
    });
  }
};

// ===============================
// Cancel Order (Customer)
// ===============================
export const cancelOrder = async (req, res) => {
  try {
    const user = req.user;
    const { orderId } = req.params;

    // Find order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    // Check if order belongs to the user
    if (order.userId.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this order.",
      });
    }

    // Check if order can be cancelled
    const cancellableStatuses = ["Pending", "Processing"];
    if (!cancellableStatuses.includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.orderStatus}. Orders can only be cancelled if they are Pending or Processing.`,
      });
    }

    // Restore stock for all products
    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        try {
          await Product.findByIdAndUpdate(
            item.productId,
            { $inc: { stock: item.quantity } },
            { new: true }
          );
        } catch (stockError) {
          console.error(`Failed to restore stock for product ${item.productId}:`, stockError);
        }
      }
    }

    // Update order status to Cancelled
    order.orderStatus = "Cancelled";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully. Stock has been restored.",
      order,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel order.",
    });
  }
};