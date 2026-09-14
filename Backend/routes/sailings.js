const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const {
  getSailings,
  getAllSailings,
  createSailing,
  updateSailing,
  deleteSailing,
} = require("../controllers/sailings");

const router = express.Router();

// Public — powers the homepage sailing section
router.get("/", getSailings);

// Admin only
router.get("/all", requireAuth, requireRole("admin"), getAllSailings);
router.post("/", requireAuth, requireRole("admin"), createSailing);
router.put("/:id", requireAuth, requireRole("admin"), updateSailing);
router.delete("/:id", requireAuth, requireRole("admin"), deleteSailing);

module.exports = router;
