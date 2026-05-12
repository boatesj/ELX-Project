const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");
const path = require("path");

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
const marketingRoute = require("./routes/marketing");

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
  ).filter(Boolean),
);

app.use(
  cors({
    origin(origin, cb) {
      // Allow same-origin / curl / server-to-server (no Origin header)
      if (!origin) return cb(null, true);

      if (allowlist.size === 0) {
        // If nothing configured, fail-open in dev, fail-closed in prod
        if (process.env.NODE_ENV === "production")
          return cb(new Error("CORS blocked"));
        return cb(null, true);
      }

      if (allowlist.has(origin)) return cb(null, true);
      return cb(new Error("CORS blocked"));
    },
    credentials: true,
  }),
);

// --------------------
// MIDDLEWARES
// --------------------
app.use(express.json({ limit: "1mb" }));
app.use(helmet());
app.use(apiLimiter);

if (process.env.NODE_ENV === "development" && morgan) app.use(morgan("dev"));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --------------------
// HEALTH CHECK
// --------------------
app.get("/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// --------------------
// SEO
// --------------------
app.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.send(`User-agent: *
Allow: /
Sitemap: https://www.ellcworth.com/sitemap.xml`);
});

app.get("/sitemap.xml", async (req, res) => {
  const pages = [
    { url: "/",                        changefreq: "weekly",  priority: "1.0" },
    { url: "/destinations/ghana",      changefreq: "monthly", priority: "0.9" },
    { url: "/institutional",           changefreq: "monthly", priority: "0.9" },
    { url: "/services/air",            changefreq: "monthly", priority: "0.8" },
    { url: "/services/jit",            changefreq: "monthly", priority: "0.8" },
    { url: "/services/roro",           changefreq: "monthly", priority: "0.8" },
    { url: "/services/container",      changefreq: "monthly", priority: "0.8" },
    { url: "/services/repacking",      changefreq: "monthly", priority: "0.7" },
    { url: "/services/customs",        changefreq: "monthly", priority: "0.7" },
    { url: "/map",                     changefreq: "monthly", priority: "0.7" },
    { url: "/about",                   changefreq: "yearly",  priority: "0.6" },
    { url: "/insights",                changefreq: "weekly",  priority: "0.6" },
    { url: "/contact",                 changefreq: "yearly",  priority: "0.5" },
  ];
  const lastmod = new Date().toISOString().split("T")[0];
  const urls = pages.map(p => `
  <url>
    <loc>https://www.ellcworth.com${p.url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join("\n");
  res.header("Content-Type", "application/xml");
  res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`);
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
        ports: "/api/v1/config/ports",
        serviceTypes: "/api/v1/config/service-types",
        cargoCategories: "/api/v1/config/cargo-categories",
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
      schemas: {
        RegisterRequest: {
          type: "object",
          required: ["fullname", "email", "password", "country", "address"],
          properties: {
            fullname: { type: "string", example: "Test User" },
            email: { type: "string", example: "test@example.com" },
            password: { type: "string", example: "Passw0rd!" },
            country: { type: "string", example: "UK" },
            address: { type: "string", example: "1 Demo Street" },
            age: { type: "integer", example: 33 },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", example: "test@example.com" },
            password: { type: "string", example: "Passw0rd!" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            _id: { type: "string" },
            fullname: { type: "string" },
            email: { type: "string" },
            role: { type: "string", example: "user" },
            status: { type: "string", example: "pending" },
            accessToken: { type: "string" },
          },
        },
      },
    },
    paths: {
      // ... unchanged swagger paths ...
    },
  },
  apis: [],
});

app.use(
  "/docs",
  swaggerUI.serve,
  swaggerUI.setup(swaggerSpec, { explorer: true }),
);

// --------------------
// ROUTES
// --------------------
app.use("/auth", authLimiter, authRoute);
app.use("/api/v1/auth", authLimiter, authRoute);

// Canonical (v1) — plural URLs, singular filenames
app.use("/api/v1/users", userRoute);
app.use("/api/v1/shipments", shipmentRoute);

// Legacy aliases (temporary) + logging
app.use(
  "/users",
  (req, _res, next) => {
    console.warn("LEGACY HIT:", req.method, req.originalUrl);
    next();
  },
  userRoute,
);

app.use(
  "/shipments",
  (req, _res, next) => {
    console.warn("LEGACY HIT:", req.method, req.originalUrl);
    next();
  },
  shipmentRoute,
);

// Config (ports, service types, cargo categories)
app.use("/api/v1/config", configRoute);

// Admin system routes
app.use("/api/v1/admin/settings", settingsRoute);
app.use("/api/v1/admin/backups", backupsRoute);
app.use("/api/v1/admin/analytics", analyticsRoute);
app.use("/api/v1/admin/logs", logsRoute);
app.use("/api/v1/admin/calendar", calendarRoute);
app.use("/api/v1/marketing", marketingRoute);

// --------------------
// 404 (in JSON)
// --------------------
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: "Not found",
    path: req.originalUrl,
  });
});

// --------------------
// ERROR HANDLER (hardened)
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

  return res.status(status).json(payload);
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
