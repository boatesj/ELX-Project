// Backend/controllers/feedback.js
const Feedback = require("../models/Feedback");
const QuickLog = require("../models/QuickLog");
const { dispatchMail } = require("../utils/dispatchMail");
const { createLog } = require("../utils/createLog");

// Same palette as controllers/shipment.js BRAND constant — keep in sync if
// brand colours change.
const BRAND = {
  name: "Ellcworth Express",
  navy: "#1A2930",
  accent: "#FFA500",
};

// Public-facing origin the feedback link points at. CLIENT_URL is the
// existing env var used for CORS against the customer frontend, so it's
// already correct in every environment (localhost in dev, ellcworth.com
// in production) without adding a new var.
function siteUrl() {
  return (process.env.CLIENT_URL || "https://www.ellcworth.com").replace(/\/$/, "");
}

function buildFeedbackEmail({ clientName, context, token }) {
  const link = `${siteUrl()}/feedback/${token}`;
  const greeting = clientName ? `Dear ${clientName},` : "Dear valued customer,";

  const openingText = context
    ? `Your shipment — ${context} — has completed its journey from the UK to West Africa. The export documentation, customs clearance, and last-mile coordination on this corridor takes genuine expertise to get right. We have been doing exactly this for 15 years, and we are proud we delivered it for you.`
    : `Your shipment has completed its journey from the UK to West Africa. What looks straightforward from the outside — export paperwork, port clearance, last-mile delivery — takes 15 years of corridor knowledge to execute without incident. We are glad we got it right for you.`;

  const openingHtml = context
    ? `Your shipment &mdash; <strong>${context}</strong> &mdash; has completed its journey from the UK to West Africa. The export documentation, customs clearance, and last-mile coordination on this corridor takes genuine expertise to get right. We&rsquo;ve been doing exactly this for 15 years, and we&rsquo;re proud we delivered it for you.`
    : `Your shipment has completed its journey from the UK to West Africa. What looks straightforward from the outside &mdash; export paperwork, port clearance, last-mile delivery &mdash; takes 15 years of corridor knowledge to execute without incident. We&rsquo;re glad we got it right for you.`;

  const text = [
    greeting,
    "",
    openingText,
    "",
    "We would value two minutes of your honest feedback. Not a long form, not a tick-box exercise — just three questions from us to you. Your words go directly to our team, and they shape how we handle the next shipment on this corridor.",
    "",
    "Three questions. Two minutes. Completely honest.",
    "",
    `Leave your feedback here: ${link}`,
    "",
    "Best regards,",
    "The Ellcworth Express Team",
    "cs@ellcworth.com · +44 (0)208 979 6054",
    "",
    "P.S. Something felt off? Reply directly to this email. We personally review every response — and we would rather hear it from you than not at all.",
  ].join("\n");

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
        <tr><td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">

            <!-- Header -->
            <tr>
              <td style="background:#1A2930;padding:32px 40px 24px;text-align:center;border-radius:16px 16px 0 0;">
                <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#6b7280;font-weight:600;">Ellcworth Express Ltd</p>
                <div style="width:40px;height:2px;background:#FFA500;margin:0 auto 12px;border-radius:2px;"></div>
                <p style="margin:0;font-size:12px;color:#FFA500;letter-spacing:0.08em;text-transform:uppercase;font-weight:600;">UK · West Africa Freight</p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="background:#ffffff;padding:40px 40px 32px;">
                <p style="margin:0 0 20px;font-size:15px;color:#1A2930;line-height:1.7;">${greeting}</p>
                <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">${openingHtml}</p>
                <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7;">We&rsquo;d value two minutes of your honest feedback. Not a long form, not a tick-box exercise &mdash; just three questions from us to you. Your words go directly to our team, and they shape how we handle the next shipment on this corridor.</p>
                <p style="margin:0 0 32px;font-size:14px;color:#6b7280;font-style:italic;">Three questions. Two minutes. Completely honest.</p>

                <!-- CTA Button -->
                <table cellpadding="0" cellspacing="0" style="margin:0 auto 36px;">
                  <tr>
                    <td style="background:#FFA500;border-radius:50px;">
                      <a href="${link}" style="display:inline-block;padding:16px 40px;color:#1A2930;font-size:14px;font-weight:700;text-decoration:none;letter-spacing:0.08em;text-transform:uppercase;white-space:nowrap;">
                        Tell us what you think &rarr;
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 8px;font-size:14px;color:#374151;line-height:1.7;">Best regards,<br/><strong>The Ellcworth Express Team</strong><br/><span style="color:#6b7280;font-size:13px;">cs@ellcworth.com &nbsp;&middot;&nbsp; +44 (0)208 979 6054</span></p>
              </td>
            </tr>

            <!-- PS -->
            <tr>
              <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
                <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.7;"><strong style="color:#1A2930;">P.S.</strong> Something felt off? Reply directly to this email. We personally review every response &mdash; and we&rsquo;d rather hear it from you than not at all.</p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#1A2930;padding:20px 40px;text-align:center;border-radius:0 0 16px 16px;">
                <p style="margin:0;font-size:11px;color:#6b7280;">&copy; ${new Date().getFullYear()} Ellcworth Express Ltd &nbsp;&middot;&nbsp; <a href="https://www.ellcworth.com" style="color:#6b7280;text-decoration:none;">ellcworth.com</a></p>
              </td>
            </tr>

          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;

  return { subject: "Your shipment is home — how did we do?", text, html };
}

/**
 * @route   POST /api/v1/feedback/request
 * @desc    Create a feedback request from any of three sources
 *          (shipment / quicklog / manual) and email the link.
 * @access  Admin
 */
