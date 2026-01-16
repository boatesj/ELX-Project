const mongoose = require("mongoose");

const ContentBlockSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Store as markdown/plain text (rendering choice is frontend concern)
    body: {
      type: String,
      required: true,
      trim: true,
    },

    // Optional audit info (can be populated by middleware later)
    updatedBy: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContentBlock", ContentBlockSchema);
