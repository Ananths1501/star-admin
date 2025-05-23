const express = require("express")
const router = express.Router()
const serviceController = require("../controllers/serviceController")
const { verifyToken } = require("../middleware/auth")
const upload = require("../middleware/upload")

// Public routes
router.get("/", serviceController.getAllServices)
router.get("/:id", serviceController.getServiceById)
router.get("/:id/workers", serviceController.getWorkersByService)
router.get("/workers/all", serviceController.getAllWorkers)

// Protected routes
router.use(verifyToken)

// Service routes
router.post("/", upload.single("image"), serviceController.addService)
router.put("/:id", upload.single("image"), serviceController.updateService)
router.delete("/:id", serviceController.deleteService)

// Worker routes
router.post("/workers", upload.single("image"), serviceController.addWorker)
router.put("/workers/:id", upload.single("image"), serviceController.updateWorker)
router.delete("/workers/:id", serviceController.deleteWorker)

module.exports = router
