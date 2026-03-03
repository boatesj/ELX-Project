// Backend/middleware/verifyTurnstile.js
const https = require("https");

function postForm(url, data) {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams(data).toString();
    const u = new URL(url);

    const req = https.request(
      {
        method: "POST",
        hostname: u.hostname,
        path: u.pathname + u.search,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let chunks = "";
        res.on("data", (d) => (chunks += d));
        res.on("end", () => {
          try {
            resolve(JSON.parse(chunks || "{}"));
          } catch (e) {
            reject(e);
          }
        });
      },
    );

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

module.exports = async function verifyTurnstile(req, res, next) {
  try {
    const enabled = String(process.env.TURNSTILE_ENABLED || "").toLowerCase();
    const isEnabled = enabled === "true" || enabled === "1";

    // Allow bypass in dev if you want
    if (!isEnabled) return next();

    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
      return res.status(500).json({
        ok: false,
        message: "Turnstile not configured (missing TURNSTILE_SECRET_KEY).",
      });
    }

    const token =
      req.body?.turnstileToken ||
      req.body?.cfTurnstileToken ||
      req.body?.captchaToken ||
      "";

    if (!token) {
      return res.status(400).json({
        ok: false,
        message: "Bot check failed (missing token). Please try again.",
      });
    }

    const ip =
      req.headers["cf-connecting-ip"] ||
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.ip;

    const result = await postForm(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { secret, response: token, remoteip: ip },
    );

    if (!result?.success) {
      return res.status(400).json({
        ok: false,
        message: "Bot check failed. Please refresh and try again.",
        ...(process.env.NODE_ENV !== "production" ? { debug: result } : null),
      });
    }

    return next();
  } catch (e) {
    return res.status(500).json({
      ok: false,
      message: "Bot verification error. Please try again.",
      ...(process.env.NODE_ENV !== "production" ? { error: e.message } : null),
    });
  }
};
