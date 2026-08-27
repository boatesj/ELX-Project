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
  const contextLine = context
    ? `Your recent shipment (${context}) has now been completed.`
    : "Your recent shipment with us has now been completed.";

  const text = [
    greeting,
    "",
    `${contextLine} We don't take it for granted that you trusted us with this, and we'd value two minutes of your time to tell us how we did — it directly shapes how we serve customers like you going forward.`,
    "",
    `Share your experience: ${link}`,
    "",
    "With thanks,",
    "Jake Boateng",
    BRAND.name,
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;color:${BRAND.navy};line-height:1.6;max-width:560px;">
      <p>${greeting}</p>
      <p>${contextLine} We don't take it for granted that you trusted us with this, and we'd value two minutes of your time to tell us how we did &mdash; it directly shapes how we serve customers like you going forward.</p>
      <p style="margin:28px 0;">
        <a href="${link}" style="background:${BRAND.navy};color:${BRAND.accent};padding:12px 24px;border-radius:4px;text-decoration:none;font-weight:bold;display:inline-block;">
          Share your experience
        </a>
      </p>
      <p>With thanks,<br/>Jake Boateng<br/>${BRAND.name}</p>
    </div>
  `;

  return { subject: "Thank you — your shipment has been delivered", text, html };
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

    res.status(201).json({ id: feedback._id, token: feedback.token });
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
    res.status(200).json(all);
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
