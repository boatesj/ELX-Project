// Backend/utils/dispatchMail.js
const postmark = require("postmark");

function pickFromAddress(env) {
  return (
    env.EMAIL_FROM || env.SMTP_FROM || env.MAIL_FROM || env.SMTP_USER || ""
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
      `Postmark not configured. Set POSTMARK_SERVER_TOKEN and EMAIL_FROM. ${detail}`,
    );
    err.code = "POSTMARK_NOT_CONFIGURED";
    throw err;
  }
}

function logSendResult(info) {
  console.log("📨 sendMail result:", {
    messageId: info?.MessageID || info?.messageId || null,
    to: info?.To || null,
    submittedAt: info?.SubmittedAt || null,
    errorCode: info?.ErrorCode,
    message: info?.Message,
  });
}

function buildTransport() {
  const env = process.env;
  const transportMode = String(env.MAIL_TRANSPORT || "postmark").toLowerCase();

  if (transportMode === "console") {
    return {
      mode: "console",
      async sendMail(msg) {
        console.log("📧 [MAIL_TRANSPORT=console] Email would send:", {
          to: msg.to,
          from: msg.from,
          replyTo: msg.replyTo,
          subject: msg.subject,
          textPreview: (msg.text || "").slice(0, 500),
        });

        return {
          MessageID: "console-transport",
          To: msg.to,
          SubmittedAt: new Date().toISOString(),
          ErrorCode: 0,
          Message: "MAIL_TRANSPORT=console",
        };
      },
    };
  }

  requireEnv(env, ["POSTMARK_SERVER_TOKEN", "EMAIL_FROM"]);

  const client = new postmark.ServerClient(env.POSTMARK_SERVER_TOKEN);

  return {
    mode: "postmark",
    async sendMail(msg) {
      return client.sendEmail({
        From: msg.from,
        To: msg.to,
        Subject: msg.subject,
        HtmlBody: msg.html || undefined,
        TextBody: msg.text || undefined,
        ReplyTo: msg.replyTo || undefined,
      });
    },
  };
}

/**
 * dispatchMail returns a normalized payload:
 * {
 *   ok: true,
 *   mode: "postmark" | "console",
 *   messageId: string | null,
 *   response?: string
 * }
 */
async function dispatchMail({ to, subject, html, text, from, replyTo }) {
  const env = process.env;

  const resolvedFrom = String(from || pickFromAddress(env) || "").trim();
  if (!resolvedFrom) {
    throw new Error(
      "Email FROM address missing. Set EMAIL_FROM in Backend/.env or Render env.",
    );
  }

  const resolvedReplyTo = String(
    replyTo || env.EMAIL_REPLY_TO || resolvedFrom,
  ).trim();

  const transport = buildTransport();
  const msg = {
    to,
    from: resolvedFrom,
    replyTo: resolvedReplyTo,
    subject,
    text,
    html,
  };

  console.log("📬 dispatchMail attempt:", {
    mode: transport.mode,
    to,
    from: resolvedFrom,
    replyTo: resolvedReplyTo,
    subject,
  });

  const info = await transport.sendMail(msg);

  logSendResult(info);

  if (info?.ErrorCode && Number(info.ErrorCode) !== 0) {
    const err = new Error(info.Message || "Postmark send failed");
    err.code = "POSTMARK_SEND_FAILED";
    err.details = info;
    throw err;
  }

  const messageId =
    typeof info?.MessageID === "string"
      ? info.MessageID
      : typeof info?.messageId === "string"
        ? info.messageId
        : null;

  return {
    ok: true,
    mode: transport.mode,
    messageId,
    response: info?.Message || info?.response,
  };
}

module.exports = { dispatchMail };
