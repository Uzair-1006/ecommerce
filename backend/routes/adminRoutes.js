const express = require("express");
const router = express.Router();
const { adminLogin } = require("../controllers/adminController");
const adminAuthMiddleware = require("../middleware/adminAuthMiddleware");
const User = require("../models/User");
const Product = require("../models/Product"); // Add this near top with other imports
const Order = require("../models/Order");
const Settings = require("../models/Setting");

// 📦 GET all products (with optional brand filtering)
router.get("/products", adminAuthMiddleware, async (req, res) => {
  try {
    const { brand } = req.query; // Extract the brand query parameter

    // Create a filter object
    const filter = {};
    if (brand) {
      filter.brand = brand; // If brand is passed in the query, filter products by brand
    }

    // Fetch products with the filter
    const products = await Product.find(filter);

    res.json({ success: true, products });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ➕ CREATE a new product
router.post("/products", adminAuthMiddleware, async (req, res) => {
  try {
    const {
      name,
      price,
      mrp,
      category,
      description,
      image,
      stock,
      quantityPerCase,
      brand,
      color,
      size,
    } = req.body;

    const newProduct = new Product({
      name,
      price,
      mrp,
      category,
      description,
      image,
      stock,
      quantityPerCase,
      brand,
      color,
      size,
    });

    await newProduct.save();

    res.status(201).json({
      success: true,
      message: "Product created",
      product: newProduct,
    });
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(400).json({
      success: false,
      message: "Invalid product data",
    });
  }
});

// 🗑 DELETE a product
router.delete("/products/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, message: "Product deleted", product: deleted });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✏️ UPDATE a product
router.put("/products/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const {
      name,
      price,
      mrp,
      category,
      description,
      image,
      stock,
      quantityPerCase,
      brand,
      color,
      size
    } = req.body;

    // Update product with the new data
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        price,
        mrp,
        category,
        description,
        image,
        stock,
        quantityPerCase,
        brand,
        color,
        size
      },
      { new: true } // Return the updated product
    );

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "Product updated", product: updatedProduct });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(400).json({ success: false, message: "Invalid update data" });
  }
});

// Admin login
router.post("/login", adminLogin);

// 🛡 Protected dashboard route
router.get("/dashboard", adminAuthMiddleware, async (req, res) => {
  try {
    // Get today's date in UTC
    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
    const todayEnd = new Date(new Date().setHours(23, 59, 59, 999));

    // Get the start of the current week (Monday) and the end of the week (Sunday)
    const weekStart = new Date();
    const weekEnd = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Set to Monday
    weekStart.setHours(0, 0, 0, 0); // Set time to midnight
    weekEnd.setDate(weekEnd.getDate() - weekEnd.getDay() + 7); // Set to Sunday
    weekEnd.setHours(23, 59, 59, 999); // Set time to the end of the day

    // Get total orders placed today
    const totalOrdersToday = await Order.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });

    // Get total sales for today (sum of order amounts)
    const totalSalesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: todayStart, $lte: todayEnd },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalAmount" }, // Correct field: totalAmount
        },
      },
    ]);
    const totalSales = totalSalesData.length > 0 ? totalSalesData[0].totalSales : 0;

    // Get total orders placed this week
    const totalOrdersThisWeek = await Order.countDocuments({
      createdAt: { $gte: weekStart, $lte: weekEnd },
    });

    // Get total sales for the week (sum of order amounts)
    const totalSalesThisWeekData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: weekStart, $lte: weekEnd },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalAmount" }, // Correct field: totalAmount
        },
      },
    ]);
    const totalSalesThisWeek = totalSalesThisWeekData.length > 0 ? totalSalesThisWeekData[0].totalSales : 0;

    // Get pending orders for today
    const pendingOrders = await Order.countDocuments({
      status: "Pending", // Use correct case: 'Pending'
      createdAt: { $gte: todayStart, $lte: todayEnd }, // Add date filter for today's orders
    });

    // Get delivered orders for today
    const deliveredOrders = await Order.countDocuments({
      status: "Delivered", // Use correct case: 'Delivered'
      createdAt: { $gte: todayStart, $lte: todayEnd }, // Add date filter for today's orders
    });

    // Respond with the dashboard data
    res.json({
      success: true,
      message: "Welcome to Admin Dashboard",
      admin: {
        id: req.admin._id,
        name: req.admin.name,
        email: req.admin.email,
      },
      totalOrdersToday,
      totalSales,
      pendingOrders,
      deliveredOrders,
      totalOrdersThisWeek,
      totalSalesThisWeek,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching dashboard data.",
    });
  }
});

// Fetch all users (excluding passwords)
router.get("/users", adminAuthMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ success: true, users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🔥 DELETE a user by ID
router.delete("/users/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 📦 GET all orders
router.get("/orders", adminAuthMiddleware, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("products");

    console.log("📦 Orders being sent to frontend:", orders); // Add this
    res.json({ success: true, orders });

  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
// ✏️ UPDATE order status
router.put("/orders/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Pending", "Shipped", "Delivered"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("user", "name email").populate("products");

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    res.json({ success: true, message: "Order updated", order });
  } catch (err) {
    console.error("Error updating order:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Express backend example
router.post('/logout', (req, res) => {
  res.clearCookie('token'); // or whatever cookie name you're using
  res.status(200).json({ message: 'Logged out successfully' });
});

// DELETE /api/admin/orders/:orderId
router.delete('/orders/:orderId', async (req, res) => {
  const { orderId } = req.params;
  try {
    await Order.findByIdAndDelete(orderId);
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete order' });
  }
});

router.get("/settings", adminAuthMiddleware, async (req, res) => {
  try {
    const settings = await Settings.findOne();
    if (!settings) return res.status(404).json({ success: false, message: "Settings not found" });
    res.json({ success: true, settings });
  } catch (err) {
    console.error("Error fetching settings:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ➕ Create settings (only if none exist)
router.post("/settings", adminAuthMiddleware, async (req, res) => {
  try {
    const exists = await Settings.findOne();
    if (exists) return res.status(400).json({ success: false, message: "Settings already exist. Use PUT to update." });

    const { siteTitle, aboutUs, email, mobile } = req.body;
    const settings = new Settings({ siteTitle, aboutUs, email, mobile });
    await settings.save();

    res.status(201).json({ success: true, message: "Settings created", settings });
  } catch (err) {
    console.error("Error creating settings:", err);
    res.status(500).json({ success: false, message: "Failed to create settings" });
  }
});

// ✏️ Update settings by ID
router.put("/settings/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const { siteTitle, aboutUs, email, mobile } = req.body;

    const updated = await Settings.findByIdAndUpdate(
      req.params.id,
      { siteTitle, aboutUs, email, mobile },
      { new: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: "Settings not found" });

    res.json({ success: true, message: "Settings updated", settings: updated });
  } catch (err) {
    console.error("Error updating settings:", err);
    res.status(500).json({ success: false, message: "Failed to update settings" });
  }
});



module.exports = router;
