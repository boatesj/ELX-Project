const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const {
  listEvents,
  createEvent,
  syncFromShipments,
} = require("../controllers/calendar");

const router = express.Router();

router.get("/events", requireAuth, requireRole("admin"), listEvents);
router.post("/events", requireAuth, requireRole("admin"), createEvent);
router.post(
  "/sync-from-shipments",
  requireAuth,
  requireRole("admin"),
  syncFromShipments
);

module.exports = router;
