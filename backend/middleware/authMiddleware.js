const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    // Case-insensitive access to the header
    const authHeader = req.headers.authorization || req.headers.Authorization;
    
    const token = req.cookies.token || (authHeader && authHeader.startsWith("Bearer") ? authHeader.split(" ")[1] : null);

    console.log("🔐 Auth middleware - Token received:", !!token);
    console.log("🔐 Auth middleware - Authorization header:", authHeader);
    console.log("🔐 Auth middleware - Cookies:", req.cookies);
    
    if (!token) {
      console.log("❌ Auth middleware - No token provided");
      return res.status(401).json({ message: "Unauthorized. No token provided." });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Auth middleware - Token decoded:", decoded);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      console.log("❌ Auth middleware - User not found");
      return res.status(401).json({ message: "User not found" });
    }

    console.log("✅ Auth middleware - User authenticated:", user._id);
    req.user = user;
    next();
  } catch (error) {
    console.error("❌ Auth middleware error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
module.exports = authMiddleware;
