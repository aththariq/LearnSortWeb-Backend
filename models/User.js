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
    required: function() { return !this.googleId; }, 
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true, 
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
