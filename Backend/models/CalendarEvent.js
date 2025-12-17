const mongoose = require("mongoose");

const CalendarEventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    date: { type: String, required: true, trim: true }, // YYYY-MM-DD
    time: { type: String, default: "", trim: true }, // HH:mm
    tag: { type: String, default: "Operations", trim: true },
    meta: { type: String, default: "", trim: true },

    // Optional links
    shipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shipment",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // New (backward compatible)
    source: {
      type: String,
      default: "manual", // manual | shipment | holiday
      trim: true,
    },
    kind: {
      type: String,
      default: "event", // event | milestone | reminder | holiday
      trim: true,
    },
  },
  { timestamps: true }
);

// Helpful index for range queries
CalendarEventSchema.index({ date: 1, time: 1 });
CalendarEventSchema.index({ shipmentId: 1, source: 1, kind: 1 });

module.exports = mongoose.model("CalendarEvent", CalendarEventSchema);
