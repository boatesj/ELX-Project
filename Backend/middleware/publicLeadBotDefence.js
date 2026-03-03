// Backend/middleware/publicLeadBotDefence.js

function pickFirst(obj, keys = []) {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null) return v;
  }
  return undefined;
}

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

module.exports = function publicLeadBotDefence(req, res, next) {
  try {
    const isProd =
      String(process.env.NODE_ENV || "").toLowerCase() === "production";

    // -----------------------------
    // 1) Honeypot (hidden field)
    // -----------------------------
    // Frontend will add a hidden input; bots often fill everything.
    // Accept multiple possible field names for backwards compat.
    const honeypot = pickFirst(req.body, [
      "website", // common trap name
      "companyWebsite",
      "url",
      "hp",
      "address2",
      "fax",
    ]);

    if (isNonEmptyString(String(honeypot ?? ""))) {
      return res.status(400).json({
        ok: false,
        message: "Unable to process request. Please refresh and try again.",
      });
    }

    // -----------------------------
    // 2) Minimum time to submit
    // -----------------------------
    // Frontend will set formStartedAt = Date.now() when the form loads.
    const startedAtRaw = pickFirst(req.body, [
      "formStartedAt",
      "startedAt",
      "tsStarted",
      "clientStartedAt",
    ]);

    const minMs = Number(process.env.PUBLIC_LEAD_MIN_MS || 3500); // default: 3.5s
    const now = Date.now();

    // In production we enforce presence; in dev we allow missing to avoid breaking tests.
    if (
      startedAtRaw === undefined ||
      startedAtRaw === null ||
      startedAtRaw === ""
    ) {
      if (isProd) {
        return res.status(400).json({
          ok: false,
          message: "Unable to process request. Please refresh and try again.",
        });
      }
      return next();
    }

    const startedAt = Number(startedAtRaw);
    if (!Number.isFinite(startedAt)) {
      if (isProd) {
        return res.status(400).json({
          ok: false,
          message: "Unable to process request. Please refresh and try again.",
        });
      }
      return next();
    }

    const elapsed = now - startedAt;

    // If the client clock is weird, clamp
    if (!Number.isFinite(elapsed) || elapsed < 0) {
      if (isProd) {
        return res.status(400).json({
          ok: false,
          message: "Unable to process request. Please refresh and try again.",
        });
      }
      return next();
    }

    if (elapsed < minMs) {
      return res.status(429).json({
        ok: false,
        message: "Too many requests. Please try again in a moment.",
      });
    }

    return next();
  } catch (e) {
    // Fail closed in prod (bot defence middleware should be safe)
    const isProd =
      String(process.env.NODE_ENV || "").toLowerCase() === "production";
    if (isProd) {
      return res.status(400).json({
        ok: false,
        message: "Unable to process request. Please refresh and try again.",
      });
    }
    return next();
  }
};
