const Log = require("../models/Log");

/**
 * Best-effort logging.
 * Never throw back into business logic (calendar/shipment/etc).
 */
async function createLog(req, { type, action, ref = "", meta = {} }) {
  try {
    const actorId = req?.user?.id ? String(req.user.id) : "";

    // Ensure meta is always a plain object (avoid Mongoose casting surprises)
    const safeMeta =
      meta && typeof meta === "object" && !Array.isArray(meta)
        ? meta
        : { meta };

    await Log.create({
      type,
      actorId,
      action,
      ref: String(ref || ""),
      meta: safeMeta,
    });

    return { ok: true };
  } catch (err) {
    // Swallow errors – we do NOT want audit logging to block core flows.
    return { ok: false, error: err?.message || "Log write failed" };
  }
}

module.exports = { createLog };
