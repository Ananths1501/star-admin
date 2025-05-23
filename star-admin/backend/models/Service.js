const mongoose = require("mongoose")

const workerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  serviceType: {
    type: String,
    required: true,
  },
  feesPerDay: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Available", "Busy", "On Leave"],
    default: "Available",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

const serviceSchema = new mongoose.Schema({
  serviceType: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    default: "",
  },
  image: {
    type: String,
    required: true,
  },
  workers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Update the updatedAt field on save
workerSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

serviceSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

module.exports = {
  Service: mongoose.model("Service", serviceSchema),
  Worker: mongoose.model("Worker", workerSchema),
}
