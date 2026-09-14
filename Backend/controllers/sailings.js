const Sailing = require("../models/Sailing");

// -------- GET SAILINGS (public) --------
// Returns active sailings with departure date >= today
exports.getSailings = async (req, res) => {
  try {
    const query = { isActive: true, departureDate: { $gte: new Date() } };
    if (req.query.mode) query.mode = req.query.mode;
    if (req.query.destination) query.destination = req.query.destination.toLowerCase();
    const sailings = await Sailing.find(query).sort({ departureDate: 1 });
    res.status(200).json(sailings);
  } catch (err) {
    console.error("getSailings error:", err);
    res.status(500).json({ message: "Failed to fetch sailings" });
  }
};

// -------- ADMIN: GET ALL (including past/inactive) --------
exports.getAllSailings = async (req, res) => {
  try {
    const sailings = await Sailing.find().sort({ departureDate: -1 });
    res.status(200).json(sailings);
  } catch (err) {
    console.error("getAllSailings error:", err);
    res.status(500).json({ message: "Failed to fetch sailings" });
  }
};

// -------- ADMIN: CREATE --------
exports.createSailing = async (req, res) => {
  try {
    const sailing = await Sailing.create(req.body);
    res.status(201).json(sailing);
  } catch (err) {
    console.error("createSailing error:", err);
    res.status(400).json({ message: "Failed to create sailing", error: err.message });
  }
};

// -------- ADMIN: UPDATE --------
exports.updateSailing = async (req, res) => {
  try {
    const sailing = await Sailing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!sailing) return res.status(404).json({ message: "Sailing not found" });
    res.status(200).json(sailing);
  } catch (err) {
    console.error("updateSailing error:", err);
    res.status(400).json({ message: "Failed to update sailing", error: err.message });
  }
};

// -------- ADMIN: DELETE --------
exports.deleteSailing = async (req, res) => {
  try {
    const sailing = await Sailing.findByIdAndDelete(req.params.id);
    if (!sailing) return res.status(404).json({ message: "Sailing not found" });
    res.status(200).json({ message: "Sailing deleted" });
  } catch (err) {
    console.error("deleteSailing error:", err);
    res.status(400).json({ message: "Failed to delete sailing", error: err.message });
  }
};
