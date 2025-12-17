const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const {
  getSettings,
  updateSettings,
  testEmail,
} = require("../controllers/settings");

const router = express.Router();

router.get("/", requireAuth, requireRole("admin"), getSettings);
router.put("/", requireAuth, requireRole("admin"), updateSettings);
router.post("/test-email", requireAuth, requireRole("admin"), testEmail);

module.exports = router;
