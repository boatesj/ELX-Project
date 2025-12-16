const mongoose = require("mongoose");

const BackupJobSchema = new mongoose.Schema(
  {
    type: { type: String, default: "Manual" }, // Manual|Auto
    status: { type: String, default: "Success" }, // Success|Failed|Running
    fileName: { type: String, default: "" },
    fileSizeBytes: { type: Number, default: 0 },
    error: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BackupJob", BackupJobSchema);
