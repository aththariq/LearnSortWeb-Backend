const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User"); // pastikan path ke model User sesuai
require("dotenv").config();

// Konfigurasi Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.NODE_ENV === "production"
          ? `${process.env.FRONTEND_URL}/auth/google/callback`
          : "http://localhost:3000/auth/google/callback", // sesuaikan dengan port lokal
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Cari user berdasarkan Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // Jika user belum ada, buat user baru
          user = await User.create({
            googleId: profile.id,
            username: profile.displayName,
            email: profile.emails[0].value,
          });
        }

        done(null, user); // Selesaikan autentikasi dan teruskan user
      } catch (err) {
        done(err, null);
      }
    }
  )
);

// Serialize dan deserialize user untuk session management
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
