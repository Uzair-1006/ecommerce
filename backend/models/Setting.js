const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  siteTitle: {
    type: String,
    required: true,
  },
  aboutUs: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("Settings", settingsSchema);
