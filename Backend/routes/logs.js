const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const { listLogs } = require("../controllers/logs");

const router = express.Router();

router.get("/", requireAuth, requireRole("admin"), listLogs);

module.exports = router;
