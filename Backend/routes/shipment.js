// Backend/routes/shipment.js
const express = require("express");
const router = express.Router();

const path = require("path");
const fs = require("fs");
const multer = require("multer");

const {
  createShipment,
  createPublicLeadShipment,
  getAllShipments,
  updateShipment,
  getOneShipment,
  getUserShipment,
  deleteShipment,
  addTrackingEvent,
  addDocument,
  uploadDocument, // ✅ NEW
  updateStatus,
  getDashboardStats,

  // ✅ quote handlers
  saveQuote,
  sendQuoteEmail,

  // ✅ charges handler
  updateCharges,

  // ✅ Booking confirmation
  sendBookingConfirmationEmail,

  // ✅ NEW: customer quote decisions
  approveQuoteAsCustomer,
  requestQuoteChangesAsCustomer,
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

// --------------------
// MULTER (documents upload)
// --------------------
function safeFilename(originalName = "") {
  const base = path.basename(String(originalName));
  const cleaned = base.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "");
  return cleaned || `file_${Date.now()}`;
}

// ✅ Allowed mimetypes (basic hardening)
const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",

  // Word
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  // Excel
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

  // CSV / text
  "text/csv",
  "text/plain",
]);

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const shipmentId = String(req.params.id || "unknown");
    const dest = path.join(
      __dirname,
      "..",
      "uploads",
      "documents",
      "shipments",
      shipmentId
    );
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename(req, file, cb) {
    const ts = Date.now();
    const cleaned = safeFilename(file.originalname);
    cb(null, `${ts}_${cleaned}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1, // ✅ request-level limit (we also enforce below)
  },
  fileFilter(req, file, cb) {
    // If mimetype missing, be conservative
    const type = String(file.mimetype || "");
    if (!type || !ALLOWED_MIME.has(type)) {
      return cb(
        new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Unsupported file type")
      );
    }
    return cb(null, true);
  },
});

// ✅ Accept multiple possible file keys and normalize to req.file
const DOC_FILE_KEYS = ["file", "document", "attachment", "pdf", "upload"];

function multerDocUpload() {
  const fields = DOC_FILE_KEYS.map((k) => ({ name: k, maxCount: 1 }));
  const middleware = upload.fields(fields);

  return function (req, res, next) {
    middleware(req, res, function (err) {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
              ok: false,
              message: "File too large. Max size is 10MB.",
            });
          }

          // We reuse LIMIT_UNEXPECTED_FILE for both wrong key + bad type
          if (err.code === "LIMIT_UNEXPECTED_FILE") {
            // If multer called it "Unsupported file type", show clearer message
            const msg =
              err.field === "Unsupported file type"
                ? "Unsupported file type. Allowed: PDF, PNG, JPG, DOC/DOCX, XLS/XLSX, CSV, TXT."
                : `Unexpected field. File key must be one of: ${DOC_FILE_KEYS.join(
                    ", "
                  )}. (Preferred: "file")`;

            return res.status(400).json({
              ok: false,
              message: msg,
            });
          }

          return res.status(400).json({
            ok: false,
            message: err.message || "Upload failed",
          });
        }

        return res.status(400).json({
          ok: false,
          message: err.message || "Upload failed",
        });
      }

      // Normalize to req.file for controller compatibility
      const files = req.files || {};
      const available = DOC_FILE_KEYS.filter(
        (k) => Array.isArray(files[k]) && files[k][0]
      );

      // ✅ Enforce exactly one uploaded file even if client sends multiple keys
      if (available.length > 1) {
        return res.status(400).json({
          ok: false,
          message:
            "Please upload only one file. Use the 'file' field (preferred).",
        });
      }

      if (available.length === 1) {
        req.file = files[available[0]][0];
      }

      return next();
    });
  };
}

// ✅ Ensure required fields exist for upload route
function requireDocUploadFields(req, res, next) {
  const name = String(req.body?.name || "").trim();
  if (!name) {
    return res.status(400).json({
      ok: false,
      message: "Document name is required.",
    });
  }
  if (!req.file) {
    return res.status(400).json({
      ok: false,
      message: "Document file is required. Use form-data key 'file'.",
    });
  }
  return next();
}

/**
 * ✅ NEW (PUBLIC)
 * @route   POST /shipments/public-request
 */
router.post(
  "/public-request",
  validateShipmentCreate,
  handleValidation,
  createPublicLeadShipment
);

/**
 * @route   POST /shipments
 * @access  Auth
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
 * @access  Admin
 */
router.get("/dashboard", requireAuth, requireRole("admin"), getDashboardStats);

/**
 * @route   GET /shipments/track/:ref
 * @access  Public
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
 * @access  Auth
 */
router.get("/me/list", requireAuth, getUserShipment);

/**
 * @route   GET /shipments
 * @access  Admin
 */
router.get("/", requireAuth, requireRole("admin"), getAllShipments);

/**
 * @route   GET /shipments/:id
 * @access  Auth
 */
router.get(
  "/:id",
  requireAuth,
  validateObjectIdParam("id"),
  handleValidation,
  getOneShipment
);

/**
 * @route   PATCH /shipments/:id/charges
 * @access  Admin
 */
router.patch(
  "/:id/charges",
  requireAuth,
  requireRole("admin"),
  validateObjectIdParam("id"),
  handleValidation,
  updateCharges
);

/**
 * @route   PATCH /shipments/:id/quote
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
 * @route   POST /shipments/:id/quote/send
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
 * @route   POST /shipments/:id/quote/approve
 * @access  Customer
 */
router.post(
  "/:id/quote/approve",
  requireAuth,
  requireRole("customer"),
  validateObjectIdParam("id"),
  handleValidation,
  approveQuoteAsCustomer
);

/**
 * @route   POST /shipments/:id/quote/request-changes
 * @access  Customer
 */
router.post(
  "/:id/quote/request-changes",
  requireAuth,
  requireRole("customer"),
  validateObjectIdParam("id"),
  handleValidation,
  requestQuoteChangesAsCustomer
);

/**
 * @route   POST /shipments/:id/booking/confirm
 * @access  Admin
 */
router.post(
  "/:id/booking/confirm",
  requireAuth,
  requireRole("admin"),
  validateObjectIdParam("id"),
  handleValidation,
  sendBookingConfirmationEmail
);

/**
 * @route   PUT /shipments/:id
 * @access  Auth
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
 * @access  Auth
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
 * @desc    Add document to shipment (URL-only)
 * @access  Admin only
 * JSON: { name, fileUrl }
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
 * ✅ NEW
 * @route   POST /shipments/:id/documents/upload
 * @desc    Upload a document file and attach it to shipment.documents
 * @access  Admin only
 *
 * Form-data:
 * - name: text (required)
 * - file: file (preferred)
 *
 * Also accepted file keys: document, attachment, pdf, upload
 */
router.post(
  "/:id/documents/upload",
  requireAuth,
  requireRole("admin"),
  validateObjectIdParam("id"),
  handleValidation,
  multerDocUpload(),
  requireDocUploadFields,
  uploadDocument
);

/**
 * @route   PATCH /shipments/:id/status
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
