const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema({
  text:      { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: String, default: "admin" },
}, { _id: true });

const ProspectSchema = new mongoose.Schema({
  name:    { type: String, required: true, trim: true },
  email:   { type: String, trim: true, lowercase: true, default: "" },
  phone:   { type: String, trim: true, default: "" },
  address: { type: String, trim: true, default: "" },
  company: { type: String, trim: true, default: "" },

  sector: {
    type: String,
    required: true,
    enum: [
      "secure_print",
      "lab_equipment",
      "it_hardware",
      "vehicle_exporters",
      "charities_ngos",
      "commercial_vendors",
      "uk_universities",
      "ghana_public_universities",
      "ghana_private_universities",
      "ghana_health",
      "mining",
      "automotive_importers",
      "ghanaian_smes",
      "ghana_ngos",
    ],
  },

  channel: {
    type: String,
    enum: ["email", "linkedin", "whatsapp", "phone", "in_person", "referral"],
    default: "email",
  },

  stage: {
    type: String,
    enum: ["cold", "contacted", "responded", "meeting", "quote_sent", "converted", "dead"],
    default: "cold",
  },

  playbookDay: {
    type: Number,
    enum: [0, 1, 3, 7, 14, 21, 30, 60, 90],
    default: 0,
  },

  nextActionDate: { type: Date, default: null },
  nextActionNote: { type: String, default: "" },

  caseStudySent: {
    name: { type: String, default: "" },
    sentAt: { type: Date, default: null },
  },

  notes: [NoteSchema],

  convertedAt:  { type: Date, default: null },
  createdBy:    { type: String, default: "admin" },
}, { timestamps: true });

ProspectSchema.index({ sector: 1, stage: 1 });
ProspectSchema.index({ nextActionDate: 1 });

module.exports = mongoose.model("Prospect", ProspectSchema);
