const express = require("express");
const router = express.Router();
const { globalSearch } = require("../controllers/search");
const { requireAuth, requireAdmin } = require("../middleware/auth");

router.get("/", requireAuth, requireAdmin, globalSearch);

module.exports = router;
