const mongoose = require("mongoose");

// MongoDB connection URI
const MONGODB_URI = "mongodb://127.0.0.1:27017/star";

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("MongoDB connected!");
  insertProducts();
}).catch((err) => {
  console.error("Connection error:", err);
});

const productSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  type: {
    type: String,
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
  stock: {
    type: Number,
    required: true,
  },
  minStock: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  warranty: {
    type: Number,
    default: 0,
  },
  image: {
    type: String,
    required: true,
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


// Pre-save hook to update updatedAt
productSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Product = mongoose.model("Product", productSchema);

// Insert Products
async function insertProducts() {
  try {
    const products = [
      {
        productId: "P021",
        name: "LED Bulb 9W",
        brand: "Wipro",
        type: "Lighting",
        price: 100,
        discount: 5,
        stock: 180,
        minStock: 30,
        description: "9W LED bulb suitable for home use",
        warranty: 12,
        image: "/uploads/ledbulb9w.jpg",
      },
      {
        productId: "P022",
        name: "Exhaust Fan 6\"",
        brand: "Usha",
        type: "Fan",
        price: 950,
        discount: 10,
        stock: 35,
        minStock: 5,
        description: "Plastic exhaust fan for kitchen and bathrooms",
        warranty: 18,
        image: "/uploads/exhaustfan.jpg",
      },
      {
        productId: "P023",
        name: "Bell Push Switch",
        brand: "GM",
        type: "Switches",
        price: 40,
        discount: 0,
        stock: 250,
        minStock: 50,
        description: "Durable bell push switch for doorbell",
        warranty: 6,
        image: "/uploads/bellpush.jpg",
      },
      {
        productId: "P024",
        name: "Spike Guard 6A",
        brand: "Belkin",
        type: "Electrical Accessories",
        price: 620,
        discount: 10,
        stock: 70,
        minStock: 15,
        description: "4-socket spike guard with surge protection",
        warranty: 12,
        image: "/uploads/spikeguard.jpg",
      },
      {
        productId: "P025",
        name: "Toaster 2-Slice",
        brand: "Prestige",
        type: "Appliance",
        price: 1100,
        discount: 12,
        stock: 30,
        minStock: 5,
        description: "2-slice toaster with browning control",
        warranty: 12,
        image: "/uploads/toaster.jpg",
      },
      {
        productId: "P026",
        name: "CCTV Camera",
        brand: "CP Plus",
        type: "Security",
        price: 2100,
        discount: 15,
        stock: 40,
        minStock: 10,
        description: "Indoor dome CCTV camera with night vision",
        warranty: 24,
        image: "/uploads/cctv.jpg",
      },
      {
        productId: "P027",
        name: "5-Pin Plug",
        brand: "Anchor",
        type: "Plug",
        price: 60,
        discount: 0,
        stock: 400,
        minStock: 80,
        description: "5-pin heavy-duty plug top for large appliances",
        warranty: 6,
        image: "/uploads/5pinplug.jpg",
      },
      {
        productId: "P028",
        name: "Flexible Wire 1.5sqmm",
        brand: "RR Kabel",
        type: "Wiring",
        price: 890,
        discount: 5,
        stock: 45,
        minStock: 10,
        description: "1.5 sqmm insulated wire for home wiring",
        warranty: 60,
        image: "/uploads/flexiblewire.jpg",
      },
      {
        productId: "P029",
        name: "LED Flood Light 100W",
        brand: "Havells",
        type: "Outdoor Lighting",
        price: 2950,
        discount: 12,
        stock: 20,
        minStock: 5,
        description: "High intensity 100W LED floodlight",
        warranty: 36,
        image: "/uploads/floodlight100w.jpg",
      },
      {
        productId: "P030",
        name: "MCB 32A DP",
        brand: "Hager",
        type: "Circuit Protection",
        price: 320,
        discount: 7,
        stock: 75,
        minStock: 10,
        description: "Double pole 32A MCB for heavy loads",
        warranty: 12,
        image: "/uploads/mcb32a.jpg",
      },
      {
        productId: "P031",
        name: "Room Heater 1000W",
        brand: "Orpat",
        type: "Heating",
        price: 1450,
        discount: 10,
        stock: 25,
        minStock: 5,
        description: "Compact 1000W room heater for winters",
        warranty: 12,
        image: "/uploads/roomheater.jpg",
      },
      {
        productId: "P032",
        name: "LED Strip Light RGB 5m",
        brand: "Philips",
        type: "Decorative Lighting",
        price: 700,
        discount: 20,
        stock: 30,
        minStock: 5,
        description: "RGB LED strip with remote control and color modes",
        warranty: 12,
        image: "/uploads/striprgb.jpg",
      },
      {
        productId: "P033",
        name: "Modular Socket 6A",
        brand: "Legrand",
        type: "Socket",
        price: 85,
        discount: 5,
        stock: 190,
        minStock: 30,
        description: "6A modular socket for home usage",
        warranty: 6,
        image: "/uploads/socket6a.jpg",
      },
      {
        productId: "P034",
        name: "Wire Stripper Tool",
        brand: "Stanley",
        type: "Tool",
        price: 550,
        discount: 8,
        stock: 35,
        minStock: 5,
        description: "Insulated wire stripper and cutter tool",
        warranty: 12,
        image: "/uploads/wirestripper.jpg",
      },
      {
        productId: "P035",
        name: "Glue Stick for Gun",
        brand: "Generic",
        type: "Accessory",
        price: 20,
        discount: 0,
        stock: 500,
        minStock: 100,
        description: "Standard glue stick for hot glue gun",
        warranty: 0,
        image: "/uploads/gluestick.jpg",
      },
      {
        productId: "P036",
        name: "Surface Box 1M",
        brand: "Havells",
        type: "Electrical Accessories",
        price: 30,
        discount: 0,
        stock: 300,
        minStock: 50,
        description: "Single module surface mounting box",
        warranty: 6,
        image: "/uploads/surfacebox.jpg",
      },
      {
        productId: "P037",
        name: "Cordless Drill",
        brand: "Bosch",
        type: "Tool",
        price: 3750,
        discount: 15,
        stock: 10,
        minStock: 3,
        description: "Rechargeable cordless drill with bits",
        warranty: 24,
        image: "/uploads/drill.jpg",
      },
      {
        productId: "P038",
        name: "Mini Inverter 600VA",
        brand: "Luminous",
        type: "Appliance",
        price: 3500,
        discount: 10,
        stock: 12,
        minStock: 2,
        description: "600VA home inverter for small appliances",
        warranty: 24,
        image: "/uploads/inverter.jpg",
      },
      {
        productId: "P039",
        name: "Power Cable 3 Core",
        brand: "Finolex",
        type: "Wiring",
        price: 2200,
        discount: 8,
        stock: 20,
        minStock: 5,
        description: "3-core copper power cable for appliances",
        warranty: 60,
        image: "/uploads/3corecable.jpg",
      },
      {
        productId: "P040",
        name: "Night Lamp Sensor",
        brand: "Syska",
        type: "Lighting",
        price: 150,
        discount: 5,
        stock: 100,
        minStock: 20,
        description: "Automatic night lamp with light sensor",
        warranty: 12,
        image: "/uploads/nightlamp.jpg",
      }
    ];
    

    await Product.insertMany(products);
    console.log("20 products inserted successfully.");
  } catch (err) {
    console.error("Insert failed:", err);
  } finally {
    mongoose.connection.close();
  }
}
