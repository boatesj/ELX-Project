const mongoose = require("mongoose");

const recipientSchema = new mongoose.Schema({
  subscriberId: { type: mongoose.Schema.Types.ObjectId, ref: "Subscriber" },
  email:        { type: String, required: true },
  name:         { type: String, default: "" },
  messageId:    { type: String, default: "" }, // Postmark MessageID
  opened:       { type: Boolean, default: false },
  openedAt:     { type: Date,    default: null },
  openCount:    { type: Number,  default: 0 },
}, { _id: false });

const campaignSchema = new mongoose.Schema(
  {
    subject:    { type: String, required: true },
    tags:       { type: [String], default: [] },
    sentCount:  { type: Number, default: 0 },
    failCount:  { type: Number, default: 0 },
    openCount:  { type: Number, default: 0 },
    recipients: { type: [recipientSchema], default: [] },
    sentBy:     { type: String, default: "admin" },
  },
  { timestamps: true }
);

// Fast lookup by Postmark MessageID for webhook
campaignSchema.index({ "recipients.messageId": 1 });

module.exports = mongoose.model("Campaign", campaignSchema);
