const mongoose = require("mongoose")

const billItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  productBrand: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
  },
})

const billSchema = new mongoose.Schema({
  billNumber: {
    type: String,
    required: true,
    unique: true,
  },
  customer: {
    type: String,
    default: "Walk-in Customer",
  },
  items: [billItemSchema],
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ["Cash", "Card", "UPI", "Other"],
    default: "Cash",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Generate bill number
billSchema.pre("save", async function (next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments()
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const day = date.getDate().toString().padStart(2, "0")
    this.billNumber = `BILL-${year}${month}${day}-${(count + 1).toString().padStart(4, "0")}`
  }
  next()
})

module.exports = mongoose.model("Bill", billSchema)
