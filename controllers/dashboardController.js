import Product from "../models/product.js";
import User from "../models/user.js";
import Order from "../models/order.js";
import ContactMessage from "../models/contactMessage.js";

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

            productName: {
              $first: "$items.name",
            },

            productImage: {
              $first: "$items.image",
            },

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
          $unwind: {
            path: "$product",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,

            name: "$productName",

            image: {
              $ifNull: [
                "$productImage",
                {
                  $arrayElemAt: ["$product.images", 0],
                },
              ],
            },

            stock: "$product.stock",

            totalSold: 1,
          },
        },
      ]),
    ]);

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

export const getRevenueAnalytics = async (req, res) => {
  try {
    const today = new Date();

    const { filter = "monthly" } = req.query;

    today.setHours(0, 0, 0, 0);

    const [
      revenueResult,
      totalOrders,
      todayRevenueResult,
      productRevenue,
      monthlyRevenue,
    ] = await Promise.all([
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

      // Total Orders
      Order.countDocuments({
        orderStatus: {
          $ne: "Cancelled",
        },
      }),

      // Today's Revenue
      Order.aggregate([
        {
          $match: {
            orderStatus: {
              $ne: "Cancelled",
            },
            createdAt: {
              $gte: today,
            },
          },
        },
        {
          $group: {
            _id: null,
            todayRevenue: {
              $sum: "$grandTotal",
            },
          },
        },
      ]),

      // Product Revenue
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
            productName: {
              $first: "$items.name",
            },
            quantitySold: {
              $sum: "$items.quantity",
            },
            revenue: {
              $sum: {
                $multiply: [
                  "$items.quantity",
                  "$items.price",
                ],
              },
            },
          },
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
          $unwind: {
            path: "$product",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $sort: {
            revenue: -1,
          },
        },
        {
          $project: {
            _id: 1,
            name: "$productName",
            image: {
                $ifNull: [
                  {
                    $arrayElemAt: ["$product.images", 0],
                  },
                  "",
                ],
              },
            unitPrice: {
              $ifNull: ["$product.price", 0],
            },
            quantitySold: 1,
            revenue: 1,
          },
        },
      ]),

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
            _id:
              filter === "daily"
                ? {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" },
                    day: { $dayOfMonth: "$createdAt" },
                  }
                : {
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
            "_id.day": 1,
          },
        },
      ]),
    ]);

    const totalRevenue =
      revenueResult.length > 0
        ? revenueResult[0].totalRevenue
        : 0;

    const productRevenueWithPercentage = productRevenue.map((item) => ({
      ...item,
      revenuePercentage:
        totalRevenue > 0
          ? Number(((item.revenue / totalRevenue) * 100).toFixed(2))
          : 0,
    }));

    let chartData = [];

      const currentDate = new Date();

      if (filter === "daily") {
        for (let i = 6; i >= 0; i--) {
          const date = new Date(currentDate);

          date.setDate(currentDate.getDate() - i);

          const existing = monthlyRevenue.find(
            (item) =>
              item._id.year === date.getFullYear() &&
              item._id.month === date.getMonth() + 1 &&
              item._id.day === date.getDate()
          );

          chartData.push({
            month: date.toLocaleDateString("en", {
              day: "2-digit",
              month: "short",
            }),
            revenue: existing ? existing.revenue : 0,
          });
        }
      } else {
        for (let i = 5; i >= 0; i--) {
          const date = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - i,
            1
          );

          const existing = monthlyRevenue.find(
            (item) =>
              item._id.month === date.getMonth() + 1 &&
              item._id.year === date.getFullYear()
          );

          chartData.push({
            month: date.toLocaleString("en", {
              month: "short",
            }),
            revenue: existing ? existing.revenue : 0,
          });
        }
      }

    return res.status(200).json({
      success: true,

      summary: {
        totalRevenue,

        todayRevenue:
          todayRevenueResult.length > 0
            ? todayRevenueResult[0].todayRevenue
            : 0,

        totalOrders,
      },

     monthlyRevenue: chartData,

      productRevenue: productRevenueWithPercentage,
    });
  } catch (error) {
    console.error("Revenue Analytics Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load revenue analytics",
    });
  }
};

export const getNotificationCounts = async (req, res) => {
  try {
    const [
      pendingOrders,
      lowStockProducts,
      outOfStockProducts,
      unreadMessages,
    ] = await Promise.all([
      Order.countDocuments({
        orderStatus: "Pending",
      }),

      Product.countDocuments({
        stock: {
          $gt: 0,
          $lte: 5,
        },
      }),

      Product.countDocuments({
        stock: 0,
      }),

      ContactMessage.countDocuments({
        isRead: false,
      }),
    ]);

    return res.status(200).json({
      success: true,
      notifications: {
        pendingOrders,
        lowStockProducts,
        outOfStockProducts,
        unreadMessages,
      },
    });
  } catch (error) {
    console.error("Notification Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load notifications.",
    });
  }
};