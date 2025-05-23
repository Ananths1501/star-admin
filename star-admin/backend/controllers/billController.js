const Bill = require("../models/Bill")
const Product = require("../models/Product")

// Create a new bill
exports.createBill = async (req, res) => {
  try {
    const { items, customer, paymentMethod } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in bill" })
    }

    // Calculate total amount and validate items
    let totalAmount = 0
    const billItems = []

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

      billItems.push({
        product: product._id,
        productName: product.name,
        productBrand: product.brand,
        quantity: item.quantity,
        price: product.price,
        discount: product.discount,
        total: itemTotal,
      })

      totalAmount += itemTotal
    }

    // Create bill
    const bill = new Bill({
      items: billItems,
      totalAmount,
      customer: customer || "Walk-in Customer",
      paymentMethod: paymentMethod || "Cash",
    })

    await bill.save()

    res.status(201).json({
      message: "Bill created successfully",
      bill,
    })
  } catch (error) {
    console.error("Create bill error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get all bills
exports.getAllBills = async (req, res) => {
  try {
    const bills = await Bill.find().sort({ createdAt: -1 })
    res.json(bills)
  } catch (error) {
    console.error("Get bills error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get bill by ID
exports.getBillById = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
    if (!bill) {
      return res.status(404).json({ message: "Bill not found" })
    }
    res.json(bill)
  } catch (error) {
    console.error("Get bill error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
