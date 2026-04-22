const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const {
  addSubscriber,
  getSubscribers,
  unsubscribe,
  sendCampaign,
  uploadImage,
} = require("../controllers/marketing");

const { requireAuth, requireAdmin } = require("../middleware/auth");

// -----------------------------------------------
// Public — anyone can subscribe (e.g. from quote form)
// -----------------------------------------------
router.post("/subscribers", addSubscriber);

// -----------------------------------------------
// Admin only — manage subscribers and send campaigns
// -----------------------------------------------
router.get("/subscribers", requireAuth, requireAdmin, getSubscribers);
router.delete("/subscribers/:id", requireAuth, requireAdmin, unsubscribe);
router.post("/campaigns/send", requireAuth, requireAdmin, sendCampaign);

router.post("/upload-image", requireAuth, requireAdmin, upload.single("image"), uploadImage);

module.exports = router;
