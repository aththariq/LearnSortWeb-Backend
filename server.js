// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/auth");
const MongoDBStore = require("connect-mongodb-session")(session);
const path = require("path");

dotenv.config();

const app = express();

const allowedOrigins = [
  "https://learn-sort-web.vercel.app",
  "http://localhost:3000", // Add your local frontend URL for development
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // Allow cookies to be sent
  })
);

app.use(
  helmet({
    permissionsPolicy: {
      features: {
        geolocation: ["'self'"],
        microphone: ["'none'"],
        camera: ["'none'"],
      },
    },
  })
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Terlalu banyak permintaan, coba lagi setelah 15 menit",
});
app.use("/auth/", authLimiter);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to MongoDB FIRST
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");

  // Initialize MongoDB session store AFTER connection
  const store = new MongoDBStore({
    uri: process.env.MONGO_URI,
    collection: "sessions",
  });

  // Handle session store errors
  store.on("error", function (error) {
    console.error("Session store error:", error);
  });

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: store,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    })
  );

  // Import Passport AFTER session and models are loaded
  const passport = require("./config/passport");

  // Initialize Passport AFTER session
  app.use(passport.initialize());
  app.use(passport.session());

  // Serve static files from the 'public' directory
  app.use(express.static(path.join(__dirname, "public")));

  // Define authentication routes **before** the catch-all route
  app.use("/auth", authRoutes);

  // Catch-all route to serve frontend
  app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "index.html"));
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
  });
});
