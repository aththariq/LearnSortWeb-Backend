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
  xp: {
    type: Number,
    default: 0,
    index: true, 
  },
  recentActivities: [
    {
      activity: { type: String, required: true },
      xpGained: { type: Number, required: true }, // Ensure Number type
      date: { type: Date, default: Date.now },
    },
  ],
});

const User = mongoose.model("User", userSchema);

module.exports = User;