const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const { getSettings, updateSettings } = require("../controllers/settings");

const router = express.Router();

router.get("/", requireAuth, requireRole("admin"), getSettings);
router.put("/", requireAuth, requireRole("admin"), updateSettings);

module.exports = router;
