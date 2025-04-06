const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Admin = require("./models/Admin"); // Update the path if needed

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ Connected to MongoDB");
  return createAdmin();
})
.catch((err) => {
  console.error("❌ Failed to connect to MongoDB", err);
  process.exit(1);
});

// Create and save the admin
async function createAdmin() {
  try {
    const existing = await Admin.findOne({ email: "admin@example.com" });
    if (existing) {
      console.log("⚠️ Admin already exists.");
    } else {
      const admin = new Admin({
        name: "Admin",
        email: "admin@example.com",
        password: "admin123", // will be hashed automatically in schema
      });
      await admin.save();
      console.log("✅ Admin created successfully!");
    }
  } catch (err) {
    console.error("❌ Error creating admin", err);
  } finally {
    mongoose.disconnect(); // Close DB connection
  }
}
