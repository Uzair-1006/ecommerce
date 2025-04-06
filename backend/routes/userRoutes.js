const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Product = require("../models/Product"); // ✅ Ensure Product model is required
const Order = require("../models/Order"); // ✅ Ensure Order model is required
const { getUserProfile } = require("../controllers/userController"); // ✅ Import the function
const authMiddleware = require("../middleware/authMiddleware");

// ✅ Fetch Profile (Orders & Wishlist)
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    console.log("📌 Profile API called by:", req.user.id); // Debugging

    const user = await User.findById(req.user.id)
      .populate("wishlist") // ✅ Ensure Product model is imported
      .populate({ path: "orders", populate: { path: "products" } });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error("🔥 Profile Fetch Error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

// ✅ Get User's Orders
router.get("/order", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "orders",
      populate: { path: "products" },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      orders: user.orders,
    });
  } catch (error) {
    console.error("🔥 Orders Fetch Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
});

// ✅ Add/Remove Wishlist
router.post("/wishlist", authMiddleware, async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const productIndex = user.wishlist.indexOf(productId);
    if (productIndex !== -1) {
      user.wishlist.splice(productIndex, 1);
      await user.save();
      return res.json({ success: true, message: "Removed from wishlist" });
    }

    user.wishlist.push(productId);
    await user.save();
    res.json({ success: true, message: "Added to wishlist" });
  } catch (error) {
    console.error("🔥 Wishlist Update Error:", error);
    res.status(500).json({ success: false, message: "Error updating wishlist", error: error.message });
  }
});

// ✅ Update Profile
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, phone, gender, dob, addresses } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (gender) user.gender = gender;
    if (dob) user.dob = dob;
    if (addresses) user.addresses = addresses;

    await user.save();

    res.json({ success: true, message: "Profile updated successfully", user });
  } catch (error) {
    console.error("🔥 Profile Update Error:", error);
    res.status(500).json({ success: false, message: "Error updating profile", error: error.message });
  }
});

// ✅ Get Products by Brand (NEW)
router.get("/products", async (req, res) => {
  try {
    const { brand } = req.query;

    const query = brand ? { brand: brand } : {};
    const products = await Product.find(query);

    res.json({ success: true, products });
  } catch (error) {
    console.error("🔥 Products Fetch Error:", error);
    res.status(500).json({ success: false, message: "Error fetching products", error: error.message });
  }
});

// ✅ Place Order
router.post("/orders", authMiddleware, async (req, res) => {
  try {
    const { products, totalAmount, paymentMode = "Cash" } = req.body;

    const newOrder = new Order({
      user: req.user._id,
      products,
      totalAmount,
      paymentMode, // ✅ Save payment mode
    });

    const savedOrder = await newOrder.save();

    // ✅ Add the order to the user's order history
    const user = await User.findById(req.user._id);
    user.orders.push(savedOrder._id);
    await user.save();

    res.status(201).json({ success: true, order: savedOrder });
  } catch (err) {
    console.warn("Error placing order:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


// Cancel Order Route
router.put("/order/cancel/:id", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = "cancelled";
    await order.save();

    res.json({ success: true, message: "Order cancelled", order });
  } catch (err) {
    console.error("🔥 Cancel Order Error:", err);
    res.status(500).json({ success: false, message: "Failed to cancel order" });
  }
});

// ✅ Fetch All Products (renamed route)
router.get("/allproducts", async (req, res) => {
  try {
    const { brand } = req.query;
    const query = brand ? { brand } : {};
    const products = await Product.find(query);
    res.json({ success: true, products });
  } catch (error) {
    console.error("🔥 All Products Fetch Error:", error);
    res.status(500).json({ success: false, message: "Error fetching products", error: error.message });
  }
});

// GET /api/admin/settings
router.get("/settings", async (req, res) => {
  try {
    const settings = await Settings.findOne(); // Assuming there's only one settings document
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching settings" });
  }
});


module.exports = router;
