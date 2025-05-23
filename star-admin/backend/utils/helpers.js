// Generate a unique product ID based on product type and name
exports.generateProductId = async (type, name) => {
  const Product = require("../models/Product")

  // Get the first letter of the type (or 'P' if type is not provided)
  const typePrefix = type ? type.charAt(0).toUpperCase() : "P"

  // Count existing products of this type to determine the sequence number
  const count = await Product.countDocuments({ type })

  // Generate a 4-digit sequence number
  const sequenceNumber = (count + 1).toString().padStart(4, "0")

  // Combine to create the product ID
  return `${typePrefix}${sequenceNumber}`
}

// Other helper functions can be added here
