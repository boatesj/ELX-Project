const Setting = require("../models/Setting");
const { createLog } = require("../utils/createLog");
const nodemailer = require("nodemailer");

async function getSingleton() {
  let s = await Setting.findOne();
  if (!s) s = await Setting.create({});
  return s;
}

async function getSettings(req, res) {
  const s = await getSingleton();
  return res.json(s);
}

async function updateSettings(req, res) {
  const payload = req.body || {};
  const s = await getSingleton();

  const allowed = [
    "company",
    "operations",
    "security",
    "notifications",
    "integrations",
  ];

  for (const k of allowed) {
    if (payload[k] && typeof payload[k] === "object") {
      // Merge defensively
      const existing = s[k]?.toObject ? s[k].toObject() : s[k] || {};
      s[k] = { ...existing, ...payload[k] };
    }
  }

  await s.save();

  await createLog(req, {
    type: "settings",
    action: "Updated settings",
    ref: "settings",
  });

  return res.json(s);
}

async function testEmail(req, res) {
  try {
    const s = await getSingleton();

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      return res.status(400).json({
        ok: false,
        message:
          "SMTP not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS",
      });
    }

    const to = (s?.notifications?.replyTo || "support@ellcworth.com").trim();
    const fromName = (s?.notifications?.fromName || "Ellcworth Express").trim();
    const fromEmail = (process.env.SMTP_FROM || user).trim();

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject: "Ellcworth Admin — Test Email",
      text: "This is a test email from Ellcworth Admin Settings.",
    });

    await createLog(req, {
      type: "settings",
      action: "Sent test email",
      ref: to,
      meta: { to },
    });

    return res.json({ ok: true, message: `Test email sent to ${to}` });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: "Failed to send test email",
      error: err.message,
    });
  }
}

module.exports = { getSettings, updateSettings, testEmail };
