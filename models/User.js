// backend/models/User.js

const mongoose = require("mongoose");
const { Schema } = mongoose; // Ensure Schema is correctly imported

const UserSchema = new Schema({
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

// Ensure this is the only export
module.exports = mongoose.model("User", UserSchema);
