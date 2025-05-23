backend/config/db.js
----------------------

const mongoose = require("mongoose")

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI)
    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`Error: ${error.message}`)
    process.exit(1)
  }
}

module.exports = connectDB
----------------------------------------------------------------------------
backend/controllers/admincontroller.js

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
      sales: item.totalSales,
      orders: item.count,
    }))

    res.json({
      counts: {
        products: productCount,
        orders: orderCount,
        services: serviceCount,
        workers: workerCount,
        admins: adminCount,
      },
      lowStockProducts,
      recentOrders,
      salesData: formattedSalesData,
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
----------------------------------------
backend/controllers/authController.js

const jwt = require("jsonwebtoken")
const Admin = require("../models/Admin")
const bcrypt = require("bcryptjs")

// Admin login
exports.adminLogin = async (req, res) => {
  try {
    const { adminId, password } = req.body

    // Simple hardcoded authentication for testing
    if (adminId === "admin" && password === "Admin@123") {
      return res.json({
        token: "test-token",
        admin: {
          id: "admin-id",
          adminId: "admin",
          name: "Admin User",
          email: "admin@example.com",
          role: "superadmin",
        },
      })
    }

    // If credentials don't match, return error
    return res.status(401).json({ message: "Invalid credentials" })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Register new admin (only for superadmin)
exports.registerAdmin = async (req, res) => {
  try {
    const { adminId, name, email, password, role } = req.body

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ $or: [{ adminId }, { email }] })
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists with this ID or email" })
    }

    // Create new admin
    const admin = new Admin({
      adminId,
      name,
      email,
      password,
      role: role || "admin",
    })

    await admin.save()

    res.status(201).json({ message: "Admin created successfully" })
  } catch (error) {
    console.error("Register error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get current admin profile
exports.getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select("-password")
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" })
    }
    res.json(admin)
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Update admin profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body

    const admin = await Admin.findById(req.admin._id)
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" })
    }

    // Update fields
    if (name) admin.name = name
    if (email) admin.email = email

    await admin.save()

    res.json({ message: "Profile updated successfully", admin })
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    const admin = await Admin.findById(req.admin._id)
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" })
    }

    // Check current password
    const isMatch = await admin.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" })
    }

    // Update password
    admin.password = newPassword
    await admin.save()

    res.json({ message: "Password updated successfully" })
  } catch (error) {
    console.error("Change password error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
------------------------------------------
backend/controllers/ordercontroller

const Order = require("../models/Order")
const Product = require("../models/Product")

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const { startDate, endDate, status, search, sortBy, order } = req.query
    const filter = {}

    // Date filter
    if (startDate || endDate) {
      filter.createdAt = {}
      if (startDate) filter.createdAt.$gte = new Date(startDate)
      if (endDate) {
        const endDateObj = new Date(endDate)
        endDateObj.setHours(23, 59, 59, 999)
        filter.createdAt.$lte = endDateObj
      }
    }

    // Status filter
    if (status) filter.status = status

    // Search by order number or customer
    if (search) {
      filter.$or = [{ orderNumber: { $regex: search, $options: "i" } }, { customer: { $regex: search, $options: "i" } }]
    }

    // Sorting
    const sortOptions = {}
    if (sortBy) {
      sortOptions[sortBy] = order === "desc" ? -1 : 1
    } else {
      sortOptions.createdAt = -1 // Default sort by newest
    }

    const orders = await Order.find(filter)
      .sort(sortOptions)
      .populate("user", "name email")
      .populate("items.product", "name brand image")

    res.json(orders)
  } catch (error) {
    console.error("Get orders error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone address")
      .populate("items.product", "name brand image productId")

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    res.json(order)
  } catch (error) {
    console.error("Get order error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body

    if (!status) {
      return res.status(400).json({ message: "Status is required" })
    }

    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    order.status = status
    await order.save()

    res.json({ message: "Order status updated", order })
  } catch (error) {
    console.error("Update order status error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Create bill (for walk-in customers)
exports.createBill = async (req, res) => {
  try {
    const { items, customer, paymentMethod } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in bill" })
    }

    // Calculate total amount and validate items
    let totalAmount = 0
    const orderItems = []

    for (const item of items) {
      const product = await Product.findById(item.product)

      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product}` })
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Not enough stock for ${product.name}` })
      }

      // Calculate price with discount
      const discountedPrice = product.price * (1 - product.discount / 100)
      const itemTotal = discountedPrice * item.quantity

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        discount: product.discount,
      })

      totalAmount += itemTotal

      // Update product stock
      product.stock -= item.quantity
      await product.save()
    }

    // Create order without user (for walk-in customers)
    const order = new Order({
      items: orderItems,
      totalAmount,
      status: "Completed",
      customer: customer || "Walk-in Customer",
      paymentMethod: paymentMethod || "Cash",
      paymentStatus: "Paid",
    })

    await order.save()

    res.status(201).json({
      message: "Bill created successfully",
      order: await Order.findById(order._id).populate("items.product", "name brand image"),
    })
  } catch (error) {
    console.error("Create bill error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get order statistics
exports.getOrderStats = async (req, res) => {
  try {
    // Get total orders count
    const totalOrders = await Order.countDocuments()

    // Get orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])

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

    // Get sales by date (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const salesByDate = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
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
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ])

    // Format sales by date
    const formattedSalesByDate = salesByDate.map((item) => ({
      date: `${item._id.year}-${item._id.month.toString().padStart(2, "0")}-${item._id.day.toString().padStart(2, "0")}`,
      total: item.total,
      count: item.count,
    }))

    res.json({
      totalOrders,
      ordersByStatus,
      totalSales: totalSales.length > 0 ? totalSales[0].total : 0,
      salesByDate: formattedSalesByDate,
    })
  } catch (error) {
    console.error("Get order stats error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}


-------------------------------------