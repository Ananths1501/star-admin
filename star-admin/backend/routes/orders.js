const express = require("express")
const router = express.Router()
const orderController = require("../controllers/orderController")
const { verifyToken } = require("../middleware/auth")

// All routes require authentication
router.use(verifyToken)

// Get all orders
router.get("/", orderController.getAllOrders)

// Get order by ID
router.get("/:id", orderController.getOrderById)

// Update order status
router.put("/:id/status", orderController.updateOrderStatus)

// Create bill (for walk-in customers)
router.post("/bill", orderController.createBill)

// Get order statistics
router.get("/stats/summary", orderController.getOrderStats)

module.exports = router
