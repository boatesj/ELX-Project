// Backend/routes/quickLog.js
const express = require("express");
const router = express.Router();

const { getQuickLogs, createQuickLog, deleteQuickLog } = require("../controllers/quickLog");
const { requireAuth, requireAdmin } = require("../middleware/auth");

router.get("/", requireAuth, requireAdmin, getQuickLogs);
router.post("/", requireAuth, requireAdmin, createQuickLog);
router.delete("/:id", requireAuth, requireAdmin, deleteQuickLog);

module.exports = router;
