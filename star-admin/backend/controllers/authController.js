const jwt = require("jsonwebtoken")
const Admin = require("../models/Admin")
const bcrypt = require("bcryptjs")

// Admin login
exports.adminLogin = async (req, res) => {
  try {
    const { adminId, password } = req.body

    // Simple hardcoded authentication for testing
    if (adminId === "admin" && password === "Admin@123") {
      return res.json({
        token: "test-token",
        admin: {
          id: "admin-id",
          adminId: "admin",
          name: "Admin User",
          email: "admin@example.com",
          role: "superadmin",
        },
      })
    }

    // If credentials don't match, return error
    return res.status(401).json({ message: "Invalid credentials" })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Register new admin (only for superadmin)
exports.registerAdmin = async (req, res) => {
  try {
    const { adminId, name, email, password, role } = req.body

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ $or: [{ adminId }, { email }] })
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists with this ID or email" })
    }

    // Create new admin
    const admin = new Admin({
      adminId,
      name,
      email,
      password,
      role: role || "admin",
    })

    await admin.save()

    res.status(201).json({ message: "Admin created successfully" })
  } catch (error) {
    console.error("Register error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get current admin profile
exports.getProfile = async (req, res) => {
  try {
    // Fix: Use adminId instead of _id for lookup
    // The error occurs because req.admin._id is "admin-id" which is not a valid ObjectId
    // Instead, we'll check if it's a valid ObjectId first

    let admin
    if (req.admin && req.admin._id) {
      // Check if _id is a valid ObjectId
      if (req.admin._id.match(/^[0-9a-fA-F]{24}$/)) {
        admin = await Admin.findById(req.admin._id).select("-password")
      } else {
        // If not a valid ObjectId, try to find by adminId
        admin = await Admin.findOne({ adminId: req.admin.adminId }).select("-password")
      }
    }

    if (!admin) {
      // For testing/development, return the hardcoded admin
      if (req.admin && req.admin.adminId === "admin") {
        return res.json({
          id: "admin-id",
          adminId: "admin",
          name: "Admin User",
          email: "admin@example.com",
          role: "superadmin",
        })
      }
      return res.status(404).json({ message: "Admin not found" })
    }
    res.json(admin)
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Update admin profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body

    // Fix: Similar to getProfile, handle non-ObjectId _id
    let admin
    if (req.admin._id.match(/^[0-9a-fA-F]{24}$/)) {
      admin = await Admin.findById(req.admin._id)
    } else {
      admin = await Admin.findOne({ adminId: req.admin.adminId })
    }

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" })
    }

    // Update fields
    if (name) admin.name = name
    if (email) admin.email = email

    await admin.save()

    res.json({ message: "Profile updated successfully", admin })
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    // Fix: Similar to getProfile, handle non-ObjectId _id
    let admin
    if (req.admin._id.match(/^[0-9a-fA-F]{24}$/)) {
      admin = await Admin.findById(req.admin._id)
    } else {
      admin = await Admin.findOne({ adminId: req.admin.adminId })
    }

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" })
    }

    // Check current password
    const isMatch = await admin.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" })
    }

    // Update password
    admin.password = newPassword
    await admin.save()

    res.json({ message: "Password updated successfully" })
  } catch (error) {
    console.error("Change password error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
