const mongoose = require("mongoose");

const SailingSchema = new mongoose.Schema(
  {
    mode: {
      type: String,
      required: true,
      enum: ["sea", "roro", "air"],
    },
    vesselOrRoute: {
      type: String,
      required: true,
      trim: true,
    },
    departurePort: {
      type: String,
      required: true,
      trim: true,
    },
    destinationPort: {
      type: String,
      required: true,
      trim: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      enum: ["ghana", "nigeria", "kenya", "sierra-leone", "cote-divoire", "benin", "multiple"],
    },
    closingDate: {
      type: Date,
      required: true,
    },
    departureDate: {
      type: Date,
      required: true,
    },
    eta: {
      type: Date,
      default: null,
    },
    spacesLabel: {
      type: String,
      trim: true,
      default: "Available",
    },
    frequency: {
      type: String,
      enum: ["once", "daily", "weekly", "twice-weekly"],
      default: "once",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Auto-hide past sailings
SailingSchema.index({ departureDate: 1 });
SailingSchema.index({ mode: 1, departureDate: 1 });

module.exports = mongoose.model("Sailing", SailingSchema);
