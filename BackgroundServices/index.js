// BackgroundServices/index.js

const path = require("path");
const dotenv = require("dotenv");
const { QuoteReminderEmail } = require("./EmailService/QuoteReminderEmail");

// Load env FIRST (before importing any modules that read process.env at require-time)
dotenv.config({ path: path.resolve(__dirname, ".env") });

// Optional fallback: repo-root .env (harmless if not present)
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const express = require("express");
const cron = require("node-cron");
const mongoose = require("mongoose");

const app = express();

// Import all email jobs (now safe because env is already loaded)
const { sendWelcomeMail } = require("./EmailService/WelcomeEmail");
const { PendingShipmentEmail } = require("./EmailService/PendingShipment");
const { DeliveredShipmentEmail } = require("./EmailService/DeliveredShipment");

// --- DB CONNECTION ---
const DB = process.env.MONGO_URI || process.env.DB;

if (!DB) {
  throw new Error("No Mongo URI found (set MONGO_URI or DB)");
}

mongoose
  .connect(DB)
  .then(() => {
    console.log("✅ DB connection is successful");
  })
  .catch((e) => {
    console.error("❌ DB connection failed:", e.message);
  });

// --- TASK SCHEDULER ---
const run = () => {
  // Run every minute for testing
  cron.schedule("* * * * *", async () => {
    console.log("⏰ Running scheduled background tasks...");
    try {
      await sendWelcomeMail();
      await PendingShipmentEmail();
      await QuoteReminderEmail();
      await DeliveredShipmentEmail();
      console.log("✅ All background email jobs completed successfully.");
    } catch (err) {
      console.error("❌ Error running scheduled tasks:", err);
    }
  });
};

run();

// --- SERVER ---
const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(`🚀 BackgroundServices is running on port ${PORT}`);
});
