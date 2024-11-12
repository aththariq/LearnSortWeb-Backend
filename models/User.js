// backend/models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  googleId: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure the model is compiled only once to prevent OverwriteModelError
module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
