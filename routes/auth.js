const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const User = require("../models/User"); // Ensure correct import

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

    // Extract user details
    const { username, email, password } = req.body;

    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Email sudah terdaftar" }] });
      }

      const newUser = new User({ username, email, password });

      // Hash password
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

// Login Route
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

/*
// Google OAuth Routes
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
      // Redirect to frontend main page after successful login
      res.redirect(`${process.env.FRONTEND_URL}/main-page.html`);
    } catch (error) {
      console.error("Redirect error after OAuth:", error.message);
      res.status(500).send("Internal Server Error during redirection");
    }
  }
);
*/

// Status Route
router.get("/status", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      authenticated: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        username: req.user.username,
      },
    });
  } else {
    res.json({ authenticated: false });
  }
});

module.exports = router;
