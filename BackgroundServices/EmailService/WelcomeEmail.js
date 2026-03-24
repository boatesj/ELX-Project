const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const { dispatchMail } = require("../helpers/sendmail"); // Gmail transporter
const User = require("../models/User");
const crypto = require("crypto");

dotenv.config();

const sendWelcomeMail = async () => {
  try {
    // Find new users who haven't received welcome mail yet
    const users = await User.find({
      welcomeMailSent: false,
      status: "pending",
    });

    if (users.length === 0) {
      console.log("ℹ️ No new users to send welcome mail to.");
      return;
    }

    for (let user of users) {
      // Generate a secure, time-limited token (valid for 24h)
      const jwtSecret = process.env.JWT_SECRET || "";
      console.log(
        "BG JWT fingerprint:",
        crypto
          .createHash("sha256")
          .update(jwtSecret)
          .digest("hex")
          .slice(0, 12),
      );

      const secret = process.env.JWT_SECRET || process.env.JWT_SEC || "";
      console.log(
        "BG JWT fingerprint:",
        crypto.createHash("sha256").update(secret).digest("hex").slice(0, 12),
      );
      if (!secret) throw new Error("JWT secret not configured");

      const token = jwt.sign({ id: user._id }, secret, {
        expiresIn: "24h",
      });

      // Build secure reset link
      console.log("CLIENT_URL at runtime:", process.env.CLIENT_URL);
      const setPasswordUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/auth/reset-password/${token}`;

      // Render welcome email with link
      const html = await ejs.renderFile(
        path.join(__dirname, "../templates/welcome.ejs"),
        {
          fullname: user.fullname,
          email: user.email,
          setPasswordUrl,
        },
      );

      // Send mail via Gmail
      await dispatchMail({
        from: process.env.EMAIL_FROM,
        replyTo: process.env.EMAIL_REPLY_TO,
        to: user.email,
        subject: "Welcome to Ellcworth",
        html,
      });

      console.log(`✅ Welcome mail sent to ${user.email}`);

      // Update user so we don’t resend
      await User.updateOne(
        { _id: user._id },
        { $set: { welcomeMailSent: true, status: "active" } },
      );
    }
  } catch (err) {
    console.error("❌ Error in sendWelcomeMail:", err);
  }
};

module.exports = { sendWelcomeMail };
