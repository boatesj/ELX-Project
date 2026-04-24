/**
 * DripSequenceEmail.js
 * Called every minute by the cron in index.js.
 *
 * What it does:
 *   1. Finds every Campaign that has dripEnabled: true
 *   2. Checks whether NOW is inside the Day-3 or Day-7 window (±12 h tolerance)
 *   3. Finds recipients who have NOT opened AND have not already received that touch
 *   4. Sends the follow-up email via dispatchMail (same helper every other job uses)
 *   5. Saves touch2Sent / touch3Sent flags so we never double-send
 */

const dotenv   = require("dotenv");
const Campaign = require("../models/Campaign");
const { dispatchMail } = require("../helpers/sendmail");

dotenv.config();

// ─── Window helper ────────────────────────────────────────────────────────────
// Returns true if right now is within ±12 hours of (sentAt + targetDays).
// Cron runs every minute but this ensures we only fire ONCE per window.

const DAY_MS       = 24 * 60 * 60 * 1000;
const TOLERANCE_MS = 12 * 60 * 60 * 1000;

function isInWindow(sentAt, targetDays) {
  const now    = Date.now();
  const target = new Date(sentAt).getTime() + targetDays * DAY_MS;
  return Math.abs(now - target) <= TOLERANCE_MS;
}

// ─── Touch 2 — Day 3 — "In case you missed this" ─────────────────────────────

