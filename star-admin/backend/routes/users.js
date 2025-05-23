const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController")
const { verifyToken } = require("../middlewares/auth")

// Generate verification code for registration
router.post("/generate-code", userController.generateCode)

// Protected routes (require authentication)
router.use(verifyToken)

// Get user profile
router.get("/profile", userController.getUserProfile)

// Update user profile
router.put("/profile", userController.updateUserProfile)

// Cart routes
router.get("/cart", userController.getCart)
router.post("/cart", userController.addToCart)
router.put("/cart", userController.updateCartItem)
router.delete("/cart", userController.clearCart)

module.exports = router
