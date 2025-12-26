const express = require("express");
const {
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
} = require("../controllers/user");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Phase 3B hardening: Users API is admin-only (canonical contract)
router.post("/", requireAuth, requireAdmin, createUser);
router.get("/", requireAuth, requireAdmin, getAllUsers);
router.get("/:id", requireAuth, requireAdmin, getUserById);
router.put("/:id", requireAuth, requireAdmin, updateUser);
router.delete("/:id", requireAuth, requireAdmin, deleteUser);

module.exports = router;
