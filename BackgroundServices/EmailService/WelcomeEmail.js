const ejs = require("ejs");
const path = require("path");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const { dispatchMail } = require("../helpers/sendmail"); // Gmail transporter
const User = require("../models/User");

// Load BackgroundServices/.env deterministically (avoid CWD surprises)
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

// Optional fallback: repo-root .env (harmless if not present)
// This helps if you sometimes run BackgroundServices from repo root.
dotenv.config({ path: path.resolve(__dirname, "..", "..", ".env") });

function jwtSecret() {
  return process.env.JWT_SECRET || process.env.JWT_SEC || null;
}

function buildResetUrl(token) {
  const base = (process.env.CLIENT_URL || "http://localhost:5173").replace(
    /\/+$/,
    "",
  );
  return `${base}/reset-password/${token}`;
}

const sendWelcomeMail = async () => {
  try {
    const secret = jwtSecret();
    if (!secret) {
      console.error(
        "❌ WelcomeEmail: JWT secret missing. Set JWT_SECRET (preferred) in BackgroundServices/.env",
      );
      return;
    }

    // Find new users who haven't received welcome mail yet
    const users = await User.find({
      welcomeMailSent: false,
      status: "pending",
    });

    if (users.length === 0) {
      console.log("ℹ️ No new users to send welcome mail to.");
      return;
    }

    // Configurable expiry (defaults to 24h for set-password flow)
    const expiresIn = process.env.WELCOME_TOKEN_EXPIRES || "24h";

    for (const user of users) {
      // Generate secure, time-limited token
      const token = jwt.sign({ id: user._id }, secret, { expiresIn });

      // Build secure reset link
      const setPasswordUrl = buildResetUrl(token);

      // Render welcome email with link
      const html = await ejs.renderFile(
        path.join(__dirname, "../templates/welcome.ejs"),
        {
          fullname: user.fullname,
          email: user.email,
          setPasswordUrl,
        },
      );

      // Send mail
      await dispatchMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL,
        to: user.email,
        subject: "Welcome to Ellcworth",
        html,
      });

      console.log(`✅ Welcome mail sent to ${user.email}`);

      /**
       * IMPORTANT NOTE:
       * We mark welcomeMailSent true so we don't resend.
       * We DO NOT force status="active" here, because Backend resetPassword
       * also activates the user. Keeping activation to the password-set step
       * avoids accounts becoming "active" without a password being set.
       */
      await User.updateOne(
        { _id: user._id },
        { $set: { welcomeMailSent: true } },
      );
    }
  } catch (err) {
    console.error("❌ Error in sendWelcomeMail:", err);
  }
};

module.exports = { sendWelcomeMail };
