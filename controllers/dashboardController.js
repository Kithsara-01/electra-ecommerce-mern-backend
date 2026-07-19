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
      monthlyRevenue,
      topSellingProducts,
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

      // Total Revenue
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

      // Latest Orders
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("customerName grandTotal orderStatus createdAt"),

      // Low Stock Products
      Product.find({
        stock: { $gt: 0, $lte: 5 },
      })
        .sort({ stock: 1 })
        .limit(5)
        .select("name stock"),

      // Monthly Revenue
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
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            revenue: {
              $sum: "$grandTotal",
            },
          },
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
          },
        },
      ]),

      // Top Selling Products
Order.aggregate([
  {
    $match: {
      orderStatus: {
        $ne: "Cancelled",
      },
    },
  },
  {
    $unwind: "$items",
  },
  {
    $group: {
      _id: "$items.productId",
      totalSold: {
        $sum: "$items.quantity",
      },
    },
  },
  {
    $sort: {
      totalSold: -1,
    },
  },
  {
    $limit: 5,
  },
  {
    $lookup: {
      from: "products",
      localField: "_id",
      foreignField: "_id",
      as: "product",
    },
  },
  {
    $unwind: "$product",
  },
  {
    $project: {
      _id: 1,
      totalSold: 1,
      name: "$product.name",
      stock: "$product.stock",
      image: "$product.image",
      price: "$product.price",
    },
  },
]),
    ]);

    // Last 6 months revenue (fill missing months with 0)
const last6Months = [];

const currentDate = new Date();

for (let i = 5; i >= 0; i--) {
  const date = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - i,
    1
  );

  const month = date.toLocaleString("en", {
    month: "short",
  });

  const year = date.getFullYear();

  const existingMonth = monthlyRevenue.find(
    (item) =>
      item._id.month === date.getMonth() + 1 &&
      item._id.year === year
  );

  last6Months.push({
    month,
    year,
    revenue: existingMonth ? existingMonth.revenue : 0,
  });
}

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

      monthlyRevenue: last6Months,

      topSellingProducts,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard statistics",
    });
  }
};