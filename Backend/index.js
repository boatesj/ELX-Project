const express = require("express");
const dotenv = require("dotenv");
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

const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");
const shipmentRoute = require("./routes/shipment");
// NEW
const configRoute = require("./routes/config");
const settingsRoute = require("./routes/settings");
const backupsRoute = require("./routes/backups");
const analyticsRoute = require("./routes/analytics");
const logsRoute = require("./routes/logs");
const calendarRoute = require("./routes/calendar");

dotenv.config();
const app = express();

// --- RATE LIMITERS (auth endpoints) ---
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

// --- MIDDLEWARES ---
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(helmet());
if (process.env.NODE_ENV === "development" && morgan) app.use(morgan("dev"));

// --- HEALTH CHECK ---
app.get("/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// --- ROOT ---
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
      users: "GET /users (admin), DELETE /users/:id (admin)",
      shipments: "CRUD /shipments, admin ops at /shipments/:id/*",
      // NEW: quick hint in root payload (optional)
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

// --- SWAGGER SETUP ---
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
        TrackingEvent: {
          type: "object",
          properties: {
            code: { type: "string", example: "SAILED" },
            description: { type: "string", example: "Vessel sailed from SOU" },
            at: { type: "string", format: "date-time" },
            location: { type: "string", example: "Southampton" },
            meta: { type: "object" },
          },
        },
        Document: {
          type: "object",
          properties: {
            type: { type: "string", example: "BOL" },
            url: {
              type: "string",
              example: "https://cdn.example.com/bol123.pdf",
            },
          },
        },
        ShipmentMinimal: {
          type: "object",
          properties: {
            customer: { type: "string", example: "64f1e2c7a1b2c3d4e5f6a7b8" },
            cargoType: { type: "string", example: "vehicle" },
            ports: {
              type: "object",
              properties: {
                originPort: { type: "string", example: "Southampton" },
                destinationPort: { type: "string", example: "Tema" },
              },
            },
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
  swaggerUI.setup(swaggerSpec, { explorer: true })
);

// --- ROUTES ---
app.use("/auth", authLimiter, authRoute);
app.use("/users", userRoute);
app.use("/shipments", shipmentRoute);
app.use("/api/v1/shipments", shipmentRoute);
// NEW: config (ports, service types, cargo categories)
app.use("/config", configRoute);
// --- ADMIN SYSTEM ROUTES (Settings → Calendar)
app.use("/admin/settings", settingsRoute);
app.use("/admin/backups", backupsRoute);
app.use("/admin/analytics", analyticsRoute);
app.use("/admin/logs", logsRoute);
app.use("/admin/calendar", calendarRoute);

// --- DB + SERVER START ---
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

// --- ERROR HANDLER ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ ok: false, message: "Something went wrong", error: err.message });
});

module.exports = app;
