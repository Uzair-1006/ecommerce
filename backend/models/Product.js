const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  mrp: { type: Number, required: true }, // ✅ added MRP
  category: { type: String },
  description: { type: String },
  image: { type: String },
  brand: { type: String },
  stock: { type: Number },
  quantityPerCase: { type: Number },
  color: { type: String },
  size: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
