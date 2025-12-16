const mongoose = require("mongoose");

const CalendarEventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    time: { type: String, default: "" }, // HH:mm
    tag: { type: String, default: "Operations" },
    meta: { type: String, default: "" },

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
  },
  { timestamps: true }
);

module.exports = mongoose.model("CalendarEvent", CalendarEventSchema);
