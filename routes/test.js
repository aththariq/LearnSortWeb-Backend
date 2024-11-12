// backend/routes/test.js
import { Router } from "express";
const router = Router();
import User from "../models/User"; // Ensure correct import

router.get("/test-user", async (req, res) => {
  console.log("Test route '/test/test-user' was accessed"); // Add this line
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

export default router;
