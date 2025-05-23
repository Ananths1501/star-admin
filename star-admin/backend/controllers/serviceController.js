const { Service, Worker } = require("../models/Service")
const upload = require("../middleware/upload")
const fs = require("fs")
const path = require("path")

// Get all services
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find().populate("workers")
    res.json(services)
  } catch (error) {
    console.error("Get services error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get service by ID
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate("workers")

    if (!service) {
      return res.status(404).json({ message: "Service not found" })
    }

    res.json(service)
  } catch (error) {
    console.error("Get service error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Add new service
exports.addService = async (req, res) => {
  try {
    const { serviceType, description } = req.body

    // Check if service already exists
    const existingService = await Service.findOne({ serviceType })
    if (existingService) {
      return res.status(400).json({ message: "Service type already exists" })
    }

    // Create image path
    let imagePath = "/placeholder-service.jpg"
    if (req.file) {
      // Ensure frontend uploads directory exists
      const frontendUploadsDir = path.join(__dirname, "../../frontend/uploads")
      if (!fs.existsSync(frontendUploadsDir)) {
        fs.mkdirSync(frontendUploadsDir, { recursive: true })
      }

      // Copy file to frontend uploads
      const sourceFile = path.join(__dirname, "../uploads", req.file.filename)
      const destFile = path.join(frontendUploadsDir, req.file.filename)

      fs.copyFileSync(sourceFile, destFile)
      imagePath = `/uploads/${req.file.filename}`
    }

    // Create new service
    const service = new Service({
      serviceType,
      description: description || "",
      image: imagePath,
      workers: [],
    })

    await service.save()

    res.status(201).json(service)
  } catch (error) {
    console.error("Add service error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Update service
exports.updateService = async (req, res) => {
  try {
    const { serviceType, description } = req.body

    const service = await Service.findById(req.params.id)

    if (!service) {
      return res.status(404).json({ message: "Service not found" })
    }

    // Update fields
    if (serviceType) service.serviceType = serviceType
    if (description !== undefined) service.description = description

    if (req.file) {
      // Delete previous image if it exists and is not a placeholder
      if (
        service.image &&
        !service.image.includes("placeholder") &&
        fs.existsSync(path.join(__dirname, "../../frontend", service.image))
      ) {
        fs.unlinkSync(path.join(__dirname, "../../frontend", service.image))
      }

      // Ensure frontend uploads directory exists
      const frontendUploadsDir = path.join(__dirname, "../../frontend/uploads")
      if (!fs.existsSync(frontendUploadsDir)) {
        fs.mkdirSync(frontendUploadsDir, { recursive: true })
      }

      // Copy file to frontend uploads
      const sourceFile = path.join(__dirname, "../uploads", req.file.filename)
      const destFile = path.join(frontendUploadsDir, req.file.filename)

      fs.copyFileSync(sourceFile, destFile)
      service.image = `/uploads/${req.file.filename}`
    }

    await service.save()

    res.json(service)
  } catch (error) {
    console.error("Update service error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Delete service
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id)

    if (!service) {
      return res.status(404).json({ message: "Service not found" })
    }

    // Delete service image if it exists and is not a placeholder
    if (service.image && !service.image.includes("placeholder")) {
      const imagePath = path.join(__dirname, "../../frontend", service.image)
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath)
      }
    }

    // Delete associated workers
    await Worker.deleteMany({ _id: { $in: service.workers } })

    res.json({ message: "Service deleted successfully" })
  } catch (error) {
    console.error("Delete service error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get all workers
exports.getAllWorkers = async (req, res) => {
  try {
    const workers = await Worker.find()
    res.json(workers)
  } catch (error) {
    console.error("Get workers error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get workers by service type
exports.getWorkersByService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate("workers")

    if (!service) {
      return res.status(404).json({ message: "Service not found" })
    }

    res.json(service.workers)
  } catch (error) {
    console.error("Get workers by service error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Add new worker
exports.addWorker = async (req, res) => {
  try {
    const { name, phone, address, serviceType, feesPerDay, status } = req.body

    // Check if service exists
    const service = await Service.findOne({ serviceType })

    if (!service) {
      return res.status(404).json({ message: "Service type not found" })
    }

    // Create image path
    let imagePath = "/placeholder-worker.jpg"
    if (req.file) {
      // Ensure frontend uploads directory exists
      const frontendUploadsDir = path.join(__dirname, "../../frontend/uploads")
      if (!fs.existsSync(frontendUploadsDir)) {
        fs.mkdirSync(frontendUploadsDir, { recursive: true })
      }

      // Copy file to frontend uploads
      const sourceFile = path.join(__dirname, "../uploads", req.file.filename)
      const destFile = path.join(frontendUploadsDir, req.file.filename)

      fs.copyFileSync(sourceFile, destFile)
      imagePath = `/uploads/${req.file.filename}`
    }

    // Create new worker
    const worker = new Worker({
      name,
      phone,
      address,
      serviceType,
      feesPerDay,
      status: status || "Available",
      image: imagePath,
    })

    await worker.save()

    // Add worker to service
    service.workers.push(worker._id)
    await service.save()

    res.status(201).json(worker)
  } catch (error) {
    console.error("Add worker error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Update worker
exports.updateWorker = async (req, res) => {
  try {
    const { name, phone, address, serviceType, feesPerDay, status } = req.body

    const worker = await Worker.findById(req.params.id)

    if (!worker) {
      return res.status(404).json({ message: "Worker not found" })
    }

    // If service type is changing, update service references
    if (serviceType && serviceType !== worker.serviceType) {
      // Remove worker from old service
      const oldService = await Service.findOne({ serviceType: worker.serviceType })
      if (oldService) {
        oldService.workers = oldService.workers.filter((w) => w.toString() !== worker._id.toString())
        await oldService.save()
      }

      // Add worker to new service
      const newService = await Service.findOne({ serviceType })
      if (newService) {
        newService.workers.push(worker._id)
        await newService.save()
      } else {
        return res.status(404).json({ message: "New service type not found" })
      }
    }

    // Update worker fields
    if (name) worker.name = name
    if (phone) worker.phone = phone
    if (address) worker.address = address
    if (serviceType) worker.serviceType = serviceType
    if (feesPerDay) worker.feesPerDay = feesPerDay
    if (status) worker.status = status

    if (req.file) {
      // Delete previous image if it exists and is not a placeholder
      if (
        worker.image &&
        !worker.image.includes("placeholder") &&
        fs.existsSync(path.join(__dirname, "../../frontend", worker.image))
      ) {
        fs.unlinkSync(path.join(__dirname, "../../frontend", worker.image))
      }

      // Ensure frontend uploads directory exists
      const frontendUploadsDir = path.join(__dirname, "../../frontend/uploads")
      if (!fs.existsSync(frontendUploadsDir)) {
        fs.mkdirSync(frontendUploadsDir, { recursive: true })
      }

      // Copy file to frontend uploads
      const sourceFile = path.join(__dirname, "../uploads", req.file.filename)
      const destFile = path.join(frontendUploadsDir, req.file.filename)

      fs.copyFileSync(sourceFile, destFile)
      worker.image = `/uploads/${req.file.filename}`
    }

    await worker.save()

    res.json(worker)
  } catch (error) {
    console.error("Update worker error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Delete worker
exports.deleteWorker = async (req, res) => {
  try {
    const worker = await Worker.findByIdAndDelete(req.params.id)

    if (!worker) {
      return res.status(404).json({ message: "Worker not found" })
    }

    // Delete worker image if it exists and is not a placeholder
    if (worker.image && !worker.image.includes("placeholder")) {
      const imagePath = path.join(__dirname, "../../frontend", worker.image)
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath)
      }
    }

    // Remove worker from service
    const service = await Service.findOne({ serviceType: worker.serviceType })
    if (service) {
      service.workers = service.workers.filter((w) => w.toString() !== worker._id.toString())
      await service.save()
    }

    res.json({ message: "Worker deleted successfully" })
  } catch (error) {
    console.error("Delete worker error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
