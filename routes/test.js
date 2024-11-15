// backend/routes/test.js
const express = require("express");
const router = express.Router();
const User = require("../models/User"); 

router.get("/test-user", async (req, res) => {
  console.log("Test route '/test/test-user' was accessed"); 
  try {
    const users = await User.find().limit(1);
    const user = users[0];
    if (user) {
      res.json(user);
    } else {
      res.json({ msg: "No users found." });
    }
  } catch (error) {
    res.status(500).json({ msg: "Error fetching user", error: error.message });
  }
});

module.exports = router;
