// Backend/controllers/quickLog.js
const QuickLog = require("../models/QuickLog");

// GET /api/v1/quicklog
exports.getQuickLogs = async (req, res) => {
  try {
    const logs = await QuickLog.find().sort({ loggedAt: -1 });
    return res.status(200).json(logs);
  } catch (err) {
    console.error("getQuickLogs error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

// POST /api/v1/quicklog
exports.createQuickLog = async (req, res) => {
  try {
    const { name, organisation, contactEmail, contactPhone, serviceType, notes } = req.body;
    if (!name || !serviceType) {
      return res.status(400).json({ message: "Name and service type are required." });
    }
    const log = await QuickLog.create({
      name,
      organisation: organisation || "",
      contactEmail: contactEmail || "",
      contactPhone: contactPhone || "",
      serviceType,
      notes: notes || "",
      createdBy: req?.user?.id || "admin",
    });
    return res.status(201).json(log);
  } catch (err) {
    console.error("createQuickLog error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

// DELETE /api/v1/quicklog/:id
exports.deleteQuickLog = async (req, res) => {
  try {
    const { id } = req.params;
    await QuickLog.findByIdAndDelete(id);
    return res.status(200).json({ message: "Log entry deleted." });
  } catch (err) {
    console.error("deleteQuickLog error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};
