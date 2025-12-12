// Backend/controllers/shipment.js
const mongoose = require("mongoose");
const Shipment = require("../models/Shipment");

/**
 * Helper: normalise filters from query string
 */
function buildShipmentFilter(query = {}) {
  const {
    customer,
    status,
    mode,
    originPort,
    destinationPort,
    fromDate,
    toDate,
    search,
  } = query;

  const filter = {
    isDeleted: false,
  };

  if (customer) {
    filter.customer = customer; // expects ObjectId string
  }

  if (status) {
    filter.status = status;
  }

  if (mode) {
    filter.mode = mode;
  }

  if (originPort) {
    filter["ports.originPort"] = originPort;
  }

  if (destinationPort) {
    filter["ports.destinationPort"] = destinationPort;
  }

  if (fromDate || toDate) {
    filter.shippingDate = {};
    if (fromDate) filter.shippingDate.$gte = new Date(fromDate);
    if (toDate) filter.shippingDate.$lte = new Date(toDate);
  }

  if (search) {
    const regex = new RegExp(search.trim(), "i");
    filter.$or = [
      { referenceNo: regex },
      { "shipper.name": regex },
      { "consignee.name": regex },
      { "ports.originPort": regex },
      { "ports.destinationPort": regex },
      { "cargo.description": regex },
    ];
  }

  return filter;
}

/**
 * CREATE SHIPMENT
 * --------------------------------------------------
 * @route   POST /shipments
 * @access  Authenticated (admin / portal user)
 * Body is validated by validateShipmentCreate + handleValidation.
 */
async function createShipment(req, res) {
  try {
    const payload = { ...req.body };

    // Always let the backend generate the business reference
    // unless you explicitly opt out via a special flag (for data migration etc.)
    if (!req.query.keepRef) {
      delete payload.referenceNo;
    }

    // Ensure logical flags
    payload.isDeleted = false;

    // Attach ownership / audit fields
    if (req.user && req.user.id) {
      // If the booking is coming from a portal customer:
      if (!payload.customer) {
        payload.customer = req.user.id;
      }
      payload.createdBy = req.user.id;
    }

    // Let pre-save hook handle referenceNo generation.
    const shipment = await Shipment.create(payload);

    return res.status(201).json({
      message: "Shipment created successfully.",
      shipment,
    });
  } catch (err) {
    console.error("Error creating shipment:", err);
    return res.status(500).json({
      message: "Failed to create shipment",
      error: err.message,
    });
  }
}

/**
 * GET ALL SHIPMENTS (with optional filters)
 * --------------------------------------------------
 * @route   GET /shipments
 * @desc    Get shipments (admin) or filtered by ?customer= for profile view
 * @access  Authenticated
 *
 * NOTE:
 *  - Still returns a plain ARRAY for backwards compatibility.
 *  - Supports optional ?page=&limit=, but UI can ignore it for now.
 */
async function getAllShipments(req, res) {
  try {
    const filter = buildShipmentFilter(req.query);

    // Simple pagination support with safe defaults
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 200, 1),
      500
    );
    const skip = (page - 1) * limit;

    const shipments = await Shipment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("customer", "fullname email country")
      .lean();

    // For now we return just the array, as before
    return res.status(200).json(shipments);
  } catch (err) {
    console.error("Error fetching shipments:", err);
    return res.status(500).json({
      message: "Failed to fetch shipments",
      error: err.message,
    });
  }
}

/**
 * GET ONE SHIPMENT BY ID
 * --------------------------------------------------
 * @route   GET /shipments/:id
 * @access  Authenticated
 */
async function getOneShipment(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid shipment id" });
    }

    const shipment = await Shipment.findOne({
      _id: id,
      isDeleted: false,
    })
      .populate("customer", "fullname email country")
      .lean();

    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    return res.status(200).json(shipment);
  } catch (err) {
    console.error("Error fetching shipment:", err);
    return res.status(500).json({
      message: "Failed to fetch shipment",
      error: err.message,
    });
  }
}

/**
 * GET LOGGED-IN USER'S SHIPMENTS
 * --------------------------------------------------
 * @route   GET /shipments/me/list
 * @desc    Used by customer portal to show "My Shipments"
 * @access  Authenticated
 */
