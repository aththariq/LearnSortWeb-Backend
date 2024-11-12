// backend/routes/auth.js
const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");

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
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    // Cek apakah user sudah ada
    User.findOne({ email: email }).then((user) => {
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Email sudah terdaftar" }] });
      } else {
        const newUser = new User({
          username,
          email,
          password,
        });

        // Hash password
        bcrypt.genSalt(10, (err, salt) => {
          if (err) throw err;
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then((user) => res.status(201).json({ msg: "User terdaftar" }))
              .catch((err) => console.log(err));
          });
        });
      }
    });
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
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(400).json({ msg: info.message });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
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
      return next(err);
    }
    res.json({ msg: "Logout berhasil" });
  });
});

// Google OAuth Routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "https://nama-frontend-vercel.vercel.app/login.html",
  }),
  (req, res) => {
    // Redirect ke frontend dashboard setelah berhasil login
    res.redirect("https://nama-frontend-vercel.vercel.app/dashboard.html");
  }
);

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
