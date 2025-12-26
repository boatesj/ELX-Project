// Backend/controllers/shipment.js
const mongoose = require("mongoose");
const Shipment = require("../models/Shipment");

/**
 * Role helpers (your requireAuth normalizes role to lower-case)
 * Admin in token may be "admin"; in DB enum you also have "Admin".
 */
function isAdmin(req) {
  const role = String(req?.user?.role || "").toLowerCase();
  return role === "admin";
}

function requireUserId(req) {
  const id = req?.user?.id;
  return id ? String(id) : null;
}

/**
 * Helper: normalise filters from query string (ADMIN USE)
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

  const filter = { isDeleted: false };

  if (customer) filter.customer = customer; // expects ObjectId string
  if (status) filter.status = status;
  if (mode) filter.mode = mode;
  if (originPort) filter["ports.originPort"] = originPort;
  if (destinationPort) filter["ports.destinationPort"] = destinationPort;

  if (fromDate || toDate) {
    filter.shippingDate = {};
    if (fromDate) filter.shippingDate.$gte = new Date(fromDate);
    if (toDate) filter.shippingDate.$lte = new Date(toDate);
  }

  if (search) {
    const regex = new RegExp(String(search).trim(), "i");
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
 * Helper: ensure shipment exists and caller can access it
 * - Admin: can access any non-deleted shipment
 * - Customer: only their own (customer == req.user.id)
 */
async function findAccessibleShipmentById(req, id, opts = {}) {
  const { lean = false, populateCustomer = true } = opts;

  if (!mongoose.isValidObjectId(id)) return { error: "Invalid shipment id" };

  const base = { _id: id, isDeleted: false };
  const userId = requireUserId(req);

  if (!isAdmin(req)) {
    if (!userId) return { error: "Unauthorized" };
    base.customer = userId;
  }

  let q = Shipment.findOne(base);
  if (populateCustomer) q = q.populate("customer", "fullname email country");
  if (lean) q = q.lean();

  const shipment = await q;
  if (!shipment) return { error: "Shipment not found" };

  return { shipment };
}

/**
 * Helper: restrict update fields for customers
 * Admin can update anything except a few protected internal fields.
 */
