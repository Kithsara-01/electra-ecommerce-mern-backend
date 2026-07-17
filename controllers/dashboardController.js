import Product from "../models/product.js";
import User from "../models/user.js";
import Order from "../models/order.js";

export const getDashboardStats = async (req, res) => {
  try {
    const [
        totalProducts,
        totalCustomers,
        totalOrders,
        pendingOrders,
        lowStockProducts,
        revenueResult,
        latestOrders,
        lowStockItems,
        ] = await Promise.all([
      Product.countDocuments(),

      User.countDocuments({
        role: "Customer",
      }),

      Order.countDocuments(),

      Order.countDocuments({
        orderStatus: "Pending",
      }),

      Product.countDocuments({
        stock: { $gt: 0, $lte: 5 },
      }),

      Order.aggregate([
        {
          $match: {
            orderStatus: {
              $ne: "Cancelled",
            },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: "$grandTotal",
            },
          },
        },
      ]),

      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("customerName grandTotal orderStatus createdAt"),
                    Product.find({
            stock: { $gt: 0, $lte: 5 },
            })
            .sort({ stock: 1 })
            .limit(5)
            .select("name stock"),
    ]);

    return res.status(200).json({
      success: true,

      stats: {
        totalProducts,
        totalCustomers,
        totalOrders,
        pendingOrders,
        lowStockProducts,
        totalRevenue:
          revenueResult.length > 0
            ? revenueResult[0].totalRevenue
            : 0,
      },

      latestOrders,
      lowStockItems,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard statistics",
    });
  }
};