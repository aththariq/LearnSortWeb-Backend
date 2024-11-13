const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/auth").default;
const MongoDBStore = require("connect-mongodb-session")(session);
const path = require("path");
const testRoutes = require("./routes/test").default;

dotenv.config();
const app = express();

const allowedOrigins = [
  "https://learn-sort-web.vercel.app",
  "http://127.0.0.1:5500",
];

const corsOptions = {
  origin: function (origin, callback) {
    console.log("Request Origin:", origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.set("trust proxy", 1);

app.use(cors(corsOptions));

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
  keyGenerator: (req) => req.ip,
  skip: (req) => req.method === "OPTIONS",
});
app.use("/auth/", authLimiter);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());


mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");

  const store = new MongoDBStore({
    uri: process.env.MONGO_URI,
    collection: "sessions",
  });

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

  const passport = require("./config/passport");

  app.use(passport.initialize());
  app.use(passport.session());

  app.use(express.static(path.join(__dirname, "public")));

  app.use("/auth", authRoutes);
  console.log("Authentication routes have been registered");

  app.use("/test", testRoutes);
  console.log("Test routes have been registered");

  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
  });
});
