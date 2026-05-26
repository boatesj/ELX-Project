const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const UserSchema = new mongoose.Schema(
  {
    // Customer or Staff — drives form behaviour and data requirements
    userCategory: {
      type: String,
      enum: ["customer", "staff"],
      default: "customer",
      index: true,
    },
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
    },
    country: {
      type: String,
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
    // Agreed rate — set by admin, visible to customer on new booking
    agreedRate: {
      amount:      { type: Number, default: null },
      currency:    { type: String, default: "GBP" },
      description: { type: String, default: "" },
      validUntil:  { type: Date, default: null },
      setBy:       { type: String, default: "" },
      setAt:       { type: Date, default: null },
    },
  },
  { timestamps: true }
);

/**
 * Hash password only when present AND modified.
 * Allows admin-created CRM users (no password yet).
 */
UserSchema.pre("save", async function (next) {
  try {
    if (!this.password) return next();
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
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", UserSchema);