async function getUserShipment(req, res) {
  try {
    const userId = req.user && req.user.id;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "User context missing from request." });
    }

    const filter = {
      customer: userId,
      isDeleted: false,
    };

    const shipments = await Shipment.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("customer", "fullname email country")
      .lean();

    return res.status(200).json(shipments);
  } catch (err) {
    console.error("Error fetching user's shipments:", err);
    return res.status(500).json({
      message: "Failed to fetch user shipments",
      error: err.message,
    });
  }
}

/**
 * UPDATE SHIPMENT
 * --------------------------------------------------
 * @route   PUT /shipments/:id
 * @access  Authenticated (typically admin/ops users via Admin panel)
 */
async function updateShipment(req, res) {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid shipment id" });
    }

    // Never allow direct toggling of isDeleted via this route:
    delete updates.isDeleted;

    // Find + update
    const shipment = await Shipment.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updates,
      {
        new: true,
      }
    );

    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    return res.status(200).json({
      message: "Shipment updated successfully",
      shipment,
    });
  } catch (err) {
    console.error("Error updating shipment:", err);
    return res.status(500).json({
      message: "Failed to update shipment",
      error: err.message,
    });
  }
}

/**
 * SOFT DELETE SHIPMENT
 * --------------------------------------------------
 * @route   DELETE /shipments/:id
 * @desc    Soft-delete (mark isDeleted=true)
 * @access  Authenticated (admin / ops)
 */
async function deleteShipment(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid shipment id" });
    }

    const shipment = await Shipment.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    return res.status(200).json({
      message: "Shipment deleted (soft delete) successfully",
    });
  } catch (err) {
    console.error("Error deleting shipment:", err);
    return res.status(500).json({
      message: "Failed to delete shipment",
      error: err.message,
    });
  }
}

/**
 * ADD TRACKING EVENT
 * --------------------------------------------------
 * @route   POST /shipments/:id/tracking
 * @desc    Add tracking event (admin only)
 * @access  Authenticated + admin (enforced in route)
 */
async function addTrackingEvent(req, res) {
  try {
    const { id } = req.params;
    const { status, event, location, date, meta } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid shipment id" });
    }

    const shipment = await Shipment.findOne({ _id: id, isDeleted: false });

    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    const trackingEvent = {
      status: status || "update",
      event,
      location,
      date: date ? new Date(date) : new Date(),
      meta: meta || {},
    };

    shipment.trackingEvents.push(trackingEvent);

    // If a recognised shipment lifecycle status is included, update main status
    const allowedStatuses = [
      "pending",
      "booked",
      "at_origin_yard",
      "loaded",
      "sailed",
      "arrived",
      "cleared",
      "delivered",
      "cancelled",
    ];
    if (status && allowedStatuses.includes(status)) {
      shipment.status = status;
    }

    await shipment.save();

    return res.status(200).json({
      message: "Tracking event added successfully",
      shipment,
    });
  } catch (err) {
    console.error("Error adding tracking event:", err);
    return res.status(500).json({
      message: "Failed to add tracking event",
      error: err.message,
    });
  }
}

/**
 * ADD DOCUMENT
 * --------------------------------------------------
 * @route   POST /shipments/:id/documents
 * @desc    Attach a document record to shipment (file already stored elsewhere)
 * @access  Authenticated + admin (enforced in route)
 */
async function addDocument(req, res) {
  try {
    const { id } = req.params;
    const { name, fileUrl } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid shipment id" });
    }

    const shipment = await Shipment.findOne({ _id: id, isDeleted: false });

    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    const docEntry = {
      name,
      fileUrl,
      uploadedAt: new Date(),
    };

    if (req.user && req.user.id) {
      docEntry.uploadedBy = req.user.id;
    }

    shipment.documents.push(docEntry);
    await shipment.save();

    return res.status(200).json({
      message: "Document added to shipment",
      shipment,
    });
  } catch (err) {
    console.error("Error adding document to shipment:", err);
    return res.status(500).json({
      message: "Failed to add document",
      error: err.message,
    });
  }
}

/**
 * UPDATE STATUS
 * --------------------------------------------------
 * @route   PATCH /shipments/:id/status
 * @desc    Update shipment status only (plus auto tracking note)
 * @access  Authenticated + admin
 */
