const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cron = require("node-cron");
const mongoose = require("mongoose");

// Import all email jobs
const { sendWelcomeMail } = require("./EmailService/WelcomeEmail");
const { PendingShipmentEmail } = require("./EmailService/PendingShipment");
const { DeliveredShipmentEmail } = require("./EmailService/DeliveredShipment");

dotenv.config();

// --- DB CONNECTION ---
const DB = process.env.MONGO_URI || process.env.DB;

if (!DB) {
  throw new Error("No Mongo URI found (set MONGO_URI or DB)");
}

const remindersEnabled =
  String(process.env.REMINDERS_ENABLED || "true").toLowerCase() === "true";

app.get("/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    service: "backgroundservices",
    remindersEnabled,
    mongoReadyState: mongoose.connection.readyState,
  });
});

mongoose
  .connect(DB)
  .then(() => {
    console.log("✅ DB connection is successful");
  })
  .catch((e) => {
    console.error("❌ DB connection failed:", e.message);
  });

// --- TASK SCHEDULER ---
const runJobs = async () => {
  console.log("⏰ Running scheduled background tasks...");
  try {
    await sendWelcomeMail();
    await PendingShipmentEmail();
    await DeliveredShipmentEmail();
    console.log("✅ All background email jobs completed successfully.");
  } catch (err) {
    console.error("❌ Error running scheduled tasks:", err);
  }
};

const run = () => {
  if (!remindersEnabled) {
    console.log("ℹ️ Background jobs are disabled (REMINDERS_ENABLED=false).");
    return;
  }

  // Run every minute for testing / live polling
  cron.schedule("* * * * *", async () => {
    await runJobs();
  });

  console.log("✅ Cron scheduler started (runs every minute).");
};

run();

// --- SERVER ---
const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(`🚀 BackgroundServices is running on port ${PORT}`);
});
