require("dotenv").config(); // Pastikan dotenv dikonfigurasi terlebih dahulu

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy; // Ensure correct import
const bcrypt = require("bcryptjs");
const User = require("../models/User"); // Pastikan path benar

console.log("User:", User);

// Configure Local Strategy
passport.use(
  new LocalStrategy(
    { usernameField: "email" }, // Gunakan email sebagai username
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email }); // Removed .limit(1)
        if (!user) {
          return done(null, false, { message: "Email tidak terdaftar" });
        }

        if (!user.password) {
          return done(null, false, { message: "Gunakan login OAuth" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Password salah" });
        }

        return done(null, user);
      } catch (err) {
        console.error("Error in LocalStrategy:", err);
        return done(err);
      }
    }
  )
);

// Configure Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            username: profile.displayName,
            email: profile.emails[0].value,
          });
        }
        done(null, user);
      } catch (err) {
        console.error("Error in GoogleStrategy:", err.message);
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    console.error("Error deserializing user:", err.message);
    done(err, null);
  }
});

module.exports = passport;
