// backend/routes/test.js
const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Corrected import statement

router.get("/test-user", async (req, res) => {
  try {
    const user = await User.findOne();
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
