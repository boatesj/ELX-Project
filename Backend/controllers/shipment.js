const mongoose = require("mongoose");
const Shipment = require("../models/Shipment");

/**
 * @desc    Create a new shipment
 * @route   POST /shipments
 */
const createShipment = async (req, res) => {
  try {
    const newShipment = new Shipment(req.body);
    const saved = await newShipment.save();

    // ✅ populate customer details before returning
    await saved.populate("customer", "fullname email");

    return res.status(201).json({
      ok: true,
      message: "Shipment created successfully",
      data: saved,
    });
  } catch (error) {
    console.error("Error creating shipment:", error);
    return res.status(500).json({
      ok: false,
      message: "Failed to create shipment",
      error: error.message,
    });
  }
};

/**
 * @desc    Get all shipments
 * @route   GET /shipments
 */
const getAllShipments = async (req, res) => {
  try {
    const shipments = await Shipment.find()
      .populate("customer", "fullname email") // ✅ include customer info
      .sort({ createdAt: -1 });

    return res.status(200).json({
      ok: true,
      count: shipments.length,
      data: shipments,
    });
  } catch (error) {
    console.error("Error fetching shipments:", error);
    return res.status(500).json({
      ok: false,
      message: "Failed to fetch shipments",
      error: error.message,
    });
  }
};

/**
 * @desc    Get one shipment by ID
 * @route   GET /shipments/:id
 */
const getOneShipment = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ ok: false, message: "Invalid shipment ID" });

    const shipment = await Shipment.findById(id).populate("customer", "fullname email");
    if (!shipment)
      return res.status(404).json({ ok: false, message: "Shipment not found" });

    return res.status(200).json({ ok: true, data: shipment });
  } catch (error) {
    console.error("Error fetching shipment:", error);
    return res.status(500).json({
      ok: false,
      message: "Failed to fetch shipment",
      error: error.message,
    });
  }
};

/**
 * @desc    Update a shipment
 * @route   PUT /shipments/:id
 */
const updateShipment = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ ok: false, message: "Invalid shipment ID" });

    const updated = await Shipment.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("customer", "fullname email");

    if (!updated)
      return res.status(404).json({ ok: false, message: "Shipment not found" });

    return res.status(200).json({
      ok: true,
      message: "Shipment updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating shipment:", error);
    return res.status(500).json({
      ok: false,
      message: "Failed to update shipment",
      error: error.message,
    });
  }
};

/**
 * @desc    Get shipments belonging to a specific user
 * @route   GET /shipments/me/list
 */
const getUserShipment = async (req, res) => {
  try {
    const email =
      (req.user?.email || req.query.email || req.body.email || "").toLowerCase().trim();
    if (!email) return res.status(400).json({ ok: false, message: "Email is required" });

    const shipments = await Shipment.find({ "shipper.email": email })
      .populate("customer", "fullname email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      ok: true,
      count: shipments.length,
      data: shipments,
    });
  } catch (error) {
    console.error("Error fetching user shipments:", error);
    return res.status(500).json({
      ok: false,
      message: "Failed to fetch user shipments",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a shipment
 * @route   DELETE /shipments/:id
 */
const deleteShipment = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ ok: false, message: "Invalid shipment ID" });

    const deleted = await Shipment.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ ok: false, message: "Shipment not found" });

    return res.status(200).json({
      ok: true,
      message: "Shipment has been successfully deleted",
    });
  } catch (error) {
    console.error("Error deleting shipment:", error);
    return res.status(500).json({
      ok: false,
      message: "Failed to delete shipment",
      error: error.message,
    });
  }
};

/**
 * @desc    Admin - Add a tracking event
 * @route   POST /shipments/:id/tracking
 */
const addTrackingEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const shipment = await Shipment.findById(id);
    if (!shipment)
      return res.status(404).json({ ok: false, message: "Shipment not found" });

    const newEvent = {
      status: req.body.status || "update", // ✅ prevent schema error
      event: req.body.event,
      date: req.body.date || new Date(),
      location: req.body.location || "Unknown",
      meta: req.body.meta || {},
    };

    shipment.trackingEvents.push(newEvent);
    await shipment.save();

    return res.status(200).json({
      ok: true,
      message: "Tracking event added successfully",
      data: shipment.trackingEvents,
    });
  } catch (error) {
    console.error("Error adding tracking event:", error);
    return res.status(500).json({
      ok: false,
      message: "Failed to add tracking event",
      error: error.message,
    });
  }
};

/**
 * @desc    Admin - Attach a document to shipment
 * @route   POST /shipments/:id/documents
 */
const addDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const shipment = await Shipment.findById(id);
    if (!shipment)
      return res.status(404).json({ ok: false, message: "Shipment not found" });

    const { name, fileUrl } = req.body;
    shipment.documents.push({
      name,
      fileUrl,
      uploadedAt: new Date(),
      uploadedBy: req.user?.id || undefined,
    });

    await shipment.save();

    return res.status(200).json({
      ok: true,
      message: "Document added successfully",
      data: shipment.documents,
    });
  } catch (error) {
    console.error("Error adding document:", error);
    return res.status(500).json({
      ok: false,
      message: "Failed to add document",
      error: error.message,
    });
  }
};

/**
 * @desc    Admin - Update shipment status
 * @route   PATCH /shipments/:id/status
 */
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const shipment = await Shipment.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate("customer", "fullname email");

    if (!shipment)
      return res.status(404).json({ ok: false, message: "Shipment not found" });

    return res.status(200).json({
      ok: true,
      message: `Shipment status updated to '${status}'`,
      data: shipment,
    });
  } catch (error) {
    console.error("Error updating shipment status:", error);
    return res.status(500).json({
      ok: false,
      message: "Failed to update status",
      error: error.message,
    });
  }
};

/**
 * @desc    Admin - Dashboard analytics for shipments
 * @route   GET /shipments/dashboard
 */
const getDashboardStats = async (req, res) => {
  try {
    // Fetch counts by shipment status
    const stats = await Shipment.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Convert aggregation to easy key:value format
    const summary = stats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    // Count totals
    const totalShipments = await Shipment.countDocuments({ isDeleted: false });
    const deliveredCount = summary.delivered || 0;
    const pendingCount = summary.pending || 0;

    // Find most common routes
    const topRoutes = await Shipment.aggregate([
      { $match: { isDeleted: false } },
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
    ]);

    // Final response
    return res.status(200).json({
      ok: true,
      message: "Dashboard data retrieved successfully",
      data: {
        totals: {
          totalShipments,
          deliveredCount,
          pendingCount,
          active: totalShipments - deliveredCount - pendingCount,
        },
        byStatus: summary,
        topRoutes: topRoutes.map((r) => ({
          route: `${r._id.origin} → ${r._id.destination}`,
          count: r.count,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return res.status(500).json({
      ok: false,
      message: "Failed to fetch dashboard data",
      error: error.message,
    });
  }
};


module.exports = {
  createShipment,
  getAllShipments,
  getOneShipment,
  updateShipment,
  getUserShipment,
  deleteShipment,
  addTrackingEvent,
  addDocument,
  updateStatus,
  getDashboardStats,
};
