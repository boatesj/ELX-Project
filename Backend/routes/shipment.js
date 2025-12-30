// Backend/routes/shipments.js
const express = require("express");
const router = express.Router();

const {
  createShipment,
  getAllShipments,
  updateShipment,
  getOneShipment,
  getUserShipment,
  deleteShipment,
  addTrackingEvent,
  addDocument,
  updateStatus,
  getDashboardStats,

  // ✅ NEW quote handlers
  saveQuote,
  sendQuoteEmail,
} = require("../controllers/shipment");

const { requireAuth, requireRole } = require("../middleware/auth");
const { handleValidation } = require("../middleware/validate");
const {
  validateObjectIdParam,
  validateTrackingEvent,
  validateDocument,
  validateShipmentCreate,
} = require("../utils/validators");

const Shipment = require("../models/Shipment");

function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * @route   POST /shipments
 * @desc    Create a new shipment
 * @access  Auth (customer or admin). Controller enforces ownership rules.
 */
router.post(
  "/",
  requireAuth,
  validateShipmentCreate,
  handleValidation,
  createShipment
);

/**
 * @route   GET /shipments/dashboard
 * @desc    Admin dashboard analytics
 * @access  Admin
 */
router.get("/dashboard", requireAuth, requireRole("admin"), getDashboardStats);

/**
 * @route   GET /shipments/track/:ref
 * @desc    Track a shipment by reference number
 * @access  Public
 *
 * SECURITY:
 * - Do NOT return customer PII or shipper/consignee contact details publicly.
 * - Exact match, case-insensitive, with regex escaping.
 */
router.get("/track/:ref", async (req, res) => {
  try {
    const ref = String(req.params.ref || "").trim();
    if (!ref) {
      return res
        .status(400)
        .json({ ok: false, message: "Reference is required" });
    }

    const safeRef = escapeRegExp(ref);

    const shipment = await Shipment.findOne({
      referenceNo: { $regex: `^${safeRef}$`, $options: "i" },
      isDeleted: false,
    })
      .select(
        [
          "referenceNo",
          "status",
          "mode",
          "serviceType",
          "shippingDate",
          "eta",
          "ports.originPort",
          "ports.destinationPort",
          "trackingEvents.status",
          "trackingEvents.event",
          "trackingEvents.location",
          "trackingEvents.date",
          "trackingEvents.meta",
          "createdAt",
          "updatedAt",
        ].join(" ")
      )
      .lean();

    if (!shipment) {
      return res.status(404).json({ ok: false, message: "Shipment not found" });
    }

    return res.status(200).json({ ok: true, data: shipment });
  } catch (err) {
    console.error("Error retrieving shipment by reference:", err);
    return res.status(500).json({
      ok: false,
      message: "Error retrieving shipment",
      error: err.message,
    });
  }
});

/**
 * @route   GET /shipments/me/list
 * @desc    Get logged-in user's shipments
 * @access  Auth
 */
router.get("/me/list", requireAuth, getUserShipment);

/**
 * @route   GET /shipments
 * @desc    Get all shipments (admin) (optionally filter by ?customer=<userId>)
 * @access  Admin
 */
router.get("/", requireAuth, requireRole("admin"), getAllShipments);

/**
 * @route   GET /shipments/:id
 * @desc    Get shipment by ID
 * @access  Auth (controller enforces access; route validates id)
 */
router.get(
  "/:id",
  requireAuth,
  validateObjectIdParam("id"),
  handleValidation,
  getOneShipment
);

/**
 * ✅ NEW
 * @route   PATCH /shipments/:id/quote
 * @desc    Save/update quote draft on a shipment (admin only)
 * @access  Admin
 */
router.patch(
  "/:id/quote",
  requireAuth,
  requireRole("admin"),
  validateObjectIdParam("id"),
  handleValidation,
  saveQuote
);

/**
 * ✅ NEW
 * @route   POST /shipments/:id/quote/send
 * @desc    Email the quote to the shipper email and set status = quoted (admin only)
 * @access  Admin
 */
router.post(
  "/:id/quote/send",
  requireAuth,
  requireRole("admin"),
  validateObjectIdParam("id"),
  handleValidation,
  sendQuoteEmail
);

/**
 * @route   PUT /shipments/:id
 * @desc    Update shipment
 * @access  Auth (controller enforces access; route validates id)
 */
router.put(
  "/:id",
  requireAuth,
  validateObjectIdParam("id"),
  handleValidation,
  updateShipment
);

/**
 * @route   DELETE /shipments/:id
 * @desc    Soft-delete shipment
 * @access  Auth (controller enforces access; route validates id)
 */
router.delete(
  "/:id",
  requireAuth,
  validateObjectIdParam("id"),
  handleValidation,
  deleteShipment
);

/**
 * @route   POST /shipments/:id/tracking
 * @desc    Add tracking event
 * @access  Admin only
 */
router.post(
  "/:id/tracking",
  requireAuth,
  requireRole("admin"),
  validateObjectIdParam("id"),
  validateTrackingEvent,
  handleValidation,
  addTrackingEvent
);

/**
 * @route   POST /shipments/:id/documents
 * @desc    Add document to shipment
 * @access  Admin only
 */
router.post(
  "/:id/documents",
  requireAuth,
  requireRole("admin"),
  validateObjectIdParam("id"),
  validateDocument,
  handleValidation,
  addDocument
);

/**
 * @route   PATCH /shipments/:id/status
 * @desc    Update shipment status
 * @access  Admin only
 */
router.patch(
  "/:id/status",
  requireAuth,
  requireRole("admin"),
  validateObjectIdParam("id"),
  handleValidation,
  updateStatus
);

module.exports = router;
