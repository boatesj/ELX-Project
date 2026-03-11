// BackgroundServices/EmailService/QuoteReminderEmail.js

const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
const { dispatchMail } = require("../helpers/sendmail");
const Shipment = require("../models/Shipment");

dotenv.config();

const QuoteReminderEmail = async () => {
  try {
    const enabled =
      String(process.env.REMINDERS_ENABLED || "false").toLowerCase() === "true";
    if (!enabled) return;

    const afterMinutes = Number(
      process.env.REMINDER_QUOTE_AFTER_MINUTES || 1440,
    );
    const cutoff = new Date(Date.now() - afterMinutes * 60 * 1000);

    const statuses = String(process.env.REMINDER_TARGET_STATUSES || "quoted")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const shipments = await Shipment.find({
      status: { $in: statuses },
      isDeleted: false,
      "quote.sentAt": { $exists: true, $lte: cutoff },
      "reminders.quoteReminder1SentAt": { $exists: false },
    }).populate("customer", "fullname email");

    if (!shipments.length) {
      return;
    }

    for (const shipment of shipments) {
      const shipper = shipment.shipper || {};
      const ports = shipment.ports || {};
      const quote = shipment.quote || {};

      const customerName =
        shipper.name || shipment?.customer?.fullname || "Customer";

      const validUntil = quote.validUntil
        ? new Date(quote.validUntil).toLocaleDateString("en-GB")
        : "Please contact us";

      const html = await ejs.renderFile(
        path.join(__dirname, "../templates/quoteReminder.ejs"),
        {
          customerName,
          referenceNo: shipment.referenceNo || "N/A",
          originPort: ports.originPort || "TBA",
          destinationPort: ports.destinationPort || "TBA",
          currency: quote.currency || "GBP",
          total:
            typeof quote.total === "number" ? quote.total.toFixed(2) : "0.00",
          validUntil,
        },
      );

      const toEmail =
        shipper.email || shipment?.customer?.email || process.env.SUPPORT_EMAIL;

      const message = {
        from: process.env.EMAIL,
        to: toEmail,
        subject: `Reminder: your quote for ${shipment.referenceNo} is waiting`,
        html,
      };

      try {
        await dispatchMail(message);

        await Shipment.updateOne(
          {
            _id: shipment._id,
            "reminders.quoteReminder1SentAt": { $exists: false },
          },
          { $set: { "reminders.quoteReminder1SentAt": new Date() } },
        );

        console.log(
          `✅ Quote reminder email sent to ${toEmail || "N/A"} for ${shipment.referenceNo}`,
        );
      } catch (mailErr) {
        console.error(
          `❌ Failed to send quote reminder for ${shipment.referenceNo}:`,
          mailErr,
        );
      }
    }
  } catch (err) {
    console.error("❌ Error in QuoteReminderEmail:", err);
  }
};

module.exports = { QuoteReminderEmail };
