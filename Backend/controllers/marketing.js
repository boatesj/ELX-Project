const Subscriber = require("../models/Subscriber");
const postmark = require("postmark");

const client = new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN);

// -----------------------------------------------
// POST /api/v1/marketing/subscribers
// Add a new subscriber (from quote form or manual)
// -----------------------------------------------
exports.addSubscriber = async (req, res) => {
  try {
    const { email, name, phone, source, tags } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    // Check if already subscribed
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      // If they unsubscribed before, re-subscribe them
      if (existing.unsubscribed) {
        existing.unsubscribed = false;
        existing.unsubscribedAt = null;
        existing.optedIn = true;
        existing.optedInAt = new Date();
        await existing.save();
        return res.status(200).json({ message: "Re-subscribed successfully.", subscriber: existing });
      }
      return res.status(200).json({ message: "Already subscribed.", subscriber: existing });
    }

    const subscriber = await Subscriber.create({
      email,
      name: name || "",
      phone: phone || "",
      source: source || "manual",
      tags: tags || ["general"],
      optedIn: true,
      optedInAt: new Date(),
    });

    return res.status(201).json({ message: "Subscribed successfully.", subscriber });
  } catch (err) {
    console.error("addSubscriber error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

// -----------------------------------------------
// GET /api/v1/marketing/subscribers
// List all subscribers (admin only)
// -----------------------------------------------
exports.getSubscribers = async (req, res) => {
  try {
    const { tag, unsubscribed } = req.query;

    const filter = {};
    if (tag) filter.tags = tag;
    if (unsubscribed === "true") filter.unsubscribed = true;
    else filter.unsubscribed = false;

    const subscribers = await Subscriber.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({ count: subscribers.length, subscribers });
  } catch (err) {
    console.error("getSubscribers error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

// -----------------------------------------------
// DELETE /api/v1/marketing/subscribers/:id
// Unsubscribe (soft delete — keeps record for GDPR)
// -----------------------------------------------
exports.unsubscribe = async (req, res) => {
  try {
    const subscriber = await Subscriber.findById(req.params.id);
    if (!subscriber) {
      return res.status(404).json({ message: "Subscriber not found." });
    }

    subscriber.unsubscribed = true;
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();

    return res.status(200).json({ message: "Unsubscribed successfully." });
  } catch (err) {
    console.error("unsubscribe error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

// -----------------------------------------------
// POST /api/v1/marketing/campaigns/send
// Send a campaign to all active subscribers (admin only)
// -----------------------------------------------
exports.sendCampaign = async (req, res) => {
  try {
    const { subject, htmlBody, tags } = req.body;

    if (!subject || !htmlBody) {
      return res.status(400).json({ message: "Subject and htmlBody are required." });
    }

    // Build recipient list — active, opted-in subscribers
    const filter = { unsubscribed: false, optedIn: true };
    if (tags && tags.length) filter.tags = { $in: tags };

    const subscribers = await Subscriber.find(filter);

    if (!subscribers.length) {
      return res.status(400).json({ message: "No active subscribers found for this campaign." });
    }

    // Send individually so each can have a personalised unsubscribe link
    const results = await Promise.allSettled(
      subscribers.map((sub) =>
        client.sendEmail({
          From: process.env.EMAIL_FROM,
          To: sub.email,
          Subject: subject,
          HtmlBody: htmlBody.replace("{{name}}", sub.name || "there"),
          ReplyTo: process.env.EMAIL_REPLY_TO,
          MessageStream: "broadcast",
        })
      )
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return res.status(200).json({
      message: `Campaign sent. ${sent} delivered, ${failed} failed.`,
      sent,
      failed,
    });
  } catch (err) {
    console.error("sendCampaign error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};
