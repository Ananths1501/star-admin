const Product = require("../models/Product")
const { generateProductId } = require("../utils/helpers")
const fs = require("fs")
const path = require("path")

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const { type, brand, minPrice, maxPrice, search, sortBy, order } = req.query
    const filter = {}

    // Apply filters
    if (type) filter.type = type
    if (brand) filter.brand = brand
    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = Number(minPrice)
      if (maxPrice) filter.price.$lte = Number(maxPrice)
    }

    // Search by name, brand, or type
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { type: { $regex: search, $options: "i" } },
        { productId: { $regex: search, $options: "i" } },
      ]
    }

    // Sorting
    const sortOptions = {}
    if (sortBy) {
      sortOptions[sortBy] = order === "desc" ? -1 : 1
    } else {
      sortOptions.createdAt = -1 // Default sort by newest
    }

    const products = await Product.find(filter).sort(sortOptions)
    res.json(products)
  } catch (error) {
    console.error("Get products error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }
    res.json(product)
  } catch (error) {
    console.error("Get product error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Add new product
exports.addProduct = async (req, res) => {
  try {
    const { name, brand, type, price, discount, stock, minStock, description, warranty, productId } = req.body

    // Generate product ID if not provided
    const finalProductId = productId || (await generateProductId(type, name))

    // Check if product with same name already exists
    const existingProduct = await Product.findOne({ name })
    if (existingProduct) {
      return res.status(400).json({ message: "Product with this name already exists" })
    }

    // Create image path
    let imagePath = "/placeholder-product.jpg"
    if (req.file) {
      // Ensure frontend uploads directory exists
      const frontendUploadsDir = path.join(__dirname, "../../frontend/uploads")
      if (!fs.existsSync(frontendUploadsDir)) {
        fs.mkdirSync(frontendUploadsDir, { recursive: true })
      }

      // Copy file to frontend uploads
      const sourceFile = path.join(__dirname, "../uploads", req.file.filename)
      const destFile = path.join(frontendUploadsDir, req.file.filename)

      fs.copyFileSync(sourceFile, destFile)
      imagePath = `/uploads/${req.file.filename}`
    }

    // Create new product
    const product = new Product({
      productId: finalProductId,
      name,
      brand,
      type,
      price,
      discount: discount || 0,
      stock,
      minStock,
      description,
      warranty: warranty || 0,
      image: imagePath,
    })

    await product.save()
    res.status(201).json(product)
  } catch (error) {
    console.error("Add product error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { name, brand, type, price, discount, stock, minStock, description, warranty } = req.body

    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    // Update product fields
    if (name) product.name = name
    if (brand) product.brand = brand
    if (type) product.type = type
    if (price) product.price = price
    if (discount !== undefined) product.discount = discount
    if (stock !== undefined) product.stock = stock
    if (minStock !== undefined) product.minStock = minStock
    if (description) product.description = description
    if (warranty !== undefined) product.warranty = warranty

    if (req.file) {
      // Delete previous image if it exists and is not a placeholder
      if (
        product.image &&
        !product.image.includes("placeholder") &&
        fs.existsSync(path.join(__dirname, "../../frontend", product.image))
      ) {
        fs.unlinkSync(path.join(__dirname, "../../frontend", product.image))
      }

      // Ensure frontend uploads directory exists
      const frontendUploadsDir = path.join(__dirname, "../../frontend/uploads")
      if (!fs.existsSync(frontendUploadsDir)) {
        fs.mkdirSync(frontendUploadsDir, { recursive: true })
      }

      // Copy file to frontend uploads
      const sourceFile = path.join(__dirname, "../uploads", req.file.filename)
      const destFile = path.join(frontendUploadsDir, req.file.filename)

      fs.copyFileSync(sourceFile, destFile)
      product.image = `/uploads/${req.file.filename}`
    }

    await product.save()
    res.json(product)
  } catch (error) {
    console.error("Update product error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    // Delete product image if it exists and is not a placeholder
    if (product.image && !product.image.includes("placeholder")) {
      const imagePath = path.join(__dirname, "../../frontend", product.image)
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath)
      }
    }

    res.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Delete product error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get product types
exports.getProductTypes = async (req, res) => {
  try {
    const types = await Product.distinct("type")
    res.json(types)
  } catch (error) {
    console.error("Get product types error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get product brands
exports.getProductBrands = async (req, res) => {
  try {
    const brands = await Product.distinct("brand")
    res.json(brands)
  } catch (error) {
    console.error("Get product brands error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Update stock
exports.updateStock = async (req, res) => {
  try {
    const { stock, minStock } = req.body

    if (stock === undefined && minStock === undefined) {
      return res.status(400).json({ message: "Stock or minStock value is required" })
    }

    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    if (stock !== undefined) product.stock = Number(stock)
    if (minStock !== undefined) product.minStock = Number(minStock)

    await product.save()

    res.json({ message: "Stock updated successfully", product })
  } catch (error) {
    console.error("Update stock error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
