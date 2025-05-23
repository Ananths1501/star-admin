const mongoose = require("mongoose");
const Order = require("./models/Order");
const Product = require("./models/Product");

const MONGO_URI = "mongodb://127.0.0.1:27017/star";

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB!");

    const bulb = await Product.findOne({ productId: "P001" });
    const switchProduct = await Product.findOne({ productId: "P003" });
    const kettle = await Product.findOne({ productId: "P006" });
    const wire = await Product.findOne({ productId: "P010" });

    console.log({ bulb, switchProduct, kettle, wire });

    if (!bulb || !switchProduct || !kettle || !wire) {
      throw new Error("Some products not found in the database! Check your productId.");
    }

    // Create and save orders one by one with dummy orderNumber
    const orders = [
      {
        orderNumber: "ORD-250427-0001",  // ADD manually
        customer: "John Doe",
        items: [
          { product: bulb._id, quantity: 5, price: bulb.price, discount: bulb.discount },
          { product: switchProduct._id, quantity: 10, price: switchProduct.price, discount: switchProduct.discount },
        ],
        totalAmount: (bulb.price * (1 - bulb.discount / 100) * 5) +
                     (switchProduct.price * (1 - switchProduct.discount / 100) * 10),
        status: "Pending",
        paymentMethod: "Cash",
        paymentStatus: "Paid",
      },
      {
        orderNumber: "ORD-250427-0002",
        customer: "Jane Smith",
        items: [
          { product: wire._id, quantity: 1, price: wire.price, discount: wire.discount },
        ],
        totalAmount: (wire.price * (1 - wire.discount / 100)),
        status: "Processing",
        paymentMethod: "Card",
        paymentStatus: "Paid",
      },
      {
        orderNumber: "ORD-250427-0003",
        customer: "Walk-in Customer",
        items: [
          { product: kettle._id, quantity: 1, price: kettle.price, discount: kettle.discount },
        ],
        totalAmount: kettle.price * (1 - kettle.discount / 100),
        status: "Delivered",
        paymentMethod: "UPI",
        paymentStatus: "Paid",
      },
      {
        orderNumber: "ORD-250427-0004",
        customer: "Michael Brown",
        items: [
          { product: bulb._id, quantity: 2, price: bulb.price, discount: bulb.discount },
          { product: wire._id, quantity: 2, price: wire.price, discount: wire.discount },
        ],
        totalAmount: (bulb.price * (1 - bulb.discount / 100) * 2) +
                     (wire.price * (1 - wire.discount / 100) * 2),
        status: "Shipped",
        paymentMethod: "Other",
        paymentStatus: "Paid",
      },
      {
        orderNumber: "ORD-250427-0005",
        customer: "Emily Johnson",
        items: [
          { product: switchProduct._id, quantity: 4, price: switchProduct.price, discount: switchProduct.discount },
          { product: kettle._id, quantity: 2, price: kettle.price, discount: kettle.discount },
        ],
        totalAmount: (switchProduct.price * (1 - switchProduct.discount / 100) * 4) +
                     (kettle.price * (1 - kettle.discount / 100) * 2),
        status: "Cancelled",
        paymentMethod: "Cash",
        paymentStatus: "Pending",
      },
    ];

    for (const data of orders) {
      const order = new Order(data);
      await order.save(); // now no error because orderNumber is manually given
    }

    console.log("✅ 5 Orders created and saved successfully with manual orderNumber!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding:", error);
    process.exit(1);
  }
}

seed();
