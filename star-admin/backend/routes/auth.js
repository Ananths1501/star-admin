const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")
const { verifyToken, checkRole } = require("../middleware/auth")

// Admin login
router.post("/admin/login", authController.adminLogin)

// Register new admin (superadmin only)
router.post("/admin/register", verifyToken, checkRole("superadmin"), authController.registerAdmin)

// Get current admin profile
router.get("/admin/profile", verifyToken, authController.getProfile)

// Update admin profile
router.put("/admin/profile", verifyToken, authController.updateProfile)

// Change password
router.put("/admin/change-password", verifyToken, authController.changePassword)

module.exports = router
