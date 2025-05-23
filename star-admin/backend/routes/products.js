const express = require("express")
const router = express.Router()
const productController = require("../controllers/productController")
const { verifyToken } = require("../middleware/auth")
const upload = require("../middleware/upload")

// Public routes
router.get("/", productController.getAllProducts)
router.get("/types", productController.getProductTypes)
router.get("/brands", productController.getProductBrands)
router.get("/:id", productController.getProductById)

// Protected routes
router.use(verifyToken)

// Add new product
router.post("/", upload.single("image"), productController.addProduct)

// Update product
router.put("/:id", upload.single("image"), productController.updateProduct)

// Update stock
router.patch("/:id/stock", productController.updateStock)

// Delete product
router.delete("/:id", productController.deleteProduct)

module.exports = router
