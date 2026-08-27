// Backend/routes/feedback.js
const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const {
  requestFeedback,
  getFeedbackByToken,
  submitFeedback,
  listFeedback,
  approveFeedback,
  rejectFeedback,
} = require("../controllers/feedback");

const { requireAuth, requireAdmin } = require("../middleware/auth");

// Same shape as publicQuoteLimiter in routes/shipment.js — this endpoint is
// public (token-gated, not logged in), so it needs its own throttle.
const publicSubmitLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, message: "Too many attempts — please try again in 10 minutes." },
});

// -----------------------------------------------
// Admin only — create requests, review, publish
// -----------------------------------------------
router.post("/request", requireAuth, requireAdmin, requestFeedback);
router.patch("/:id/approve", requireAuth, requireAdmin, approveFeedback);
router.patch("/:id/reject", requireAuth, requireAdmin, rejectFeedback);

// -----------------------------------------------
// Public — token-gated survey + homepage testimonials feed
// -----------------------------------------------
router.get("/:token", publicSubmitLimiter, getFeedbackByToken);
router.post("/:token/submit", publicSubmitLimiter, submitFeedback);

// -----------------------------------------------
// Listing — public branch filters to isPublic+approved inside the
// controller; admin branch (no ?public=true) needs auth.
// -----------------------------------------------
router.get("/", (req, res, next) => {
  if (req.query.public === "true") return listFeedback(req, res, next);
  return requireAuth(req, res, () => requireAdmin(req, res, () => listFeedback(req, res, next)));
});

module.exports = router;
