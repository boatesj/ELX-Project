const express = require("express");
const {
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
  restoreUser,
} = require("../controllers/user");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Phase 3B hardening: Users API is admin-only (canonical contract)
router.post("/", requireAuth, requireAdmin, createUser);
router.get("/", requireAuth, requireAdmin, getAllUsers);
router.get("/:id", requireAuth, requireAdmin, getUserById);
router.put("/:id", requireAuth, requireAdmin, updateUser);
router.delete("/:id", requireAuth, requireAdmin, deleteUser);
router.patch("/:id/restore", requireAuth, requireAdmin, restoreUser);

// Agreed rate — admin sets/clears on a customer account
router.patch("/:id/agreed-rate", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { amount, currency, description, validUntil, setBy, clear } = req.body;
    const User = require("../models/User");

    const update = clear
      ? { agreedRate: { amount: null, currency: "GBP", description: "", validUntil: null, setBy: "", setAt: null } }
      : { agreedRate: { amount, currency: currency || "GBP", description: description || "", validUntil: validUntil || null, setBy: setBy || "Admin", setAt: new Date() } };

    const user = await User.findByIdAndUpdate(req.params.id, { $set: update }, { new: true, select: "-password" });
    if (!user) return res.status(404).json({ message: "User not found." });
    return res.status(200).json({ message: clear ? "Agreed rate cleared." : "Agreed rate saved.", user });
  } catch (err) {
    console.error("agreed-rate patch error:", err);
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
});

module.exports = router;
