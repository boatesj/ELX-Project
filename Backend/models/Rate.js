const mongoose = require("mongoose");

const RateSchema = new mongoose.Schema(
  {
    destination: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      enum: ["ghana", "nigeria", "kenya", "sierra-leone", "cote-divoire"],
    },
    service: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      enum: ["roro", "fcl20", "fcl40", "lcl", "air"],
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    priceFrom: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "GBP",
      trim: true,
      uppercase: true,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

RateSchema.index({ destination: 1, service: 1 }, { unique: true });

module.exports = mongoose.model("Rate", RateSchema);