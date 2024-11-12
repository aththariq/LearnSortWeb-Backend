require("dotenv").config(); // Ensure dotenv is configured first

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose"); // Import mongoose

// Retrieve the User model from Mongoose
const User = mongoose.model("User"); // Use mongoose.model to get the registered model

// Add additional logging to verify the imported User model
console.log("Imported User model:", User);
console.log("Does User have findOne method?", typeof User.findOne === 'function');

// Debugging: Verify User model and its methods
console.log("User model in passport.js:", User);
console.log("Is User.findOne a function?", typeof User.findOne === 'function'); // Added check

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
