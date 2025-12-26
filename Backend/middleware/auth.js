const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ ok: false, message: "Missing token" });
  }

  const secret = process.env.JWT_SECRET || process.env.JWT_SEC;
  if (!secret) {
    return res
      .status(500)
      .json({ ok: false, message: "JWT secret not configured" });
  }

  try {
    const payload = jwt.verify(token, secret); // { id, role, iat, exp }

    // ✅ Normalize role for consistent auth checks (case-insensitive)
    const role =
      typeof payload?.role === "string"
        ? payload.role.trim().toLowerCase()
        : "";

    req.user = {
      ...payload,
      role, // normalized
      rawRole: payload?.role, // optional: useful for debugging / logs
    };

    return next();
  } catch (err) {
    return res
      .status(401)
      .json({ ok: false, message: "Invalid or expired token" });
  }
}

function requireRole(...roles) {
  // Normalize allowed roles once
  const allowed = roles
    .filter((r) => typeof r === "string")
    .map((r) => r.trim().toLowerCase());

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ ok: false, message: "Unauthorized" });
    }

    const role =
      typeof req.user.role === "string"
        ? req.user.role.trim().toLowerCase()
        : "";

    if (!allowed.includes(role)) {
      return res.status(403).json({
        ok: false,
        message: "Forbidden: insufficient role",
        required: allowed,
        got: role || null,
      });
    }

    return next();
  };
}

module.exports = { requireAuth, requireRole };
