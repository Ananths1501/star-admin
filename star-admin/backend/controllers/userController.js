const User = require("../models/User")
const Product = require("../models/Product")
const { generateVerificationCode } = require("../utils/helpers")

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body

    // Find user
    const user = await User.findById(req.user._id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Update fields
    if (name) user.name = name
    if (email) user.email = email
    if (phone) user.phone = phone
    if (address) user.address = address

    await user.save()

    res.json({ message: "Profile updated successfully", user: user })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Add to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body

    // Validate product exists
    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    // Find user
    const user = await User.findById(req.user._id)

    // Check if product already in cart
    const existingItem = user.cart.find((item) => item.productId.toString() === productId)

    if (existingItem) {
      // Update quantity
      existingItem.quantity += quantity || 1
    } else {
      // Add new item
      user.cart.push({ productId, quantity: quantity || 1 })
    }

    await user.save()

    // Populate cart items with product details
    const populatedUser = await User.findById(req.user._id).populate("cart.productId")

    res.json({ message: "Product added to cart", cart: populatedUser.cart })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Update cart item
exports.updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body

    // Find user
    const user = await User.findById(req.user._id)

    // Find cart item
    const cartItem = user.cart.find((item) => item.productId.toString() === productId)

    if (!cartItem) {
      return res.status(404).json({ message: "Item not found in cart" })
    }

    // Update quantity or remove if quantity is 0
    if (quantity > 0) {
      cartItem.quantity = quantity
    } else {
      user.cart = user.cart.filter((item) => item.productId.toString() !== productId)
    }

    await user.save()

    // Populate cart items with product details
    const populatedUser = await User.findById(req.user._id).populate("cart.productId")

    res.json({ message: "Cart updated", cart: populatedUser.cart })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get cart
exports.getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("cart.productId")

    res.json(user.cart)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    user.cart = []
    await user.save()

    res.json({ message: "Cart cleared" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Generate verification code for registration
exports.generateCode = async (req, res) => {
  try {
    const { email, phone } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email or phone", userExists: true })
    }

    // Generate verification code
    const code = generateVerificationCode()

    // In a real app, you would send this code via SMS or email
    // For demo purposes, we'll just return it

    res.json({ message: "Verification code generated", code })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
