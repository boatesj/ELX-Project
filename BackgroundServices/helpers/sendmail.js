/**
 * BackgroundServices/helpers/sendmail.js
 *
 * LOCKED DESIGN:
 * - SMTP_* variables are PRIMARY
 * - MAIL_TRANSPORT controls behaviour: "smtp" | "console"
 * - Dev uses Gmail via SMTP
 * - Production switches to IONOS via env vars only (no code changes)
 * - Legacy EMAIL/PASSWORD allowed only as fallback safety net
 *
 * Compatibility:
 * - Exports dispatchMail() for existing callers (WelcomeEmail.js etc.)
 * - dispatchMail signature accepts { from, to, subject, html, text }
 */

const nodemailer = require("nodemailer");

const {
  MAIL_TRANSPORT = "smtp",

  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_SECURE,

  // Legacy fallback (safety only)
  EMAIL,
  PASSWORD,
} = process.env;

function createSmtpTransporter() {
  // Primary: generic SMTP_* (IONOS-ready)
  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: String(SMTP_SECURE).toLowerCase() === "true", // true for 465, false for 587
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }

  // Fallback: legacy Gmail service config (NOT recommended for prod)
  if (EMAIL && PASSWORD) {
    console.warn(
      "[sendmail] Using legacy EMAIL/PASSWORD fallback (safety only; avoid in prod)",
    );

    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL,
        pass: PASSWORD,
      },
    });
  }

  throw new Error(
    "SMTP configuration missing. Set SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS (primary) or legacy EMAIL/PASSWORD (fallback).",
  );
}

function createConsoleTransporter() {
  return {
    sendMail: async (options) => {
      console.log("📧 [MAIL:CONSOLE]");
      console.log("From:", options.from);
      console.log("To:", options.to);
      console.log("Subject:", options.subject);
      console.log("Body:", options.html || options.text);
      return { messageId: "console-transport" };
    },
  };
}

function getTransporter() {
  if (MAIL_TRANSPORT === "console") {
    console.log("[sendmail] MAIL_TRANSPORT=console");
    return createConsoleTransporter();
  }

  console.log("[sendmail] MAIL_TRANSPORT=smtp");
  return createSmtpTransporter();
}

/**
 * Core send function (preferred internal name)
 */
async function sendMail({ from, to, subject, html, text }) {
  if (!to) throw new Error("sendMail: 'to' is required");
  if (!subject) throw new Error("sendMail: 'subject' is required");

  const transporter = getTransporter();

  const defaultFrom =
    SMTP_USER || EMAIL || process.env.EMAIL_FROM || "no-reply@ellcworth.com";

  const messageOptions = {
    from: from || defaultFrom,
    to,
    subject,
    html,
    text,
  };

  try {
    const info = await transporter.sendMail(messageOptions);
    console.log("[sendmail] Message sent:", info.messageId || info);
    return info;
  } catch (err) {
    console.error("[sendmail] Failed to send email:", err.message);
    throw err;
  }
}

/**
 * Backward-compatible alias used by existing jobs.
 * Keeps Phase 5 forward-only (no refactor of job files).
 */
async function dispatchMail(options) {
  return sendMail(options);
}

module.exports = {
  sendMail,
  dispatchMail,
};
