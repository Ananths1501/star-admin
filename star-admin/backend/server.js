require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const path = require("path")
const morgan = require("morgan")
const authRoutes = require("./routes/auth")
const adminRoutes = require("./routes/admin")
const productRoutes = require("./routes/products")
const orderRoutes = require("./routes/orders")
const serviceRoutes = require("./routes/services")
const billRoutes = require("./routes/bills")
const { errorHandler } = require("./middleware/errorHandler")

const app = express()

app.use(morgan("dev")); 
// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/products", productRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/services", serviceRoutes)
app.use("/api/bills", billRoutes)

// Create uploads directory if it doesn't exist
const fs = require("fs")
const uploadDir = path.join(__dirname, "uploads")
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Create frontend uploads directory if it doesn't exist
const frontendUploadsDir = path.join(__dirname, "../frontend/uploads")
if (!fs.existsSync(frontendUploadsDir)) {
  fs.mkdirSync(frontendUploadsDir, { recursive: true })
}

// Error handling middleware
app.use(errorHandler)

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" })
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
