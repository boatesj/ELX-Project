const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const {
  listBackups,
  runBackup,
  downloadBackup,
} = require("../controllers/backups");

const router = express.Router();

router.get("/", requireAuth, requireRole("admin"), listBackups);
router.post("/run", requireAuth, requireRole("admin"), runBackup);
router.get("/:id/download", requireAuth, requireRole("admin"), downloadBackup);

module.exports = router;
