const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const { overview } = require("../controllers/analytics");

const router = express.Router();

router.get("/overview", requireAuth, requireRole("admin"), overview);

module.exports = router;
