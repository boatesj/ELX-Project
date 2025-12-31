// Backend/utils/dispatchMail.js
const nodemailer = require("nodemailer");

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

const EMAIL_FROM =
  process.env.EMAIL_FROM || process.env.SMTP_FROM || "no-reply@ellcworth.com";

function buildTransport() {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error(
      "SMTP not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS (and optionally EMAIL_FROM)."
    );
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for 587/25
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

/**
 * dispatchMail({ to, subject, html, text, cc, bcc, replyTo, attachments })
 */
async function dispatchMail(opts = {}) {
  const { to, subject, html, text, cc, bcc, replyTo, attachments } = opts;

  if (!to) throw new Error("dispatchMail: 'to' is required");
  if (!subject) throw new Error("dispatchMail: 'subject' is required");
  if (!html && !text)
    throw new Error("dispatchMail: 'html' or 'text' is required");

  const transporter = buildTransport();

  const info = await transporter.sendMail({
    from: EMAIL_FROM,
    to,
    cc,
    bcc,
    replyTo,
    subject,
    text,
    html,
    attachments,
  });

  return info;
}

module.exports = { dispatchMail };
