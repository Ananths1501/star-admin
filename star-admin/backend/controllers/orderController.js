const Order = require("../models/Order")
const Product = require("../models/Product")
const User = require("../models/User") // Make sure User model is imported

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const { startDate, endDate, status, search, sortBy, order, customerPhone, customerName } = req.query
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

    // Customer phone filter
    if (customerPhone) {
      filter.customerPhone = { $regex: customerPhone, $options: "i" }
    }

    // Customer name filter
    if (customerName) {
      filter.customer = { $regex: customerName, $options: "i" }
    }

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
    const { items, customer, customerPhone, paymentMethod, orderType } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in bill" })
    }

    // Calculate total amount and validate items
    let totalAmount = 0
    const orderItems = []

    for (const item of items) {
      // Find product by ID
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

    // Generate a unique order number
    const currentDate = new Date()
    const year = currentDate.getFullYear().toString().slice(-2)
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0")
    const day = currentDate.getDate().toString().padStart(2, "0")
    const orderCount = await Order.countDocuments()
    const orderNumber = `ORD-${year}${month}${day}-${(orderCount + 1).toString().padStart(4, "0")}`

    // Create order without user (for walk-in customers)
    const order = new Order({
      orderNumber,
      items: orderItems,
      totalAmount,
      status: "Completed",
      customer: customer || "Walk-in Customer",
      customerPhone: customerPhone || "",
      paymentMethod: paymentMethod || "Cash",
      paymentStatus: "Paid",
      orderType: orderType || "In-Shop",
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
      sales: item.total, // Add this for chart compatibility
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