function buildTouch2Html(name) {
  const greeting = name || "there";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>In case you missed this</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
             style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#1a3c6e;padding:28px 40px;">
            <p style="margin:0;color:#fff;font-size:20px;font-weight:bold;letter-spacing:1px;">ELLCWORTH EXPRESS</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">Hi ${greeting},</p>
            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">
              I wanted to follow up in case my earlier message got buried.
            </p>
            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">
              We work with UK universities to move time-sensitive academic cargo —
              lab equipment, research materials, student kits — direct to
              <strong>Kotoka International Airport (ACC), Accra</strong>.
              Our air freight service delivers in <strong>3–5 business days</strong>
              door-to-door, with full customs clearance handled at both ends.
            </p>
            <p style="margin:0 0 28px;font-size:15px;color:#374151;line-height:1.7;">
              For procurement teams that means predictable lead times, a single
              point of contact, and documentation that satisfies university
              compliance requirements first time.
            </p>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#e8621a;border-radius:6px;">
                  <a href="https://ellcworth.com/quote?utm_source=drip&utm_medium=email&utm_campaign=air_accra&touch=2"
                     style="display:inline-block;padding:14px 28px;color:#fff;font-size:15px;font-weight:bold;text-decoration:none;">
                    Request a freight quote &rarr;
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:32px 0 0;font-size:14px;color:#6b7280;line-height:1.6;">
              If the timing isn't right, just reply and let me know — happy to
              reconnect when it suits your procurement calendar.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px 32px;">
            <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">
              Warm regards,<br/>
              <strong>The Ellcworth Express Team</strong><br/>
              <a href="https://ellcworth.com" style="color:#1a3c6e;">ellcworth.com</a>
              &nbsp;|&nbsp;Air Freight &middot; RoRo &middot; Container
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              You are receiving this because you opted in to updates from Ellcworth Express.
              <a href="https://ellcworth.com/unsubscribe?email=${encodeURIComponent(recipient.email)}" style="color:#9ca3af;">Unsubscribe</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Touch 3 — Day 7 — "Last chance — limited capacity" ──────────────────────

function buildTouch3Html(name) {
  const greeting = name || "there";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Limited capacity — final note</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
             style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#1a3c6e;padding:28px 40px;">
            <p style="margin:0;color:#fff;font-size:20px;font-weight:bold;letter-spacing:1px;">ELLCWORTH EXPRESS</p>
          </td>
        </tr>
        <tr>
          <td style="background:#fef3c7;padding:12px 40px;border-bottom:1px solid #fde68a;">
            <p style="margin:0;font-size:13px;color:#92400e;font-weight:bold;text-align:center;">
              Limited cargo space on upcoming UK to Accra flights
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">Hi ${greeting},</p>
            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">
              This is my last note on this — I do not want to clog your inbox.
            </p>
            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">
              We currently have <strong>limited air freight allocations</strong>
              on our UK to Accra routes over the next 30 days. Once those slots
              are filled, lead times extend and we cannot guarantee the 3-5 day
              window your team may be counting on.
            </p>
            <p style="margin:0 0 28px;font-size:15px;color:#374151;line-height:1.7;">
              If you are managing any upcoming shipments to Ghana — academic
              equipment, procurement goods, or project materials — now is
              the right time to lock in capacity.
            </p>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#e8621a;border-radius:6px;">
                  <a href="https://ellcworth.com/quote?utm_source=drip&utm_medium=email&utm_campaign=air_accra&touch=3"
                     style="display:inline-block;padding:14px 24px;color:#fff;font-size:15px;font-weight:bold;text-decoration:none;">
                    Secure my freight slot &rarr;
                  </a>
                </td>
                <td style="width:12px;"></td>
                <td style="border:2px solid #1a3c6e;border-radius:6px;">
                  <a href="mailto:info@ellcworth.com?subject=Air%20Freight%20Enquiry%20UK%20to%20Accra"
                     style="display:inline-block;padding:12px 24px;color:#1a3c6e;font-size:15px;font-weight:bold;text-decoration:none;">
                    Email us directly
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:32px 0 0;font-size:14px;color:#6b7280;line-height:1.6;">
              After this I will not follow up again — but if air freight to West
              Africa ever comes up down the line, I would love to be your first call.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px 32px;">
            <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">
              Best,<br/>
              <strong>The Ellcworth Express Team</strong><br/>
              <a href="https://ellcworth.com" style="color:#1a3c6e;">ellcworth.com</a>
              &nbsp;|&nbsp;Air Freight &middot; RoRo &middot; Container
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              You are receiving this because you opted in to updates from Ellcworth Express.
              <a href="https://ellcworth.com/unsubscribe?email=${encodeURIComponent(recipient.email)}" style="color:#9ca3af;">Unsubscribe</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Core job ─────────────────────────────────────────────────────────────────

const DripSequenceEmail = async () => {
  try {
    // Step 1 — find every campaign with drip turned on
    const campaigns = await Campaign.find({ dripEnabled: true });

    if (!campaigns.length) {
      console.log("ℹ️  Drip: no drip-enabled campaigns found.");
      return;
    }

    for (const campaign of campaigns) {

      // Step 2 — skip if sentAt is missing
      if (!campaign.sentAt) continue;

      // Step 3 — are we in the Day 3 or Day 7 window?
      const inDay3 = isInWindow(campaign.sentAt, 3);
      const inDay7 = isInWindow(campaign.sentAt, 7);

      if (!inDay3 && !inDay7) continue;

      const touch = inDay3 ? 2 : 3;

      // Step 4 — filter to non-openers who have not had this touch yet
      const targets = campaign.recipients.filter((r) => {
        if (r.opened)                    return false;
        if (touch === 2 && r.touch2Sent) return false;
        if (touch === 3 && r.touch3Sent) return false;
        return true;
      });

      if (!targets.length) {
        console.log("ℹ️  Drip [" + campaign.subject + "] Touch " + touch + ": no eligible recipients.");
        continue;
      }

      console.log("📨 Drip [" + campaign.subject + "] Touch " + touch + ": sending to " + targets.length + " non-opener(s)...");

      // Step 5 — send one by one (a single failure must not kill the loop)
      for (const recipient of targets) {
        try {
          const html = touch === 2
            ? buildTouch2Html((recipient.name || "").split(" ")[0] || "there")
            : buildTouch3Html((recipient.name || "").split(" ")[0] || "there");

          const subject = touch === 2
            ? "In case you missed this — Air Freight UK to Accra"
            : "Last chance — limited capacity on UK to Accra flights";

          await dispatchMail({ to: recipient.email, subject, html });

          // Step 6 — flag this touch as sent so we never resend
          if (touch === 2) recipient.touch2Sent = true;
          if (touch === 3) recipient.touch3Sent = true;

          console.log("  ✅ Touch " + touch + " sent to " + recipient.email);

        } catch (err) {
          console.error("  ❌ Touch " + touch + " failed for " + recipient.email + ": " + err.message);
        }
      }

      // Step 7 — persist all flags at once
      await campaign.save();
      console.log("💾 Campaign [" + campaign.subject + "] saved after Touch " + touch + " run.");
    }

  } catch (err) {
    console.error("❌ DripSequenceEmail error:", err);
  }
};

module.exports = { DripSequenceEmail };
