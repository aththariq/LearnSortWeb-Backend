// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  googleId: { // Add this field
    type: String,
    unique: true,
    sparse: true, // Allows multiple documents without a googleId
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
