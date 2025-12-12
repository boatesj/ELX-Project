const express = require("express");
const {
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
} = require("../controllers/user");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.post("/", requireAuth, requireRole("admin"), createUser);
router.get("/", requireAuth, requireRole("admin"), getAllUsers);
router.get("/:id", requireAuth, requireRole("admin"), getUserById);
router.put("/:id", requireAuth, requireRole("admin"), updateUser);
router.delete("/:id", requireAuth, requireRole("admin"), deleteUser);

module.exports = router;
