const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const {
  listEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  syncFromShipments,
  exportIcal,
  listHolidays,
} = require("../controllers/calendar");

const router = express.Router();

/**
 * Backward compatible routes (your current ones)
 */
router.get("/events", requireAuth, requireRole("admin"), listEvents);
router.post("/events", requireAuth, requireRole("admin"), createEvent);

/**
 * New: CRUD by id
 */
router.put("/events/:id", requireAuth, requireRole("admin"), updateEvent);
router.delete("/events/:id", requireAuth, requireRole("admin"), deleteEvent);

/**
 * New: helpers
 */
router.post(
  "/sync-from-shipments",
  requireAuth,
  requireRole("admin"),
  syncFromShipments
);

router.get("/ical", requireAuth, requireRole("admin"), exportIcal);
router.get("/holidays", requireAuth, requireRole("admin"), listHolidays);

/**
 * Friendly aliases (optional but handy for the frontend)
 * GET /admin/calendar -> list events
 * POST /admin/calendar -> create event
 */
router.get("/", requireAuth, requireRole("admin"), listEvents);
router.post("/", requireAuth, requireRole("admin"), createEvent);

module.exports = router;
