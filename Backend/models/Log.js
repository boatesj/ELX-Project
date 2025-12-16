const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema(
  {
    type: { type: String, required: true }, // settings|backup|calendar|analytics|shipment|user|auth
    actorId: { type: String, default: "" },
    action: { type: String, required: true },
    ref: { type: String, default: "" },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Log", LogSchema);
