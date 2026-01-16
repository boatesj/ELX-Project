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
const contentRoute = require("./routes/content");

// Admin system routes (already present in your build)
const configRoute = require("./routes/config");
const settingsRoute = require("./routes/settings");
const backupsRoute = require("./routes/backups");
const analyticsRoute = require("./routes/analytics");
const logsRoute = require("./routes/logs");
const calendarRoute = require("./routes/calendar");

const app = express();

const isProd = process.env.NODE_ENV === "production";

// If deployed behind a proxy (Render/Heroku/Nginx), this helps rate-limit + IP correctness
// Safe default: enabled in production.
app.set("trust proxy", isProd ? 1 : 0);

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
// CORS (Phase 5.2.3 — prod domains locked)
// --------------------
const parseOrigins = (val) =>
  String(val || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const isLocalOrigin = (origin) =>
  /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(String(origin || ""));

// Registered production domains (LOCKED)
const lockedProdAllow = [
  "https://ellcworth.com",
  "https://www.ellcworth.com",
  "https://admin.ellcworth.com",
];

// Optional explicit additions (still explicit allowlist; useful for staging/cutover)
// NOTE: In production we will ignore localhost origins even if someone sets them here.
const envAllowRaw = [
  ...parseOrigins(process.env.CLIENT_URL),
  ...parseOrigins(process.env.ADMIN_URL),
  ...parseOrigins(process.env.ALLOWED_ORIGINS),
].filter(Boolean);

const envAllow = isProd
  ? envAllowRaw.filter((o) => !isLocalOrigin(o))
  : envAllowRaw;

// Explicit dev ports (LOCKED)
const devAllow = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:3000",
];

// Effective allowlist:
// - Prod: locked registered domains + explicit env additions (non-local)
// - Dev: env + locked dev ports
const allowlist = new Set(
  (isProd ? [...lockedProdAllow, ...envAllow] : [...envAllow, ...devAllow])
    .map((o) => String(o).trim())
    .filter(Boolean)
);

const corsOptions = {
  origin(origin, cb) {
    // Allow server-to-server / curl / same-origin without Origin header
    if (!origin) return cb(null, true);

    if (allowlist.has(origin)) return cb(null, true);

    return cb(new Error("CORS blocked"));
  },
  credentials: true,
};

app.use(cors(corsOptions));

// --------------------
// MIDDLEWARES
// --------------------
app.use(express.json({ limit: "1mb" }));

// Helmet defaults can block static assets across origins (CORP).
// For /uploads/* we want public access from allowed origins.
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(apiLimiter);

if (!isProd && morgan) {
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
      content: {
        list: "GET /api/v1/content (admin)",
        byKey: "GET /api/v1/content/:key (public)",
        create: "POST /api/v1/content (admin)",
        update: "PUT /api/v1/content/:key (admin)",
        delete: "DELETE /api/v1/content/:key (admin)",
      },
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
const PORT = Number(process.env.PORT) || 8000;

// Prefer a public URL in production (so docs show correct server)
const publicApiUrl =
  (process.env.PUBLIC_API_URL || "").replace(/\/+$/, "") ||
  `http://localhost:${PORT}`;

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Ellcworth API",
      version: "1.0.0",
      description: "Auth, Users, Shipments & Content for Ellcworth backend.",
    },
    servers: [{ url: publicApiUrl }],
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
app.use("/api/v1/content", contentRoute);

// Legacy aliases (temporary)
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

  // Only expose stack in non-production
  if (!isProd) {
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
const MONGO_URI = process.env.MONGO_URI || process.env.DB;

if (!MONGO_URI) {
  console.error("❌ No Mongo URI found. Set MONGO_URI (or DB) in your .env.");
  process.exit(1);
}

// Recommended mongoose setting (avoids warnings in some setups)
mongoose.set("strictQuery", true);

let server = null;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ DB connection successful");
    server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err.message);
    process.exit(1);
  });

// Graceful shutdown (Render/Railway/Fly will send SIGTERM)
const shutdown = async (signal) => {
  try {
    console.log(`🛑 Received ${signal}. Shutting down gracefully...`);
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await mongoose.connection.close(false);
    console.log("✅ Shutdown complete");
    process.exit(0);
  } catch (e) {
    console.error("❌ Shutdown error:", e?.message || e);
    process.exit(1);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

module.exports = app;
