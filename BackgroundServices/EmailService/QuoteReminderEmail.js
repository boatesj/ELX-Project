// BackgroundServices/EmailService/QuoteReminderEmail.js

/**
 * Reminder v1 (go-live safe)
 * - One reminder only (e.g. 24h after quote email sent)
 * - Kill-switch via REMINDERS_ENABLED
 * - Idempotent via reminders.quoteReminder1SentAt
 *
 * IMPORTANT:
 * This job assumes shipments store:
 *   quote.sentAt (Date)                       // set by Backend when quote email is sent
 *   reminders.quoteReminder1SentAt (Date|null) // set by this job after reminder send
 */

const Shipment = require("../models/Shipment");

async function QuoteReminderEmail() {
  const enabled =
    String(process.env.REMINDERS_ENABLED || "false").toLowerCase() === "true";
  if (!enabled) return;

  // Default 24h; in dev you can set 2 for fast testing.
  const afterMinutes = Number(process.env.REMINDER_QUOTE_AFTER_MINUTES || 1440);
  const cutoff = new Date(Date.now() - afterMinutes * 60 * 1000);

  // Status target (default: quoted)
  const statuses = String(process.env.REMINDER_TARGET_STATUSES || "quoted")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const due = await Shipment.find({
    isDeleted: false,
    status: { $in: statuses },
    "quote.sentAt": { $exists: true, $lte: cutoff },
    "reminders.quoteReminder1SentAt": { $exists: false },
  }).limit(200);

  if (!due.length) return;

  for (const shipment of due) {
    try {
      // TODO: replace with your actual send function
      // For now we just mark so it cannot spam.
      await Shipment.updateOne(
        {
          _id: shipment._id,
          "reminders.quoteReminder1SentAt": { $exists: false },
        },
        { $set: { "reminders.quoteReminder1SentAt": new Date() } },
      );

      // eslint-disable-next-line no-console
      console.log(`📩 Quote reminder queued/sent for shipment ${shipment._id}`);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(
        `❌ QuoteReminderEmail failed for shipment ${shipment?._id}:`,
        err.message,
      );
    }
  }
}

module.exports = { QuoteReminderEmail };
