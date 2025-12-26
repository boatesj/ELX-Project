const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    // CRM / Identity Fields
    accountType: {
      type: String,
      enum: ["Business", "Individual"],
      default: "Business",
    },

    fullname: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    phone: {
      type: String,
      trim: true,
      required: true,
    },

    country: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      trim: true,
    },

    postcode: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    // Optional notes for internal admin use
    notes: {
      type: String,
      trim: true,
    },

    // System + Access Control
    role: {
      type: String,
      // Keep legacy values (Admin/Shipper/etc) + "user"
      enum: ["Shipper", "Consignee", "Both", "Admin", "user"],
      default: "Shipper",
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "active", "suspended"],
      default: "pending",
      trim: true,
      index: true,
    },

    // Password (optional — required only for login users)
    password: {
      type: String,
      select: false,
    },

    // Additional fields from old system
    age: { type: Number, min: 0, max: 130 },

    // Soft delete + onboarding
    isDeleted: { type: Boolean, default: false, index: true },
    welcomeMailSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/**
 * Hash password only when present AND modified.
 * Allows admin-created CRM users (no password yet).
 */
UserSchema.pre("save", async function (next) {
  try {
    if (!this.password) return next(); // No password provided
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 12);
    return next();
  } catch (err) {
    return next(err);
  }
});

/**
 * Compare password for login users.
 */
UserSchema.methods.comparePassword = function (candidate) {
  if (!this.password) return false; // No password set
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", UserSchema);
