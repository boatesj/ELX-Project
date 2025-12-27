const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const {
  registerUser,
  loginUser,
  customerLoginUser, // ✅ new
  requestPasswordReset,
  resetPassword,
} = require("../controllers/auth");
const { validateLogin, validateRegister } = require("../utils/validators");
const { handleValidation } = require("../middleware/validate");

const router = express.Router();

/** JWT auth middleware */
function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token)
    return res.status(401).json({ ok: false, message: "Missing token" });

  const secret = process.env.JWT_SECRET || process.env.JWT_SEC;
  if (!secret)
    return res
      .status(500)
      .json({ ok: false, message: "JWT secret not configured" });

  try {
    const decoded = jwt.verify(token, secret); // { id, role }
    req.user = decoded;
    return next();
  } catch (e) {
    return res
      .status(401)
      .json({ ok: false, message: "Invalid or expired token" });
  }
}

/** POST /auth/register */
router.post("/register", validateRegister, handleValidation, registerUser);

/** POST /auth/login (generic) */
router.post("/login", validateLogin, handleValidation, loginUser);

/**
 * ✅ POST /auth/customer/login (customer-only)
 * - refuses admin accounts
 * - returns { ok, token, user }
 */
router.post(
  "/customer/login",
  validateLogin,
  handleValidation,
  customerLoginUser
);

/** GET /auth/me (protected) */
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password -__v")
      .lean();

    if (!user)
      return res.status(404).json({ ok: false, message: "User not found" });

    return res.json({ ok: true, data: user });
  } catch (err) {
    console.error("Error fetching profile:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Server error", error: err.message });
  }
});

/** PATCH /auth/me — Update profile */
router.patch("/me", requireAuth, async (req, res) => {
  try {
    const allowedFields = [
      "fullname",
      "phone",
      "country",
      "city",
      "postcode",
      "address",
    ];

    const updates = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
      select: "-password -__v",
    });

    if (!updatedUser)
      return res.status(404).json({ ok: false, message: "User not found" });

    return res.json({
      ok: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    console.error("Profile update error:", err);
    return res.status(500).json({
      ok: false,
      message: "Failed to update profile",
      error: err.message,
    });
  }
});

/** PATCH /auth/me/password — Change password */
router.patch("/me/password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ ok: false, message: "Both passwords are required" });
    }

    const user = await User.findById(req.user.id).select("+password");
    if (!user)
      return res.status(404).json({ ok: false, message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ ok: false, message: "Current password is incorrect" });

    user.password = newPassword; // triggers hashing via pre-save hook
    await user.save();

    return res.json({
      ok: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error("Password update error:", err);
    return res.status(500).json({
      ok: false,
      message: "Failed to update password",
      error: err.message,
    });
  }
});

/** Password reset flow */
router.get("/reset-password/:token", requestPasswordReset);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
