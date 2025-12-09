const { validationResult } = require("express-validator");

/**
 * Centralized validation error handler middleware.
 * Responds with 422 if any validation rule fails.
 * Returns each invalid field with a clear message.
 */
function handleValidation(req, res, next) {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  // Format errors by field for easier frontend use
  const formatted = errors.array().map((err) => ({
    field: err.path,
    message: err.msg,
    value: err.value ?? null,
  }));

  return res.status(422).json({
    ok: false,
    message: "Validation error",
    errors: formatted,
  });
}

module.exports = { handleValidation };
