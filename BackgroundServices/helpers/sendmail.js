const nodemailer = require("nodemailer");
const path = require("path");
const dotenv = require("dotenv");

// Deterministic env loading (avoid CWD surprises)
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });
dotenv.config({ path: path.resolve(__dirname, "..", "..", ".env") });

function hasSmtpCreds() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

// Legacy Gmail env (older helper used EMAIL/PASSWORD)
function hasLegacyGmailCreds() {
  return Boolean(process.env.EMAIL && process.env.PASSWORD);
}

/**
 * Prepare the mail transporter.
 *
 * Supported modes:
 * - MAIL_TRANSPORT=console -> logs emails to console (dev-safe)
 * - MAIL_TRANSPORT=smtp    -> uses SMTP_* keys (preferred, works for Gmail + IONOS)
 *
 * Default:
 * - If SMTP creds exist -> smtp
 * - Else if legacy Gmail creds exist -> gmail
 * - Else -> console (dev-safe)
 */
function prepareDispatch() {
  const mode = String(process.env.MAIL_TRANSPORT || "")
    .toLowerCase()
    .trim();

  // Explicit console transport
  if (mode === "console") {
    return nodemailer.createTransport({
      name: "console-transport",
      streamTransport: true,
      newline: "unix",
      buffer: true,
    });
  }

  // Preferred: SMTP transport (works for Gmail/IONOS/etc)
  if (mode === "smtp" || hasSmtpCreds()) {
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = Number(process.env.SMTP_PORT || 587);
    const secure = port === 465; // 465 = implicit TLS, 587 = STARTTLS

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Legacy Gmail transport (kept for compatibility; not recommended going forward)
  if (hasLegacyGmailCreds()) {
    return nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
  }

  // Dev-safe default: don't crash scheduled jobs if creds aren't set
  return nodemailer.createTransport({
    name: "console-transport-default",
    streamTransport: true,
    newline: "unix",
    buffer: true,
  });
}

/**
 * Dispatch an email.
 * If using console transport, it will log the raw message instead of sending.
 */
const dispatchMail = async (messageOptions) => {
  const transporter = prepareDispatch();

  try {
    const isConsole =
      transporter.options &&
      (transporter.options.streamTransport ||
        transporter.options.name?.includes("console"));

    if (!isConsole) {
      await transporter.verify();
      console.log("✅ Mail transporter is ready");
    } else {
      console.log("📝 Mail transporter = console (no SMTP creds configured)");
    }

    const info = await transporter.sendMail(messageOptions);

    // For console transport, print the message preview
    if (info && info.message) {
      console.log("📩 Email (console):\n", info.message.toString());
    } else {
      console.log("📩 Message dispatched:", info.response || "(no response)");
    }

    return info;
  } catch (err) {
    console.error("❌ Error dispatching mail:", err);
    throw err;
  }
};

module.exports = { dispatchMail };
