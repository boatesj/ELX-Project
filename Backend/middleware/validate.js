const { validationResult } = require("express-validator");

/**
 * Centralized validation error handler middleware.
 * Responds with 422 if any validation rule fails.
 * Returns each invalid field with a clear message.
 */
function handleValidation(req, res, next) {
  const result = validationResult(req);

  if (result.isEmpty()) return next();

  const raw = result.array({ onlyFirstError: true });

  // Normalize key across express-validator versions (path vs param)
  const formatted = raw.map((err) => ({
    field: err.path || err.param || "unknown",
    message: err.msg,
    value: Object.prototype.hasOwnProperty.call(err, "value")
      ? err.value
      : null,
  }));

  // Optional: de-dupe by field to keep frontend clean
  const dedupedMap = new Map();
  for (const e of formatted) {
    if (!dedupedMap.has(e.field)) dedupedMap.set(e.field, e);
  }

  return res.status(422).json({
    ok: false,
    message: "Validation error",
    errors: Array.from(dedupedMap.values()),
  });
}

module.exports = { handleValidation };
