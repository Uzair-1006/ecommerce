const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String }, // optional
  gender: { type: String, enum: ["Male", "Female", "Other"] },
  dob: { type: Date }, // Date of birth
  address: { type: String },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }]
});

module.exports = mongoose.model("User", UserSchema);
