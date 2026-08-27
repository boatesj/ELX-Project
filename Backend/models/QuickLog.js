// Backend/models/QuickLog.js
//
// Distinct from Prospect (Backend/models/Prospect.js): Prospect is the
// pre-sale outreach pipeline (cold → contacted → converted). QuickLog is
// for customers who have ALREADY transacted with you outside the platform —
// existing relationships carried over from before the website, logged after
// the fact so you can still request feedback from them.

const mongoose = require("mongoose");

const QuickLogSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    organisation: { type: String, trim: true, default: "" },
    contactEmail: { type: String, trim: true, lowercase: true, default: "" },
    contactPhone: { type: String, trim: true, default: "" },
    serviceType: {
      type: String,
      enum: ["Air Freight", "RoRo", "FCL/LCL", "Document", "Other"],
      required: true,
    },
    notes: { type: String, trim: true, default: "" }, // route, cargo, whatever's worth remembering
    loggedAt: { type: Date, default: Date.now },
    feedbackRequested: { type: Boolean, default: false },
    feedbackId: { type: mongoose.Schema.Types.ObjectId, ref: "Feedback", default: null },
    createdBy: { type: String, default: "admin" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("QuickLog", QuickLogSchema);
