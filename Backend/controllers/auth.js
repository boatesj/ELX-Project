const bcrypt = require("bcryptjs"); // kept (used elsewhere / harmless if unused here)
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { createLog } = require("../utils/createLog");

// Unified secret helper (matches your other files)
function jwtSecret() {
  return process.env.JWT_SECRET || process.env.JWT_SEC;
}

/** Helper to sign JWT (for login/register) */
function signToken(user) {
  const secret = jwtSecret();
  if (!secret) throw new Error("JWT secret not configured");

  return jwt.sign({ id: user._id, role: user.role }, secret, {
    expiresIn: process.env.JWT_EXPIRES || "10d",
  });
}

// Create a lightweight "req-like" object for logging when no auth middleware ran yet
function makeAuthLogReq({ userId, role, ip, ua }) {
  return {
    user: userId ? { id: String(userId), role } : undefined,
    ip: ip || "",
    headers: { "user-agent": ua || "" },
  };
}

/** REGISTER */
const registerUser = async (req, res) => {
  try {
    // ✅ include phone (your schema requires it)
    const { fullname, email, password, phone, country, address, age } =
      req.body;

    // ✅ align required fields with schema + validators
    if (!fullname || !email || !password || !phone || !country || !address) {
      return res.status(400).json({
        message:
          "Missing required fields. fullname, email, password, phone, country, and address are required.",
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "Email already registered." });
    }

    const user = await User.create({
      fullname: String(fullname).trim(),
      email: normalizedEmail,
      password, // pre-save hook hashes this
      phone: String(phone).trim(),
      country: String(country).trim(),
      address: String(address).trim(),
      age,
      status: "pending",
      welcomeMailSent: false,
    });

    // ✅ LOG: registration event
    try {
      await createLog(
        makeAuthLogReq({
          userId: user._id,
          role: user.role,
          ip: req.ip,
          ua: req.headers["user-agent"],
        }),
        {
          type: "auth",
          action: "User registered",
          ref: normalizedEmail,
          meta: { ip: req.ip, ua: req.headers["user-agent"] },
        }
      );
    } catch (_) {}

    const { password: _pw, ...safe } = user.toObject();
    const accessToken = signToken(user);

    // preserve your existing response shape
    return res.status(201).json({ ...safe, accessToken });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

/** LOGIN (generic: admin + non-admin) */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password"
    );

    if (!user) {
      try {
        await createLog(
          makeAuthLogReq({
            userId: "",
            role: "",
            ip: req.ip,
            ua: req.headers["user-agent"],
          }),
          {
            type: "auth",
            action: "Login failed (unknown email)",
            ref: normalizedEmail,
            meta: { ip: req.ip, ua: req.headers["user-agent"] },
          }
        );
      } catch (_) {}
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      try {
        await createLog(
          makeAuthLogReq({
            userId: user._id,
            role: user.role,
            ip: req.ip,
            ua: req.headers["user-agent"],
          }),
          {
            type: "auth",
            action: "Login failed (invalid password)",
            ref: user.email,
            meta: { ip: req.ip, ua: req.headers["user-agent"] },
          }
        );
      } catch (_) {}
      return res.status(401).json({ message: "Invalid credentials." });
    }

    try {
      await createLog(
        makeAuthLogReq({
          userId: user._id,
          role: user.role,
          ip: req.ip,
          ua: req.headers["user-agent"],
        }),
        {
          type: "auth",
          action: "Login success",
          ref: user.email,
          meta: { ip: req.ip, ua: req.headers["user-agent"] },
        }
      );
    } catch (_) {}

    const accessToken = signToken(user);
    const { password: _pw, ...safe } = user.toObject();

    // preserve your existing response shape
    return res.status(200).json({ ...safe, accessToken });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

/**
 * ✅ CUSTOMER LOGIN (strict: NEVER allows admin)
 * Endpoint returns:
 *  { ok: true, token, user }
 *
 * Notes:
 * - Your DB may store customers as role "user".
 * - We block role === "admin" absolutely.
 */
const customerLoginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ ok: false, message: "Email and password are required." });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password"
    );

    if (!user) {
      try {
        await createLog(
          makeAuthLogReq({
            userId: "",
            role: "",
            ip: req.ip,
            ua: req.headers["user-agent"],
          }),
          {
            type: "auth",
            action: "Customer login failed (unknown email)",
            ref: normalizedEmail,
            meta: { ip: req.ip, ua: req.headers["user-agent"] },
          }
        );
      } catch (_) {}
      return res
        .status(401)
        .json({ ok: false, message: "Invalid credentials." });
    }

    const roleLower = String(user.role || "").toLowerCase();
    if (roleLower === "admin") {
      try {
        await createLog(
          makeAuthLogReq({
            userId: user._id,
            role: user.role,
            ip: req.ip,
            ua: req.headers["user-agent"],
          }),
          {
            type: "auth",
            action: "Customer login blocked (admin attempted customer portal)",
            ref: user.email,
            meta: { ip: req.ip, ua: req.headers["user-agent"] },
          }
        );
      } catch (_) {}
      return res.status(403).json({
        ok: false,
        message: "This account must sign in via the Admin portal.",
      });
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      try {
        await createLog(
          makeAuthLogReq({
            userId: user._id,
            role: user.role,
            ip: req.ip,
            ua: req.headers["user-agent"],
          }),
          {
            type: "auth",
            action: "Customer login failed (invalid password)",
            ref: user.email,
            meta: { ip: req.ip, ua: req.headers["user-agent"] },
          }
        );
      } catch (_) {}
      return res
        .status(401)
        .json({ ok: false, message: "Invalid credentials." });
    }

    // Minimal, portal-safe customer object (no password)
    const safeUser = {
      id: String(user._id),
      email: user.email,
      fullname: user.fullname,
      role: user.role, // likely "user" in your DB
      status: user.status,
      country: user.country,
      city: user.city,
      phone: user.phone,
    };

    try {
      await createLog(
        makeAuthLogReq({
          userId: user._id,
          role: user.role,
          ip: req.ip,
          ua: req.headers["user-agent"],
        }),
        {
          type: "auth",
          action: "Customer login success",
          ref: user.email,
          meta: { ip: req.ip, ua: req.headers["user-agent"] },
        }
      );
    } catch (_) {}

    const token = signToken(user);

    return res.status(200).json({
      ok: true,
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error("Customer login error:", err);
    return res.status(500).json({
      ok: false,
      message: "Server error",
      error: err.message,
    });
  }
};

/** VERIFY RESET TOKEN */
const requestPasswordReset = async (req, res) => {
  try {
    const { token } = req.params;

    const secret = jwtSecret();
    if (!secret) throw new Error("JWT secret not configured");

    const decoded = jwt.verify(token, secret);
    return res.status(200).json({ valid: true, userId: decoded.id });
  } catch (err) {
    return res
      .status(400)
      .json({ valid: false, message: "Invalid or expired token" });
  }
};

/** RESET PASSWORD */
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const secret = jwtSecret();
    if (!secret) throw new Error("JWT secret not configured");

    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = password; // pre-save hook hashes it
    user.status = "active";
    user.welcomeMailSent = true;
    await user.save();

    try {
      await createLog(
        makeAuthLogReq({
          userId: user._id,
          role: user.role,
          ip: req.ip,
          ua: req.headers["user-agent"],
        }),
        {
          type: "auth",
          action: "Password reset completed",
          ref: user.email,
          meta: { ip: req.ip, ua: req.headers["user-agent"] },
        }
      );
    } catch (_) {}

    return res.status(200).json({
      message: "Password has been set successfully. You can now login.",
    });
  } catch (err) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  customerLoginUser,
  requestPasswordReset,
  resetPassword,
};