async function updateStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, event, location } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid shipment id" });
    }

    const allowedStatuses = [
      "pending",
      "booked",
      "at_origin_yard",
      "loaded",
      "sailed",
      "arrived",
      "cleared",
      "delivered",
      "cancelled",
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid or missing status" });
    }

    const shipment = await Shipment.findOne({ _id: id, isDeleted: false });

    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    shipment.status = status;

    // Automatically log a tracking event for audit trail
    shipment.trackingEvents.push({
      status,
      event:
        event ||
        `Status updated to "${status.replace(/_/g, " ")}" from admin panel`,
      location: location || "",
      date: new Date(),
      meta: {
        updatedBy: req.user ? req.user.id : null,
        source: "admin_panel_status_update",
      },
    });

    await shipment.save();

    return res.status(200).json({
      message: "Shipment status updated",
      shipment,
    });
  } catch (err) {
    console.error("Error updating shipment status:", err);
    return res.status(500).json({
      message: "Failed to update shipment status",
      error: err.message,
    });
  }
}

/**
 * DASHBOARD STATS
 * --------------------------------------------------
 * @route   GET /shipments/dashboard
 * @desc    Lightweight analytics for admin dashboard cards
 * @access  Authenticated + admin
 *
 * Shape is aligned with Home.jsx expectations:
 *  - res.json({
 *      data: {
 *        totals,
 *        byStatus,
 *        byMode,
 *        topRoutes,
 *        recent,
 *      }
 *    })
 */
async function getDashboardStats(req, res) {
  try {
    const baseFilter = { isDeleted: false };

    const [
      totalShipments,
      groupedByStatus,
      groupedByMode,
      latestShipments,
      last30DaysShipments,
      routesAgg,
    ] = await Promise.all([
      Shipment.countDocuments(baseFilter),

      Shipment.aggregate([
        { $match: baseFilter },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),

      Shipment.aggregate([
        { $match: baseFilter },
        {
          $group: {
            _id: "$mode",
            count: { $sum: 1 },
          },
        },
      ]),

      Shipment.find(baseFilter)
        .sort({ createdAt: -1 })
        .limit(5)
        .select(
          "referenceNo status mode ports.originPort ports.destinationPort createdAt"
        )
        .lean(),

      Shipment.find({
        ...baseFilter,
        createdAt: {
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      })
        .select("createdAt")
        .lean(),

      // Top routes (origin → destination)
      Shipment.aggregate([
        { $match: baseFilter },
        {
          $group: {
            _id: {
              origin: "$ports.originPort",
              destination: "$ports.destinationPort",
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
    ]);

    // Transform aggregates to friendly maps
    const byStatus = groupedByStatus.reduce((acc, cur) => {
      acc[cur._id || "unknown"] = cur.count;
      return acc;
    }, {});

    const byMode = groupedByMode.reduce((acc, cur) => {
      acc[cur._id || "unknown"] = cur.count;
      return acc;
    }, {});

    const delivered = byStatus.delivered || 0;
    const cancelled = byStatus.cancelled || 0;
    const pending = byStatus.pending || 0;

    const active =
      totalShipments - delivered - cancelled - pending >= 0
        ? totalShipments - delivered - cancelled - pending
        : 0;

    const totals = {
      totalShipments,
      active,
      pending,
      delivered,
      cancelled,
      last30DaysCount: last30DaysShipments.length,
    };

    const topRoutes = routesAgg.map((r) => ({
      route: `${r._id.origin} \u2192 ${r._id.destination}`, // → arrow
      count: r.count,
    }));

    return res.status(200).json({
      data: {
        totals,
        byStatus,
        byMode,
        topRoutes,
        recent: latestShipments,
      },
    });
  } catch (err) {
    console.error("Error calculating dashboard stats:", err);
    return res.status(500).json({
      message: "Failed to fetch dashboard stats",
      error: err.message,
    });
  }
}

module.exports = {
  createShipment,
  getAllShipments,
  getOneShipment,
  getUserShipment,
  updateShipment,
  deleteShipment,
  addTrackingEvent,
  addDocument,
  updateStatus,
  getDashboardStats,
};
