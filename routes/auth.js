const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");

console.log("User model:", User);
console.log(
  "Does User have findOne method?",
  typeof User.findOne === "function"
);

// Register Route
router.post(
  "/register",
  [
    body("username").notEmpty().withMessage("Username diperlukan"),
    body("email").isEmail().withMessage("Email tidak valid"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password minimal 6 karakter"),
    body("password2")
      .custom((value, { req }) => value === req.body.password)
      .withMessage("Password tidak cocok"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
      const existingUsers = await User.find({ email }).limit(1);
      if (existingUsers.length > 0) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Email sudah terdaftar" }] });
      }

      const newUser = new User({ username, email, password });

      const salt = await bcrypt.genSalt(10);
      newUser.password = await bcrypt.hash(password, salt);

      await newUser.save();
      res.status(201).json({ msg: "User terdaftar" });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email tidak valid"),
    body("password").notEmpty().withMessage("Password diperlukan"),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(400).json({ msg: info.message });

      req.logIn(user, (err) => {
        if (err) return next(err);
        return res.json({
          msg: "Login berhasil",
          user: { id: user.id, email: user.email, username: user.username },
        });
      });
    })(req, res, next);
  }
);

// Logout Route
router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      console.error("Logout error:", err.message);
      return next(err);
    }
    res.json({ msg: "Logout berhasil" });
  });
});

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/login.html`,
  }),
  (req, res) => {
    try {
      res.redirect(`${process.env.FRONTEND_URL}/main-page.html`);
    } catch (error) {
      console.error("Redirect error after OAuth:", error.message);
      res.status(500).send("Internal Server Error during redirection");
    }
  }
);

router.get("/status", (req, res) => {
  if (req.isAuthenticated()) {
    console.log("Authenticated user:", req.user);
    res.json({
      authenticated: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        username: req.user.username,
        xp: req.user.xp, // Include XP
        recentActivities: req.user.recentActivities,
      },
    });
  } else {
    res.json({ authenticated: false });
  }
});

router.post(
  "/log-activity",
  [
    body("activity").notEmpty().withMessage("Activity is required"),
    body("xpGained")
      .isFloat({ min: 0.1 })
      .withMessage("XP gained must be a positive number"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.isAuthenticated()) {
      return res.status(401).json({ msg: "User not authenticated" });
    }

    const { activity, xpGained } = req.body;

    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      user.xp += xpGained;
      user.recentActivities.unshift({ activity, xpGained });

      if (user.recentActivities.length > 4) {
        user.recentActivities.pop();
      }

      await user.save();

      res.json({
        msg: "Activity logged successfully",
        xp: user.xp,
        recentActivities: user.recentActivities,
      });
    } catch (err) {
      console.error("Error logging activity:", err.message);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