function sanitizeUpdatesForRole(req, updates) {
  const clean = { ...updates };

  // Always protected, regardless of role:
  delete clean.isDeleted; // never directly
  delete clean.__v;

  // Reference number should not be mutated via update route
  delete clean.referenceNo;

  // These should never be client-controlled:
  delete clean.createdBy;

  if (!isAdmin(req)) {
    // Customers can never change ownership or financial/audit/admin-only areas
    delete clean.customer;
    delete clean.trackingEvents;
    delete clean.documents;
    delete clean.charges;
    delete clean.notifications;
    delete clean.paymentStatus;
    delete clean.status; // status updates are admin-only via PATCH status route anyway
  }

  return clean;
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

    // Never allow client to force isDeleted/referenceNo unless migration flag is explicitly set
    payload.isDeleted = false;

    if (!req.query.keepRef) {
      delete payload.referenceNo;
    }

    const userId = requireUserId(req);
    const admin = isAdmin(req);

    // Ownership rules:
    // - Customer: customer MUST be req.user.id (ignore any supplied customer)
    // - Admin: can create for a specified customer; if not provided, default to admin user id
    if (!admin) {
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      payload.customer = userId;
    } else {
      if (!payload.customer) payload.customer = userId; // admin creating for self by default
    }

    // createdBy should always be the authenticated actor if present
    if (userId) payload.createdBy = userId;

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
 * @desc    Admin-only list (route is gated). Defensive here too.
 * @access  Authenticated
 *
 * NOTE:
 *  - Returns a plain ARRAY for backwards compatibility.
 *  - Supports optional ?page=&limit=
 */
async function getAllShipments(req, res) {
  try {
    // Defensive: should already be admin-gated in routes
    if (!isAdmin(req)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const filter = buildShipmentFilter(req.query);

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
 * @access  Authenticated (admin or owner)
 */
async function getOneShipment(req, res) {
  try {
    const { id } = req.params;

    const { shipment, error } = await findAccessibleShipmentById(req, id, {
      lean: true,
      populateCustomer: true,
    });

    if (error === "Invalid shipment id")
      return res.status(400).json({ message: error });
    if (error === "Unauthorized")
      return res.status(401).json({ message: error });
    if (error === "Shipment not found")
      return res.status(404).json({ message: error });

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
 * @desc    Customer portal "My Shipments"
 * @access  Authenticated
 */
async function getUserShipment(req, res) {
  try {
    const userId = requireUserId(req);

    if (!userId) {
      return res
        .status(401)
        .json({ message: "User context missing from request." });
    }

    const shipments = await Shipment.find({
      customer: userId,
      isDeleted: false,
    })
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
 * @access  Authenticated (admin or owner) — with role-based field restrictions
 */
async function updateShipment(req, res) {
  try {
    const { id } = req.params;

    // Ensure shipment exists + caller is allowed to touch it
    const { shipment, error } = await findAccessibleShipmentById(req, id, {
      lean: false,
      populateCustomer: false,
    });

    if (error === "Invalid shipment id")
      return res.status(400).json({ message: error });
    if (error === "Unauthorized")
      return res.status(401).json({ message: error });
    if (error === "Shipment not found")
      return res.status(404).json({ message: error });

    const updates = sanitizeUpdatesForRole(req, req.body || {});

    // Apply updates safely
    Object.assign(shipment, updates);

    await shipment.save();

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
 * @desc    Soft-delete (isDeleted=true)
 * @access  Authenticated (admin or owner)
 */
async function deleteShipment(req, res) {
  try {
    const { id } = req.params;

    const { shipment, error } = await findAccessibleShipmentById(req, id, {
      lean: false,
      populateCustomer: false,
    });

    if (error === "Invalid shipment id")
      return res.status(400).json({ message: error });
    if (error === "Unauthorized")
      return res.status(401).json({ message: error });
    if (error === "Shipment not found")
      return res.status(404).json({ message: error });

    shipment.isDeleted = true;
    await shipment.save();

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
 * ADD TRACKING EVENT (admin only — route enforces)
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
 * ADD DOCUMENT (admin only — route enforces)
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
      uploadedBy: req?.user?.id || undefined,
    };

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
 * UPDATE STATUS (admin only — route enforces)
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

    shipment.trackingEvents.push({
      status,
      event:
        event ||
        `Status updated to "${status.replace(/_/g, " ")}" from admin panel`,
      location: location || "",
      date: new Date(),
      meta: {
        updatedBy: req?.user?.id || null,
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
 * DASHBOARD STATS (admin only — route enforces)
 * Shape aligned with Home.jsx expectations.
 */
async function getDashboardStats(req, res) {
  try {
    const baseFilter = { isDeleted: false };

    const start6Months = new Date();
    start6Months.setMonth(start6Months.getMonth() - 5);
    start6Months.setDate(1);
    start6Months.setHours(0, 0, 0, 0);

    const [
      totalShipments,
      groupedByStatus,
      groupedByMode,
      latestShipments,
      last30DaysShipments,
      routesAgg,
      monthlyAgg,
      exportRowsRaw,
    ] = await Promise.all([
      Shipment.countDocuments(baseFilter),

      Shipment.aggregate([
        { $match: baseFilter },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      Shipment.aggregate([
        { $match: baseFilter },
        { $group: { _id: "$mode", count: { $sum: 1 } } },
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
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      })
        .select("createdAt")
        .lean(),

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

      Shipment.aggregate([
        { $match: { ...baseFilter, createdAt: { $gte: start6Months } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      Shipment.find(baseFilter)
        .sort({ createdAt: -1 })
        .limit(500)
        .select(
          "referenceNo status mode createdAt ports.originPort ports.destinationPort consignee.name shipper.name charges"
        )
        .lean(),
    ]);

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
      route: `${r._id.origin} \u2192 ${r._id.destination}`,
      count: r.count,
    }));

    const monthlyBookings = monthlyAgg.map((m) => ({
      month: m._id,
      count: m.count,
    }));

    const rows = exportRowsRaw.map((s) => {
      const chargesArr = Array.isArray(s.charges) ? s.charges : [];
      const amountTotal = chargesArr.reduce(
        (sum, c) => sum + (Number(c.amount) || 0),
        0
      );
      const currency = chargesArr.find((c) => c?.currency)?.currency || "GBP";

      return {
        referenceNo: s.referenceNo || "",
        status: s.status || "unknown",
        mode: s.mode || "",
        createdAt: s.createdAt || null,
        origin: s?.ports?.originPort || "",
        destination: s?.ports?.destinationPort || "",
        shipperName: s?.shipper?.name || "",
        consigneeName: s?.consignee?.name || "",
        amount: Number(amountTotal.toFixed(2)),
        currency,
      };
    });

    return res.status(200).json({
      data: {
        totals,
        byStatus,
        byMode,
        topRoutes,
        recent: latestShipments,
        statusCounts: byStatus,
        monthlyBookings,
        rows,
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
