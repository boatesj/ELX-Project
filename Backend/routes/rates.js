const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const {
  getRates,
  createRate,
  updateRate,
  deleteRate,
} = require("../controllers/rates");

const router = express.Router();

// Public — powers the instant quote estimate on destination pages
router.get("/", getRates);

// Admin only — editing rates from the admin panel
router.post("/", requireAuth, requireRole("admin"), createRate);
router.put("/:id", requireAuth, requireRole("admin"), updateRate);
router.delete("/:id", requireAuth, requireRole("admin"), deleteRate);

module.exports = router;
