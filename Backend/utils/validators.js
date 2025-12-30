const { body, param } = require("express-validator");

// --- Shared enums to stay consistent with the Shipment model ---

const SHIPMENT_MODES = [
  "RoRo",
  "Container",
  "Air",
  "LCL",
  "Documents",
  "Pallets",
  "Parcels",
];

const SHIPMENT_TYPES = ["export", "import", "cross_trade"];

const SERVICE_LEVELS = [
  "door_to_port",
  "port_to_port",
  "door_to_door",
  "port_to_door",
];

const PAYMENT_STATUSES = ["unpaid", "part_paid", "paid", "on_account"];

const SHIPMENT_STATUSES = [
  // ✅ Request → Quote → Approval (new)
  "request_received",
  "under_review",
  "quoted",
  "customer_requested_changes",
  "customer_approved",

  // Existing operational statuses
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

/**
 * Validate login input
 */
const validateLogin = [
  body("email").isEmail().withMessage("A valid email is required"),
  body("password")
    .isString()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

/**
 * Validate registration input
 */
const validateRegister = [
  body("fullname")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Full name is required"),
  body("email").isEmail().withMessage("A valid email is required"),
  body("password")
    .isString()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  body("country")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Country is required"),
  body("address")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Address is required"),
  body("age")
    .optional({ nullable: true })
    .isInt({ min: 0, max: 130 })
    .withMessage("Age must be a valid number between 0 and 130"),
];

/**
 * Validate ObjectId parameter (default: id)
 */
const validateObjectIdParam = (name = "id") => [
  param(name).isMongoId().withMessage(`${name} must be a valid ObjectId`),
];

/**
 * Validate tracking event
 */
const validateTrackingEvent = [
  body("event")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Event description is required"),
  body("date")
    .optional({ checkFalsy: true, nullable: true })
    .isISO8601()
    .withMessage("Date must be in ISO8601 format"),
  body("location")
    .optional({ checkFalsy: true, nullable: true })
    .isString()
    .trim()
    .withMessage("Location must be a string"),
  body("meta")
    .optional({ nullable: true })
    .isObject()
    .withMessage("Meta must be an object if provided"),
];

/**
 * Validate shipment document add (admin)
 */
const validateDocument = [
  body("name")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Document name is required"),
  body("fileUrl").isURL().withMessage("File URL must be valid"),
];

/**
 * Validate shipment creation – aligned with staged intake (corporate standard):
 * - required: shipper.name/address/email, consignee.name/address, ports origin/destination
 * - optional fields can be missing OR null OR "" at request stage
 * - format validation triggers only when a real value exists
 */
const validateShipmentCreate = [
  // Ownership & identity
  body("customer")
    .optional({ checkFalsy: true, nullable: true })
    .isMongoId()
    .withMessage("Customer ID must be a valid ObjectId"),

  body("referenceNo")
    .optional({ checkFalsy: true, nullable: true })
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Reference number must be a non-empty string if provided"),

  // Basic classification
  body("shipmentType")
    .optional({ checkFalsy: true, nullable: true })
    .isIn(SHIPMENT_TYPES)
    .withMessage(`Shipment type must be one of: ${SHIPMENT_TYPES.join(", ")}`),

  body("serviceLevel")
    .optional({ checkFalsy: true, nullable: true })
    .isIn(SERVICE_LEVELS)
    .withMessage(`Service level must be one of: ${SERVICE_LEVELS.join(", ")}`),

  // Shipper (required)
  body("shipper.name")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Shipper name is required"),
  body("shipper.address")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Shipper address is required"),
  body("shipper.email")
    .isEmail()
    .withMessage("Shipper email must be a valid email address"),
  body("shipper.phone")
    .optional({ checkFalsy: true, nullable: true })
    .isString()
    .trim()
    .withMessage("Shipper phone must be a string"),

  // Consignee (name/address required, email optional)
  body("consignee.name")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Consignee name is required"),
  body("consignee.address")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Consignee address is required"),

  // ✅ Corporate: accept "", null, missing — validate only if a real value exists
  body("consignee.email")
    .optional({ checkFalsy: true, nullable: true })
    .isEmail()
    .withMessage("Consignee email must be a valid email address"),

  body("consignee.phone")
    .optional({ checkFalsy: true, nullable: true })
    .isString()
    .trim()
    .withMessage("Consignee phone must be a string"),

  // Notify party (fully optional)
  body("notify.name")
    .optional({ checkFalsy: true, nullable: true })
    .isString()
    .trim()
    .withMessage("Notify name must be a string"),
  body("notify.address")
    .optional({ checkFalsy: true, nullable: true })
    .isString()
    .trim()
    .withMessage("Notify address must be a string"),
  body("notify.email")
    .optional({ checkFalsy: true, nullable: true })
    .isEmail()
    .withMessage("Notify email must be a valid email address"),
  body("notify.phone")
    .optional({ checkFalsy: true, nullable: true })
    .isString()
    .trim()
    .withMessage("Notify phone must be a string"),

  // Ports (required)
  body("ports.originPort")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Origin port is required"),
  body("ports.destinationPort")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Destination port is required"),

  // Mode & status
  body("mode")
    .optional({ checkFalsy: true, nullable: true })
    .isIn(SHIPMENT_MODES)
    .withMessage(`Mode must be one of: ${SHIPMENT_MODES.join(", ")}`),

  body("status")
    .optional({ checkFalsy: true, nullable: true })
    .isIn(SHIPMENT_STATUSES)
    .withMessage(`Status must be one of: ${SHIPMENT_STATUSES.join(", ")}`),

  // Commercials
  body("incoterm")
    .optional({ checkFalsy: true, nullable: true })
    .isString()
    .trim()
    .withMessage("Incoterm must be a string"),
  body("cargoValue.amount")
    .optional({ checkFalsy: true, nullable: true })
    .isFloat({ gt: 0 })
    .withMessage("Cargo value amount must be a positive number"),
  body("cargoValue.currency")
    .optional({ checkFalsy: true, nullable: true })
    .isString()
    .trim()
    .withMessage("Cargo value currency must be a string"),
  body("paymentStatus")
    .optional({ checkFalsy: true, nullable: true })
    .isIn(PAYMENT_STATUSES)
    .withMessage(
      `Payment status must be one of: ${PAYMENT_STATUSES.join(", ")}`
    ),

  // ✅ Corporate: accept null/"" for date fields at request stage
  body("shippingDate")
    .optional({ checkFalsy: true, nullable: true })
    .isISO8601()
    .withMessage("Shipping date must be a valid ISO date"),
  body("eta")
    .optional({ checkFalsy: true, nullable: true })
    .isISO8601()
    .withMessage("ETA must be a valid ISO date"),

  // Cargo – light-touch validation
  body("cargo.description")
    .optional({ checkFalsy: true, nullable: true })
    .isString()
    .trim()
    .withMessage("Cargo description must be a string"),

  body("cargo.weight")
    .optional({ checkFalsy: true, nullable: true })
    .isString()
    .trim()
    .withMessage("Cargo weight must be a string"),

  body("cargo.volumeCbm")
    .optional({ checkFalsy: true, nullable: true })
    .isFloat({ gt: 0 })
    .withMessage("Cargo volume (cbm) must be a positive number"),

  body("cargo.packageCount")
    .optional({ checkFalsy: true, nullable: true })
    .isInt({ min: 1 })
    .withMessage("Package count must be at least 1"),

  // Vehicle (RoRo)
  body("cargo.vehicle.make")
    .optional({ checkFalsy: true, nullable: true })
    .isString()
    .trim()
    .withMessage("Vehicle make must be a string"),
  body("cargo.vehicle.model")
    .optional({ checkFalsy: true, nullable: true })
    .isString()
    .trim()
    .withMessage("Vehicle model must be a string"),
  body("cargo.vehicle.year")
    .optional({ checkFalsy: true, nullable: true })
    .isString()
    .trim()
    .withMessage("Vehicle year must be a string"),
  body("cargo.vehicle.vin")
    .optional({ checkFalsy: true, nullable: true })
    .isString()
    .trim()
    .withMessage("Vehicle VIN must be a string"),
  body("cargo.vehicle.registrationNo")
    .optional({ checkFalsy: true, nullable: true })
    .isString()
    .trim()
    .withMessage("Vehicle registration number must be a string"),

  // Container
  body("cargo.container.containerNo")
    .optional({ checkFalsy: true, nullable: true })
    .isString()
    .trim()
    .withMessage("Container number must be a string"),
  body("cargo.container.size")
    .optional({ checkFalsy: true, nullable: true })
    .isString()
    .trim()
    .withMessage("Container size must be a string"),
  body("cargo.container.sealNo")
    .optional({ checkFalsy: true, nullable: true })
    .isString()
    .trim()
    .withMessage("Seal number must be a string"),

  // Secure documents shipment
  body("cargo.documentsShipment.count")
    .optional({ checkFalsy: true, nullable: true })
    .isInt({ min: 1 })
    .withMessage("Documents count must be at least 1"),
  body("cargo.documentsShipment.docTypes")
    .optional({ nullable: true })
    .isArray()
    .withMessage("Document types must be an array of strings"),
  body("cargo.documentsShipment.secure")
    .optional({ nullable: true })
    .isBoolean()
    .withMessage("Documents secure flag must be boolean"),

  // Allow these fields through validation
  body("serviceType")
    .optional({ checkFalsy: true, nullable: true })
    .isIn(["sea_freight", "air_freight"])
    .withMessage("Service type must be one of: sea_freight, air_freight"),
  body("cargoType")
    .optional({ checkFalsy: true, nullable: true })
    .isIn(["vehicle", "container", "lcl"])
    .withMessage("Cargo type must be one of: vehicle, container, lcl"),

  // Allow value-added services payload
  body("services.repacking.required")
    .optional({ nullable: true })
    .isBoolean()
    .withMessage("Repacking required flag must be boolean"),
  body("services.repacking.notes")
    .optional({ checkFalsy: true, nullable: true })
    .isString()
    .trim()
    .withMessage("Repacking notes must be a string"),
];

module.exports = {
  validateLogin,
  validateRegister,
  validateObjectIdParam,
  validateTrackingEvent,
  validateDocument,
  validateShipmentCreate,
};
