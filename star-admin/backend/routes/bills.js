const express = require("express")
const router = express.Router()
const billController = require("../controllers/billController")
const { verifyToken } = require("../middleware/auth")

// All routes require authentication
router.use(verifyToken)

// Create a new bill
router.post("/", billController.createBill)

// Get all bills
router.get("/", billController.getAllBills)

// Get bill by ID
router.get("/:id", billController.getBillById)

module.exports = router
