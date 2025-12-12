const Port = require("../models/Port");
const ServiceType = require("../models/ServiceType");
const CargoCategory = require("../models/CargoCategory");

// -------- PORTS --------
exports.getPorts = async (req, res) => {
  try {
    const ports = await Port.find().sort({ code: 1 });
    res.status(200).json(ports);
  } catch (err) {
    console.error("getPorts error:", err);
    res.status(500).json({ message: "Failed to fetch ports" });
  }
};

exports.createPort = async (req, res) => {
  try {
    const port = await Port.create(req.body);
    res.status(201).json(port);
  } catch (err) {
    console.error("createPort error:", err);
    res
      .status(400)
      .json({ message: "Failed to create port", error: err.message });
  }
};

exports.updatePort = async (req, res) => {
  try {
    const port = await Port.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!port) {
      return res.status(404).json({ message: "Port not found" });
    }
    res.status(200).json(port);
  } catch (err) {
    console.error("updatePort error:", err);
    res
      .status(400)
      .json({ message: "Failed to update port", error: err.message });
  }
};

// -------- SERVICE TYPES --------
exports.getServiceTypes = async (req, res) => {
  try {
    const items = await ServiceType.find().sort({ key: 1 });
    res.status(200).json(items);
  } catch (err) {
    console.error("getServiceTypes error:", err);
    res.status(500).json({ message: "Failed to fetch service types" });
  }
};

exports.createServiceType = async (req, res) => {
  try {
    const item = await ServiceType.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    console.error("createServiceType error:", err);
    res
      .status(400)
      .json({ message: "Failed to create service type", error: err.message });
  }
};

exports.updateServiceType = async (req, res) => {
  try {
    const item = await ServiceType.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) {
      return res.status(404).json({ message: "Service type not found" });
    }
    res.status(200).json(item);
  } catch (err) {
    console.error("updateServiceType error:", err);
    res
      .status(400)
      .json({ message: "Failed to update service type", error: err.message });
  }
};

// -------- CARGO CATEGORIES --------
exports.getCargoCategories = async (req, res) => {
  try {
    const items = await CargoCategory.find().sort({ key: 1 });
    res.status(200).json(items);
  } catch (err) {
    console.error("getCargoCategories error:", err);
    res.status(500).json({ message: "Failed to fetch cargo categories" });
  }
};

exports.createCargoCategory = async (req, res) => {
  try {
    const item = await CargoCategory.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    console.error("createCargoCategory error:", err);
    res
      .status(400)
      .json({ message: "Failed to create cargo category", error: err.message });
  }
};

exports.updateCargoCategory = async (req, res) => {
  try {
    const item = await CargoCategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!item) {
      return res.status(404).json({ message: "Cargo category not found" });
    }
    res.status(200).json(item);
  } catch (err) {
    console.error("updateCargoCategory error:", err);
    res
      .status(400)
      .json({ message: "Failed to update cargo category", error: err.message });
  }
};

// -------- PORTS: DELETE --------
exports.deletePort = async (req, res) => {
  try {
    const port = await Port.findByIdAndDelete(req.params.id);
    if (!port) {
      return res.status(404).json({ message: "Port not found" });
    }
    res.status(200).json({ message: "Port deleted" });
  } catch (err) {
    console.error("deletePort error:", err);
    res
      .status(400)
      .json({ message: "Failed to delete port", error: err.message });
  }
};

// -------- SERVICE TYPES: DELETE --------
exports.deleteServiceType = async (req, res) => {
  try {
    const item = await ServiceType.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Service type not found" });
    }
    res.status(200).json({ message: "Service type deleted" });
  } catch (err) {
    console.error("deleteServiceType error:", err);
    res
      .status(400)
      .json({ message: "Failed to delete service type", error: err.message });
  }
};

// -------- CARGO CATEGORIES: DELETE --------
exports.deleteCargoCategory = async (req, res) => {
  try {
    const item = await CargoCategory.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Cargo category not found" });
    }
    res.status(200).json({ message: "Cargo category deleted" });
  } catch (err) {
    console.error("deleteCargoCategory error:", err);
    res
      .status(400)
      .json({ message: "Failed to delete cargo category", error: err.message });
  }
};
