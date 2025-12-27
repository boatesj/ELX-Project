const jwt = require("jsonwebtoken");

/**
 * Normalize role strings from token payload / DB values.
 * Fail-closed: if role isn't recognized, return empty string.
 */
function normalizeRole(role) {
  if (typeof role !== "string") return "";
  const r = role.trim().toLowerCase();

  // ✅ Add "customer" (customer portal role)
  // NOTE: your DB may still use "user" for customers; we treat BOTH as valid non-admin roles.
  const allowed = new Set([
    "admin",
    "customer",
    "shipper",
    "consignee",
    "both",
    "user",
  ]);
  return allowed.has(r) ? r : "";
}

function getJwtSecret() {
  return process.env.JWT_SECRET || process.env.JWT_SEC || null;
}

function readBearerToken(req) {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice(7).trim();
  return null;
}

/**
 * Require a valid token. Attaches:
 *  - req.user = { ...payload, id, role, rawRole }
 *  - req.auth = { id, role, isAdmin }
 */
function requireAuth(req, res, next) {
  const token = readBearerToken(req);

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

    const id = payload?.id ? String(payload.id) : "";
    const role = normalizeRole(payload?.role);

    if (!id) {
      return res
        .status(401)
        .json({ ok: false, message: "Invalid token payload" });
    }

    // If role is missing/unknown, treat as non-authorized for role checks
    req.user = {
      ...payload,
      id,
      role,
      rawRole: payload?.role,
    };

    req.auth = {
      id,
      role,
      isAdmin: role === "admin",
    };

    return next();
  } catch (_err) {
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
    if (!req.user) {
      return res.status(401).json({ ok: false, message: "Unauthorized" });
    }

    const role = normalizeRole(req.user.role);

    if (!role || !allowed.includes(role)) {
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
