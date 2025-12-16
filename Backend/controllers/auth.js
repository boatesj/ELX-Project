const bcrypt = require("bcryptjs");
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
    const { fullname, email, password, country, address, age } = req.body;

    if (!fullname || !email || !password || !country || !address) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing)
      return res.status(409).json({ message: "Email already registered." });

    const user = await User.create({
      fullname: fullname.trim(),
      email: normalizedEmail,
      password, // pre-save hook hashes this
      country: country.trim(),
      address: address.trim(),
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
    } catch (_) {
      // Logging should never block auth flows
    }

    const { password: _pw, ...safe } = user.toObject();
    const accessToken = signToken(user);
    return res.status(201).json({ ...safe, accessToken });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

/** LOGIN */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required." });

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password"
    );
    if (!user) {
      // ✅ LOG: failed login (unknown user)
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
      // ✅ LOG: failed login (bad password)
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

    // ✅ LOG: successful login
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
    return res.status(200).json({ ...safe, accessToken });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
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

    // Verify token
    const decoded = jwt.verify(token, secret);

    // Find user
    const user = await User.findById(decoded.id).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update password (pre-save hook hashes it)
    user.password = password;
    user.status = "active";
    user.welcomeMailSent = true;
    await user.save();

    // ✅ LOG: password reset completed
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
  requestPasswordReset,
  resetPassword,
};
