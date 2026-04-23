const mongoose = require("mongoose");

const subscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    name: {
      type: String,
      trim: true,
      default: "",
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    // How they joined the list
    source: {
      type: String,
      enum: ["quote_form", "manual", "import"],
      default: "manual",
    },

    // Tag by service interest for targeted campaigns
    tags: {
      type: [String],
      enum: ["container", "roro", "air", "general", "test"],
      default: ["general"],
    },

    // GDPR — did they explicitly opt in?
    optedIn: {
      type: Boolean,
      default: false,
    },

    optedInAt: {
      type: Date,
      default: null,
    },

    // Allow unsubscribe
    unsubscribed: {
      type: Boolean,
      default: false,
    },

    unsubscribedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscriber", subscriberSchema);
