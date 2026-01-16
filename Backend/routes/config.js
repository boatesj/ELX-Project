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

const { requireAuth, requireAdmin } = require("../middleware/auth");

// PORTS (public reads, admin writes)
router.get("/ports", getPorts);
router.post("/ports", requireAuth, requireAdmin, createPort);
router.put("/ports/:id", requireAuth, requireAdmin, updatePort);
router.delete("/ports/:id", requireAuth, requireAdmin, deletePort);

// SERVICE TYPES (public reads, admin writes)
router.get("/service-types", getServiceTypes);
router.post("/service-types", requireAuth, requireAdmin, createServiceType);
router.put("/service-types/:id", requireAuth, requireAdmin, updateServiceType);
router.delete(
  "/service-types/:id",
  requireAuth,
  requireAdmin,
  deleteServiceType
);

// CARGO CATEGORIES (public reads, admin writes)
router.get("/cargo-categories", getCargoCategories);
router.post(
  "/cargo-categories",
  requireAuth,
  requireAdmin,
  createCargoCategory
);
router.put(
  "/cargo-categories/:id",
  requireAuth,
  requireAdmin,
  updateCargoCategory
);
router.delete(
  "/cargo-categories/:id",
  requireAuth,
  requireAdmin,
  deleteCargoCategory
);

module.exports = router;
