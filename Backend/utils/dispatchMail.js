// Backend/utils/dispatchMail.js
const nodemailer = require("nodemailer");

function pickFromAddress(env) {
  return (
    env.EMAIL_FROM ||
    env.SMTP_FROM ||
    env.MAIL_FROM ||
    env.SMTP_USER || // sensible fallback
    ""
  );
}

function requireEnv(env, keys) {
  const missing = keys.filter((k) => !String(env[k] || "").trim());
  if (missing.length) {
    const present = keys.filter((k) => String(env[k] || "").trim());
    const from = pickFromAddress(env);

    const detail = [
      `Missing: ${missing.join(", ")}`,
      present.length ? `Present: ${present.join(", ")}` : `Present: (none)`,
      from ? `From resolved as: ${from}` : `From resolved as: (empty)`,
      `Tip: if using .env, restart the backend after edits.`,
    ].join(" | ");

    const err = new Error(
      `SMTP not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS (and optionally EMAIL_FROM). ${detail}`
    );
    err.code = "SMTP_NOT_CONFIGURED";
    throw err;
  }
}

function logSendResult(info) {
  // ✅ "truth" log: what nodemailer says happened (or console transport equivalent)
  console.log("📨 sendMail result:", {
    messageId: info?.messageId,
    accepted: info?.accepted,
    rejected: info?.rejected,
    pending: info?.pending,
    response: info?.response,
    envelope: info?.envelope,
    // These may exist depending on transport / provider:
    // messageSize: info?.messageSize,
    // previewUrl: info?.previewUrl,
  });
}

function buildTransport() {
  const env = process.env;
  const transportMode = String(env.MAIL_TRANSPORT || "").toLowerCase();

  // ✅ DEV escape hatch: log emails instead of sending
  if (transportMode === "console") {
    return {
      mode: "console",
      async sendMail(msg) {
        // Don't dump huge HTML into terminal; show the useful bits.
        console.log("📧 [MAIL_TRANSPORT=console] Email would send:", {
          to: msg.to,
          from: msg.from,
          subject: msg.subject,
          textPreview: (msg.text || "").slice(0, 500),
        });

        // Return a nodemailer-like shape so downstream logging is consistent.
        return {
          messageId: "console-transport",
          accepted: Array.isArray(msg.to) ? msg.to : [msg.to].filter(Boolean),
          rejected: [],
          response: "MAIL_TRANSPORT=console",
          envelope: {
            from: msg.from,
            to: Array.isArray(msg.to) ? msg.to : [msg.to].filter(Boolean),
          },
        };
      },
    };
  }

  // Default: SMTP
  requireEnv(env, ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"]);

  const port = Number(env.SMTP_PORT);
  const secure =
    String(env.SMTP_SECURE || "").toLowerCase() === "true" || port === 465;

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number.isFinite(port) ? port : 587,
    secure,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  return {
    mode: "smtp",
    async sendMail(msg) {
      const info = await transporter.sendMail(msg);
      return info;
    },
  };
}

/**
 * dispatchMail returns a normalized payload:
 * {
 *   ok: true,
 *   mode: "smtp" | "console",
 *   messageId: string | null,
 *   accepted?: string[],
 *   response?: string
 * }
 */
async function dispatchMail({ to, subject, html, text, from }) {
  const env = process.env;

  const resolvedFrom = String(from || pickFromAddress(env) || "").trim();
  if (!resolvedFrom) {
    throw new Error(
      "Email FROM address missing. Set EMAIL_FROM (or SMTP_FROM) in Backend/.env."
    );
  }

  const transport = buildTransport();
  const msg = {
    to,
    from: resolvedFrom,
    subject,
    text,
    html,
  };

  // 🔎 Minimal runtime trace (keep)
  console.log("📬 dispatchMail attempt:", {
    mode: transport.mode,
    to,
    from: resolvedFrom,
    subject,
  });

  const info = await transport.sendMail(msg);

  // ✅ prove delivery-attempt truth (what the SMTP server said)
  logSendResult(info);

  // ✅ if the server rejected the recipient, treat as failure
  if (Array.isArray(info?.rejected) && info.rejected.length > 0) {
    const err = new Error(
      `SMTP rejected recipient(s): ${info.rejected.join(", ")}`
    );
    err.code = "SMTP_RECIPIENT_REJECTED";
    err.details = {
      rejected: info.rejected,
      accepted: info.accepted,
      response: info.response,
      envelope: info.envelope,
      messageId: info.messageId,
    };
    throw err;
  }

  const messageId =
    info && typeof info.messageId === "string" ? info.messageId : null;

  return {
    ok: true,
    mode: transport.mode,
    messageId,
    accepted: info?.accepted,
    response: info?.response,
  };
}

module.exports = { dispatchMail };
