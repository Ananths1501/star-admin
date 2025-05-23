const Product = require("../models/Product")
const Order = require("../models/Order")
const { Service, Worker } = require("../models/Service")
const Admin = require("../models/Admin")

// Get dashboard data
exports.getDashboardData = async (req, res) => {
  try {
    // Count documents
    const productCount = await Product.countDocuments()
    const orderCount = await Order.countDocuments()
    const serviceCount = await Service.countDocuments()
    const workerCount = await Worker.countDocuments()
    const adminCount = await Admin.countDocuments()

    // Get low stock products
    const lowStockProducts = await Product.find({
      $expr: { $lte: ["$stock", "$minStock"] },
    }).limit(5)

    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email")
      .populate("items.product", "name brand")

    // Get sales data for chart
    const today = new Date()
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())

    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: lastMonth },
          status: { $ne: "Cancelled" },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          totalSales: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ])

    // Format sales data for chart
    const formattedSalesData = salesData.map((item) => ({
      date: `${item._id.year}-${item._id.month.toString().padStart(2, "0")}-${item._id.day.toString().padStart(2, "0")}`,
      sales: item.totalSales || 0,
      orders: item.count || 0,
    }))

    res.json({
      counts: {
        products: productCount || 0,
        orders: orderCount || 0,
        services: serviceCount || 0,
        workers: workerCount || 0,
        admins: adminCount || 0,
      },
      lowStockProducts: lowStockProducts || [],
      recentOrders: recentOrders || [],
      salesData: formattedSalesData || [],
    })
  } catch (error) {
    console.error("Dashboard data error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get all admins (superadmin only)
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select("-password")
    res.json(admins)
  } catch (error) {
    console.error("Get admins error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Generate unique product ID
exports.generateProductId = async (req, res) => {
  try {
    const { name } = req.body

    if (!name) {
      return res.status(400).json({ message: "Product name is required" })
    }

    // Extract first 3 characters of name and convert to uppercase
    const prefix = name.substring(0, 3).toUpperCase()

    // Generate random 4-digit number
    const randomNum = Math.floor(1000 + Math.random() * 9000)

    // Create potential productId
    const potentialId = `${prefix}${randomNum}`

    // Check if this ID already exists
    const existingProduct = await Product.findOne({ productId: potentialId })

    if (existingProduct) {
      // If exists, generate a new one
      return this.generateProductId(req, res)
    }

    res.json({ productId: potentialId })
  } catch (error) {
    console.error("Generate product ID error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get system stats
exports.getSystemStats = async (req, res) => {
  try {
    // Get total sales
    const totalSales = await Order.aggregate([
      {
        $match: { status: { $ne: "Cancelled" } },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ])

    // Get sales by product type
    const salesByType = await Order.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $group: {
          _id: "$productInfo.type",
          total: {
            $sum: {
              $multiply: ["$items.quantity", "$items.price", { $subtract: [1, { $divide: ["$items.discount", 100] }] }],
            },
          },
        },
      },
      { $sort: { total: -1 } },
    ])

    // Get top selling products
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalQuantity: { $sum: "$items.quantity" },
          totalSales: {
            $sum: {
              $multiply: ["$items.quantity", "$items.price", { $subtract: [1, { $divide: ["$items.discount", 100] }] }],
            },
          },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $project: {
          _id: 1,
          name: "$productInfo.name",
          brand: "$productInfo.brand",
          type: "$productInfo.type",
          totalQuantity: 1,
          totalSales: 1,
        },
      },
    ])

    res.json({
      totalSales: totalSales.length > 0 ? totalSales[0].total : 0,
      salesByType,
      topProducts,
    })
  } catch (error) {
    console.error("System stats error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
