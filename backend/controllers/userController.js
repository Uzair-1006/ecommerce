const User = require("../models/User");

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("wishlist");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("🔥 Error fetching user profile:", error); // Log full error
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
module.exports = { getUserProfile };
