const express = require("express")
const router = express.Router()
const adminController = require("../controllers/adminController")
const { verifyToken, checkRole } = require("../middleware/auth")

// All routes require admin authentication
router.use(verifyToken)

// Dashboard data
router.get("/dashboard", adminController.getDashboardData)

// Get all admins (superadmin only)
router.get("/admins", checkRole("superadmin"), adminController.getAllAdmins)

// Generate product ID
router.post("/generate-product-id", adminController.generateProductId)

// Get system stats
router.get("/stats", adminController.getSystemStats)

module.exports = router