exports.requestFeedback = async (req, res) => {
  try {
    const {
      source,
      shipmentId,
      quickLogId,
      clientName,
      clientTitle,
      organisation,
      email,
      context,
    } = req.body;

    if (["shipment", "quicklog", "manual"].includes(source) === false) {
      return res.status(400).json({ message: "Invalid source" });
    }
    if (!clientName || !organisation || !email) {
      return res.status(400).json({ message: "clientName, organisation and email are required" });
    }

    const feedback = await Feedback.create({
      source,
      shipmentId: shipmentId || null,
      quickLogId: quickLogId || null,
      clientName,
      clientTitle: clientTitle || "",
      organisation,
      email,
      context: context || "",
      createdBy: req?.user?.id || "admin",
    });

    const { subject, text, html } = buildFeedbackEmail({ clientName, context, token: feedback.token });
    await dispatchMail({ to: email, subject, text, html });

    if (source === "quicklog" && quickLogId) {
      await QuickLog.findByIdAndUpdate(quickLogId, {
        feedbackRequested: true,
        feedbackId: feedback._id,
      });
    }

    await createLog(req, {
      type: "feedback",
      action: `Requested feedback from ${clientName} (${organisation})`,
      ref: String(feedback._id),
    });

    res.status(201).json({
      id: feedback._id,
      token: feedback.token,
      link: `${siteUrl()}/feedback/${feedback.token}`,
    });
  } catch (err) {
    console.error("requestFeedback error:", err);
    res.status(500).json({ message: "Could not send feedback request", error: err.message });
  }
};

/**
 * @route   GET /api/v1/feedback/:token
 * @desc    Load survey context for the public page. Token is the auth.
 * @access  Public
 */
exports.getFeedbackByToken = async (req, res) => {
  try {
    const feedback = await Feedback.findOne({ token: req.params.token });
    if (!feedback) return res.status(404).json({ message: "Not found" });
    if (feedback.status !== "pending") {
      return res.status(410).json({ message: "This feedback link has already been used" });
    }
    res.status(200).json({
      clientName: feedback.clientName,
      organisation: feedback.organisation,
      context: feedback.context,
    });
  } catch (err) {
    console.error("getFeedbackByToken error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

/**
 * @route   POST /api/v1/feedback/:token/submit
 * @desc    Public survey submission.
 * @access  Public
 */
exports.submitFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findOne({ token: req.params.token });
    if (!feedback) return res.status(404).json({ message: "Not found" });
    if (feedback.status !== "pending") {
      return res.status(410).json({ message: "This feedback link has already been used" });
    }

    const { rating, communication, timeliness, wouldRecommend, recommendReason, improvementNote } = req.body;

    feedback.rating = rating;
    feedback.answers = {
      communication,
      timeliness,
      wouldRecommend,
      recommendReason: recommendReason || "",
      improvementNote: improvementNote || "",
    };
    feedback.displayQuote = recommendReason || "";
    feedback.displayName = `${feedback.clientTitle ? feedback.clientTitle + ", " : ""}${feedback.organisation}`;
    feedback.status = "submitted";
    feedback.respondedAt = new Date();
    await feedback.save();

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("submitFeedback error:", err);
    res.status(500).json({ message: "Could not submit feedback" });
  }
};

/**
 * @route   GET /api/v1/feedback?public=true
 * @desc    Public: approved + isPublic testimonials for the homepage.
 *          Without ?public=true: full list for the Admin Testimonials tab.
 * @access  Public (filtered) / Admin (full list)
 */
exports.listFeedback = async (req, res) => {
  try {
    if (req.query.public === "true") {
      const testimonials = await Feedback.find({ isPublic: true, status: "approved" })
        .sort({ respondedAt: -1 })
        .select("displayName displayQuote rating organisation respondedAt")
        .lean();
      return res.status(200).json(testimonials);
    }

    const all = await Feedback.find().sort({ createdAt: -1 }).lean();
    const withLinks = all.map((f) => ({ ...f, link: `${siteUrl()}/feedback/${f.token}` }));
    res.status(200).json(withLinks);
  } catch (err) {
    console.error("listFeedback error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

/**
 * @route   PATCH /api/v1/feedback/:id/approve
 * @access  Admin
 */
exports.approveFeedback = async (req, res) => {
  try {
    const { displayName, displayQuote, isPublic } = req.body;
    const update = { status: "approved" };
    if (displayName !== undefined) update.displayName = displayName;
    if (displayQuote !== undefined) update.displayQuote = displayQuote;
    if (isPublic !== undefined) update.isPublic = isPublic;

    const feedback = await Feedback.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!feedback) return res.status(404).json({ message: "Not found" });

    await createLog(req, {
      type: "feedback",
      action: `Approved feedback from ${feedback.clientName} (${feedback.organisation})`,
      ref: String(feedback._id),
    });

    res.status(200).json(feedback);
  } catch (err) {
    console.error("approveFeedback error:", err);
    res.status(500).json({ message: "Could not update feedback" });
  }
};

/**
 * @route   PATCH /api/v1/feedback/:id/reject
 * @access  Admin
 */
exports.rejectFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status: "rejected", isPublic: false },
      { new: true },
    );
    if (!feedback) return res.status(404).json({ message: "Not found" });
    res.status(200).json(feedback);
  } catch (err) {
    console.error("rejectFeedback error:", err);
    res.status(500).json({ message: "Could not update feedback" });
  }
};

/**
 * @route   DELETE /api/v1/feedback/:id
 * @desc    Hard delete — for test entries or requests sent in error.
 *          Rejecting (above) is for real feedback you don't want public;
 *          this is for removing the record entirely.
 * @access  Admin
 */
exports.deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    await Feedback.findByIdAndDelete(id);
    return res.status(200).json({ message: "Feedback request deleted." });
  } catch (err) {
    console.error("deleteFeedback error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};
