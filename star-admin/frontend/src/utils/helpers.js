const Product = require("../models/Product")

// Generate unique product ID based on name
exports.generateProductId = async (name) => {
  try {
    // Extract first 3 characters of name and convert to uppercase
    const prefix = name.substring(0, 3).toUpperCase()

    // Generate random 4-digit number
    const randomNum = Math.floor(1000 + Math.random() * 9000)

    // Create potential productId
    const potentialId = `${prefix}${randomNum}`

    // Check if this ID already exists
    const existingProduct = await Product.findOne({ productId: potentialId })

    // If exists, recursively try again
    if (existingProduct) {
      return this.generateProductId(name)
    }

    return potentialId
  } catch (error) {
    console.error("Error generating product ID:", error)
    throw error
  }
}

// Format date to YYYY-MM-DD
exports.formatDate = (date) => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

// Calculate discounted price
exports.calculateDiscountedPrice = (price, discount) => {
  return price * (1 - discount / 100)
}
