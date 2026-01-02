// Backend/index.js
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");

// Try to require morgan only if installed
let morgan = null;
try {
  morgan = require("morgan");
} catch (_) {}

const rateLimit = require("express-rate-limit");
const swaggerUI = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

// ROUTES (your repo uses singular filenames)
const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");
const shipmentRoute = require("./routes/shipment");

// Admin system routes (already present in your build)
const configRoute = require("./routes/config");
const settingsRoute = require("./routes/settings");
const backupsRoute = require("./routes/backups");
const analyticsRoute = require("./routes/analytics");
const logsRoute = require("./routes/logs");
const calendarRoute = require("./routes/calendar");

const app = express();

// If deployed behind a proxy (Render/Heroku/Nginx), this helps rate-limit + IP correctness
app.set("trust proxy", 1);

// --------------------
// RATE LIMITERS
// --------------------
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: Number(process.env.RATE_LIMIT_PER_MINUTE) || 240,
  standardHeaders: true,
  legacyHeaders: false,
});

// --------------------
// CORS (hardened)
// --------------------
const parseOrigins = (val) =>
  String(val || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const envAllow = [
  ...parseOrigins(process.env.CLIENT_URL),
  ...parseOrigins(process.env.ADMIN_URL),
  ...parseOrigins(process.env.ALLOWED_ORIGINS),
];

const devAllow = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
];

const allowlist = new Set(
  (process.env.NODE_ENV === "production"
    ? envAllow
    : [...envAllow, ...devAllow]
  ).filter(Boolean)
);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);

      if (allowlist.size === 0) {
        if (process.env.NODE_ENV === "production") {
          return cb(new Error("CORS blocked"));
        }
        return cb(null, true);
      }

      if (allowlist.has(origin)) return cb(null, true);
      return cb(new Error("CORS blocked"));
    },
    credentials: true,
  })
);

// --------------------
// MIDDLEWARES
// --------------------
app.use(express.json({ limit: "1mb" }));
app.use(helmet());
app.use(apiLimiter);

if (process.env.NODE_ENV === "development" && morgan) {
  app.use(morgan("dev"));
}

// --------------------
// STATIC: UPLOADS
// --------------------
// Files saved by multer will be served from /uploads/*
// Example: http://localhost:8000/uploads/documents/shipments/<id>/<filename>
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --------------------
// HEALTH CHECK
// --------------------
app.get("/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// --------------------
// ROOT
// --------------------
app.get("/", (req, res) => {
  res.json({
    ok: true,
    name: "Ellcworth API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      register: "POST /auth/register",
      login: "POST /auth/login",
      me: "GET /auth/me (Bearer token required)",
      users: "CRUD /api/v1/users (admin only) + legacy /users (temporary)",
      shipments:
        "CRUD /api/v1/shipments (auth) + admin ops at /api/v1/shipments/:id/* + legacy /shipments (temporary)",
      config: {
        ports: "/config/ports",
        serviceTypes: "/config/service-types",
        cargoCategories: "/config/cargo-categories",
      },
      docs: "/docs",
    },
    time: new Date().toISOString(),
  });
});

// --------------------
// SWAGGER SETUP
// --------------------
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Ellcworth API",
      version: "1.0.0",
      description: "Auth, Users & Shipments for Ellcworth backend.",
    },
    servers: [{ url: `http://localhost:${process.env.PORT || 8000}` }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
    paths: {},
  },
  apis: [],
});

app.use(
  "/docs",
  swaggerUI.serve,
  swaggerUI.setup(swaggerSpec, { explorer: true })
);

// --------------------
// ROUTES
// --------------------
app.use("/auth", authLimiter, authRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/shipments", shipmentRoute);

// Legacy aliases (temporary) + logging
app.use("/users", userRoute);
app.use("/shipments", shipmentRoute);

// Config + Admin
app.use("/config", configRoute);
app.use("/admin/settings", settingsRoute);
app.use("/admin/backups", backupsRoute);
app.use("/admin/analytics", analyticsRoute);
app.use("/admin/logs", logsRoute);
app.use("/admin/calendar", calendarRoute);

// --------------------
// 404
// --------------------
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: "Not found",
    path: req.originalUrl,
  });
});

// --------------------
// ERROR HANDLER
// --------------------
app.use((err, req, res, next) => {
  const status = Number(err.statusCode || err.status || 500);

  const payload = {
    ok: false,
    message: err.publicMessage || err.message || "Something went wrong",
  };

  if (process.env.NODE_ENV !== "production") {
    payload.error = err.message;
    payload.stack = err.stack;
  }

  console.error("API ERROR:", {
    status,
    method: req.method,
    url: req.originalUrl,
    message: err.message,
  });

  res.status(status).json(payload);
});

// --------------------
// DB + SERVER START
// --------------------
const PORT = Number(process.env.PORT) || 8000;
const MONGO_URI = process.env.MONGO_URI || process.env.DB;

if (!MONGO_URI) {
  console.error("❌ No Mongo URI found. Set MONGO_URI (or DB) in your .env.");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ DB connection successful");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err.message);
    process.exit(1);
  });

module.exports = app;
