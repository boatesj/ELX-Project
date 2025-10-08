const { body, param } = require("express-validator");

/**
 * Validate login input
 */
const validateLogin = [
  body("email")
    .isEmail()
    .withMessage("A valid email is required"),
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
  body("email")
    .isEmail()
    .withMessage("A valid email is required"),
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
    .optional()
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
 * Validate tracking event (cleaned up to match your data model)
 */
const validateTrackingEvent = [
  body("event")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Event description is required"),
  body("date")
    .optional()
    .isISO8601()
    .withMessage("Date must be in ISO8601 format"),
  body("location")
    .optional()
    .isString()
    .trim()
    .withMessage("Location must be a string"),
  body("meta")
    .optional()
    .isObject()
    .withMessage("Meta must be an object if provided"),
];

/**
 * Validate shipment document upload
 */
const validateDocument = [
  body("name")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Document name is required"),
  body("fileUrl")
    .isURL()
    .withMessage("File URL must be valid"),
];

/**
 * Validate shipment creation
 */
const validateShipmentCreate = [
  body("customer")
    .isMongoId()
    .withMessage("Customer ID must be a valid ObjectId"),
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
  body("cargoType")
    .isIn(["vehicle", "container", "lcl"])
    .withMessage("Cargo type must be one of: vehicle, container, lcl"),
];

module.exports = {
  validateLogin,
  validateRegister,
  validateObjectIdParam,
  validateTrackingEvent,
  validateDocument,
  validateShipmentCreate,
};
