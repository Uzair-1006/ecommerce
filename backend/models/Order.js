const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  totalAmount: { type: Number, required: true },
  paymentMode: {
    type: String,
    enum: ["Cash", "Card", "UPI"],
    default: "Cash",
  },
  status: {
    type: String,
    enum: ["Pending", "Shipped", "Delivered", "cancelled"],
    default: "Pending",
  },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", OrderSchema);
