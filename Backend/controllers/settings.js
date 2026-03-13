const Setting = require("../models/Setting");
const { createLog } = require("../utils/createLog");
const { dispatchMail } = require("../utils/dispatchMail");

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

    if (!process.env.POSTMARK_SERVER_TOKEN || !process.env.EMAIL_FROM) {
      return res.status(400).json({
        ok: false,
        message:
          "Postmark not configured. Set POSTMARK_SERVER_TOKEN and EMAIL_FROM",
      });
    }

    const to = (s?.notifications?.replyTo || "support@ellcworth.com").trim();
    const fromName = (s?.notifications?.fromName || "Ellcworth Express").trim();
    const fromEmail = String(process.env.EMAIL_FROM || "").trim();
    const replyTo = String(
      process.env.EMAIL_REPLY_TO || "support@ellcworth.com",
    ).trim();

    await dispatchMail({
      to,
      from: `"${fromName}" <${fromEmail}>`,
      replyTo,
      subject: "Ellcworth Admin — Test Email",
      text: "This is a test email from Ellcworth Admin Settings.",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6">
          <h2>Ellcworth Admin — Test Email</h2>
          <p>This is a test email from Ellcworth Admin Settings.</p>
        </div>
      `,
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
