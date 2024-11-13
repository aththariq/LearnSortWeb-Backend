require("dotenv").config(); // Ensure dotenv is configured first

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy; // Add this line
const bcrypt = require("bcryptjs"); // Import bcrypt
// Retrieve the User model from Mongoose
const User = require("../models/User"); // Correct import

// Additional logging as per the suggested code change
console.log("User:", User);

// Configure Local Strategy
passport.use(
  new LocalStrategy(
    { usernameField: "email" }, // Use email instead of default username
    async (email, password, done) => {
      try {
        const users = await User.find({ email }).limit(1);
        const user = users[0];
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

// Comment out Google Strategy for manual authentication
/*
const GoogleStrategy = require("passport-google-oauth20").Strategy;

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
*/

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
