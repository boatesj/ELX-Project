const router = require("express").Router();
const {
  getPorts,
  createPort,
  updatePort,
  deletePort,
  getServiceTypes,
  createServiceType,
  updateServiceType,
  deleteServiceType,
  getCargoCategories,
  createCargoCategory,
  updateCargoCategory,
  deleteCargoCategory,
} = require("../controllers/config");

// If you have auth middleware, you can plug it in here:
// const { verifyTokenAndAdmin } = require("../middleware/verifyToken");
// then wrap the handlers, e.g. router.get("/ports", verifyTokenAndAdmin, getPorts);

// PORTS
router.get("/ports", getPorts);
router.post("/ports", createPort);
router.put("/ports/:id", updatePort);
router.delete("/ports/:id", deletePort);

// SERVICE TYPES
router.get("/service-types", getServiceTypes);
router.post("/service-types", createServiceType);
router.put("/service-types/:id", updateServiceType);
router.delete("/service-types/:id", deleteServiceType);

// CARGO CATEGORIES
router.get("/cargo-categories", getCargoCategories);
router.post("/cargo-categories", createCargoCategory);
router.put("/cargo-categories/:id", updateCargoCategory);
router.delete("/cargo-categories/:id", deleteCargoCategory);

module.exports = router;
