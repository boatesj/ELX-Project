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

/**
 * @route   POST /shipments
 * @desc    Create a new shipment
 */
router.post(
  "/",
  requireAuth,
  validateShipmentCreate,
  handleValidation,
  createShipment
);

/**
 * @route   GET /shipments
 * @desc    Get all shipments (admin)
 */
router.get("/", requireAuth, getAllShipments);

/**
 * @route   GET /shipments/dashboard
 * @desc    Admin dashboard analytics
 */
router.get("/dashboard", requireAuth, requireRole("admin"), getDashboardStats);

/**
 * @route   GET /shipments/track/:ref
 * @desc    Track a shipment by reference number (public or auth – your choice)
 */
router.get("/track/:ref", async (req, res) => {
  try {
    const ref = req.params.ref.trim();

    const shipment = await Shipment.findOne({
      referenceNo: { $regex: `^${ref}$`, $options: "i" },
      isDeleted: false,
    }).populate("customer", "fullname email");

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
 */
router.get("/me/list", requireAuth, getUserShipment);

/**
 * @route   GET /shipments/:id
 * @desc    Get shipment by ID
 */
router.get(
  "/:id",
  requireAuth,
  validateObjectIdParam("id"),
  handleValidation,
  getOneShipment
);

/**
 * @route   PUT /shipments/:id
 * @desc    Update shipment
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
 * @desc    Add tracking event (admin only)
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
 * @desc    Add document to shipment (admin only)
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
 * @desc    Update shipment status (admin only)
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
