// backend/config/passport.js
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User"); // Ensure correct path and casing
require("dotenv").config();

// Debugging: Verify the User model type and methods
console.log("User Model:", User);
console.log("Type of User:", typeof User);
console.log("User.findOne exists:", typeof User.findOne === "function");

if (!User || typeof User.findOne !== "function") {
  console.error("User model is not imported correctly. Check the export and import paths.");
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL, // Use GOOGLE_CALLBACK_URL directly
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Debugging: Log the User object
        console.log("User Model inside strategy:", User);

        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            username: profile.displayName,
            email: profile.emails[0].value, // Added missing email field
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
