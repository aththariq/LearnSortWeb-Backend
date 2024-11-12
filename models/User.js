// backend/models/User.js

const mongoose = require("mongoose");
const { Schema } = mongoose; // Added Schema extraction

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

// Export the model directly without assigning to a variable
module.exports = mongoose.model("User", UserSchema);
