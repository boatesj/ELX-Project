const mongoose = require("mongoose");

const SettingSchema = new mongoose.Schema(
  {
    company: {
      companyName: { type: String, default: "Ellcworth Express Ltd" },
      tradingName: { type: String, default: "Ellcworth Express" },
      currency: { type: String, default: "GBP" },
      timezone: { type: String, default: "Europe/London" },
    },
    operations: {
      defaultOriginCountry: { type: String, default: "UK" },
      defaultDestinationCountry: { type: String, default: "GH" },
      refPrefix: { type: String, default: "ELX" },
      defaultIncoterm: { type: String, default: "CIF" },
    },
    security: {
      requireMfa: { type: String, default: "recommended" }, // required|recommended|off
      sessionTimeoutMinutes: { type: Number, default: 60 },
      passwordMinLength: { type: Number, default: 10 },
      lockoutThreshold: { type: Number, default: 5 },
      logAllAdminActions: { type: Boolean, default: true },
    },
    notifications: {
      shipmentStatusUpdates: { type: Boolean, default: true },
      paymentConfirmations: { type: Boolean, default: true },
      documentRequests: { type: Boolean, default: true },
      fromName: { type: String, default: "Ellcworth Express" },
      replyTo: { type: String, default: "support@ellcworth.com" },
      overdueHours: { type: Number, default: 48 },
      digestTime: { type: String, default: "08:30" }, // HH:mm
    },
    integrations: {
      googleMapsEnabled: { type: Boolean, default: false },
      paymentsEnabled: { type: Boolean, default: false },
      vinLookupEnabled: { type: Boolean, default: false },
      portSchedulesEnabled: { type: Boolean, default: false },
      webhookUrl: { type: String, default: "" },
      webhooksEnabled: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Setting", SettingSchema);
