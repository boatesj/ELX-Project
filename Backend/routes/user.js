const express = require("express");
const { createUser, deleteUser, getAllUsers } = require("../controllers/user");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.post("/", requireAuth, requireRole("admin"), createUser);
router.get("/", requireAuth, requireRole("admin"), getAllUsers);
router.delete("/:id", requireAuth, requireRole("admin"), deleteUser);

module.exports = router;
