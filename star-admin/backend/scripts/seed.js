require("dotenv").config()
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const Admin = require("../models/Admin")

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("Connected to MongoDB")

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ adminId: "admin" })
    if (existingAdmin) {
      console.log("Admin user already exists")
      return
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash("Admin@123", 10)
    const admin = new Admin({
      adminId: "admin",
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      role: "superadmin",
    })

    await admin.save()
    console.log("Admin user created successfully")
  } catch (error) {
    console.error("Error seeding admin:", error)
  } finally {
    await mongoose.disconnect()
    console.log("Disconnected from MongoDB")
  }
}

seedAdmin()
