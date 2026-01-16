const router = require("express").Router();
const {
  getContentBlocks,
  getContentBlockByKey,
  createContentBlock,
  updateContentBlockByKey,
  deleteContentBlockByKey,
} = require("../controllers/content");

const { requireAuth, requireAdmin } = require("../middleware/auth");

// Public read (by key) — used by the public site
router.get("/:key", getContentBlockByKey);

// Admin list + CRUD — protected
router.get("/", requireAuth, requireAdmin, getContentBlocks);
router.post("/", requireAuth, requireAdmin, createContentBlock);
router.put("/:key", requireAuth, requireAdmin, updateContentBlockByKey);
router.delete("/:key", requireAuth, requireAdmin, deleteContentBlockByKey);

module.exports = router;
