const Rate = require("../models/Rate");

// -------- GET RATES (optionally filtered by destination) --------
// Returns all rates regardless of isActive — the public widget filters
// active-only client-side, and the admin panel needs to see inactive
// rates too so they can be reviewed and re-activated.
exports.getRates = async (req, res) => {
  try {
    const query = {};
    if (req.query.destination) {
      query.destination = String(req.query.destination).toLowerCase();
    }
    const rates = await Rate.find(query).sort({ destination: 1, service: 1 });
    res.status(200).json(rates);
  } catch (err) {
    console.error("getRates error:", err);
    res.status(500).json({ message: "Failed to fetch rates" });
  }
};

// -------- ADMIN: CREATE --------
exports.createRate = async (req, res) => {
  try {
    const rate = await Rate.create(req.body);
    res.status(201).json(rate);
  } catch (err) {
    console.error("createRate error:", err);
    res
      .status(400)
      .json({ message: "Failed to create rate", error: err.message });
  }
};

// -------- ADMIN: UPDATE --------
exports.updateRate = async (req, res) => {
  try {
    const rate = await Rate.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!rate) {
      return res.status(404).json({ message: "Rate not found" });
    }
    res.status(200).json(rate);
  } catch (err) {
    console.error("updateRate error:", err);
    res
      .status(400)
      .json({ message: "Failed to update rate", error: err.message });
  }
};

// -------- ADMIN: DELETE --------
exports.deleteRate = async (req, res) => {
  try {
    const rate = await Rate.findByIdAndDelete(req.params.id);
    if (!rate) {
      return res.status(404).json({ message: "Rate not found" });
    }
    res.status(200).json({ message: "Rate deleted" });
  } catch (err) {
    console.error("deleteRate error:", err);
    res
      .status(400)
      .json({ message: "Failed to delete rate", error: err.message });
  }
};
