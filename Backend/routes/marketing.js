const express = require("express");
const router = express.Router();
const {
  addSubscriber,
  getSubscribers,
  unsubscribe,
  sendCampaign,
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

module.exports = router;
