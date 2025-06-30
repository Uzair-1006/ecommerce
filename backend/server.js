const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const adminRoutes = require("./routes/adminRoutes");

dotenv.config();
const app = express();

// ✅ Middleware
app.use(
  cors({
  origin: "http://localhost:3000",  // Must be your frontend origin
  credentials: true
})
);
app.use(express.json());
app.use(cookieParser());

// ✅ Debugging: Log Incoming Requests (Useful for Checking Cookies)
app.use((req, res, next) => {
  console.log(`📌 [${req.method}] ${req.url}`);
  console.log("🔹 Cookies:", req.cookies); // Log cookies to debug issues
  console.log("🔹 Headers:", req.headers); // Log headers to debug issues
  next();
});
app.use("/api/admin", adminRoutes);

// ✅ Import Models Before Routes to Register Schemas
require("./models/Product");
require("./models/User");
require("./models/Order"); // Make sure Order model is imported

// ✅ Routes
app.use("/api/auth", require("./routes/authRoutes")); // Auth routes
app.use("/api/user", require("./routes/userRoutes")); // User routes

const PORT = process.env.PORT || 5000;

// ✅ Secure MongoDB Connection with Proper Error Handling
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1); // Exit if DB connection fails
  });

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
