const router = require("express").Router();
const {
  getContentBlocks,
  getContentBlockByKey,
  createContentBlock,
  updateContentBlockByKey,
  deleteContentBlockByKey,
} = require("../controllers/content");

// If you have auth middleware, you can plug it in here:
// const { verifyTokenAndAdmin } = require("../middleware/verifyToken");
// then wrap the handlers, e.g. router.post("/", verifyTokenAndAdmin, createContentBlock);

// Public read (by key)
router.get("/:key", getContentBlockByKey);

// Admin list + CRUD
router.get("/", getContentBlocks);
router.post("/", createContentBlock);
router.put("/:key", updateContentBlockByKey);
router.delete("/:key", deleteContentBlockByKey);

module.exports = router;
