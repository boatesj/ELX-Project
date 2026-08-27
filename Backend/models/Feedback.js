// Backend/models/Feedback.js
const mongoose = require("mongoose");
const crypto = require("crypto");

const FeedbackSchema = new mongoose.Schema(
  {
    // Where this request originated — determines what pre-fill data exists,
    // not how the flow behaves downstream.
    source: {
      type: String,
      enum: ["shipment", "quicklog", "manual"],
      required: true,
    },
    shipmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Shipment", default: null },
    quickLogId: { type: mongoose.Schema.Types.ObjectId, ref: "QuickLog", default: null },

    // Always populated regardless of source.
    clientName: { type: String, required: true, trim: true },
    clientTitle: { type: String, trim: true, default: "" }, // e.g. "Director of Procurement"
    organisation: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },

    // Freetext description of the job — used for context in Admin, never shown publicly.
    context: { type: String, trim: true, default: "" },

    // One-time token embedded in the emailed link.
    token: {
      type: String,
      required: true,
      unique: true,
      default: () => crypto.randomBytes(24).toString("hex"),
    },

    status: {
      type: String,
      enum: ["pending", "submitted", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    // Survey answers — null until submitted.
    rating: { type: Number, min: 1, max: 5, default: null },
    answers: {
      communication: { type: Number, min: 1, max: 5, default: null },
      timeliness: {
        type: String,
        enum: ["Yes", "Mostly", "No", null],
        default: null,
      },
      wouldRecommend: { type: Boolean, default: null },
      recommendReason: { type: String, trim: true, default: "" }, // public quote draft
      improvementNote: { type: String, trim: true, default: "" }, // private, never public
    },

    // What actually appears on the site, once approved. Edit in Admin before
    // flipping isPublic — recommendReason above is the raw draft, not final copy.
    displayName: { type: String, trim: true, default: "" }, // e.g. "Director, University of Ghana"
    displayQuote: { type: String, trim: true, default: "" },
    isPublic: { type: Boolean, default: false },

    respondedAt: { type: Date, default: null },
    createdBy: { type: String, default: "admin" },
  },
  { timestamps: true },
);

FeedbackSchema.index({ isPublic: 1, status: 1 });

module.exports = mongoose.model("Feedback", FeedbackSchema);
