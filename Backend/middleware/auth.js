const jwt = require("jsonwebtoken");

/**
 * Normalize role strings from token payload / DB values.
 * Examples:
 * - "Admin" -> "admin"
 * - " user " -> "user"
 */
function normalizeRole(role) {
  if (typeof role !== "string") return "";
  const r = role.trim().toLowerCase();
  // Map legacy/DB values if needed
  if (r === "admin") return "admin";
  if (r === "shipper") return "shipper";
  if (r === "consignee") return "consignee";
  if (r === "both") return "both";
  if (r === "user") return "user";
  return r;
}

function getJwtSecret() {
  return process.env.JWT_SECRET || process.env.JWT_SEC || null;
}

/**
 * Require a valid Bearer token. Attaches req.user = { id, role, ...payload }.
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ ok: false, message: "Missing token" });
  }

  const secret = getJwtSecret();
  if (!secret) {
    return res
      .status(500)
      .json({ ok: false, message: "JWT secret not configured" });
  }

  try {
    const payload = jwt.verify(token, secret); // { id, role, iat, exp, ... }

    const role = normalizeRole(payload?.role);
    const id = payload?.id;

    if (!id) {
      return res
        .status(401)
        .json({ ok: false, message: "Invalid token payload" });
    }

    req.user = {
      ...payload,
      id,
      role,
      rawRole: payload?.role,
    };

    return next();
  } catch (err) {
    return res
      .status(401)
      .json({ ok: false, message: "Invalid or expired token" });
  }
}

/**
 * Require one of the given roles.
 * Usage: requireRole("admin")
 */
function requireRole(...roles) {
  const allowed = roles
    .filter((r) => typeof r === "string")
    .map((r) => normalizeRole(r))
    .filter(Boolean);

  return (req, res, next) => {
    if (!req.user)
      return res.status(401).json({ ok: false, message: "Unauthorized" });

    const role = normalizeRole(req.user.role);
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

/**
 * Convenience: admin only.
 */
function requireAdmin(req, res, next) {
  return requireRole("admin")(req, res, next);
}

module.exports = { requireAuth, requireRole, requireAdmin, normalizeRole };
