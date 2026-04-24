const Subscriber = require("../models/Subscriber");
const Campaign   = require("../models/Campaign");
const postmark = require("postmark");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

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

    const filter = { unsubscribed: false, optedIn: true };
    if (tags && tags.length) filter.tags = { $in: tags };
    const subscribers = await Subscriber.find(filter);

    if (!subscribers.length) {
      return res.status(400).json({ message: "No active subscribers found for this campaign." });
    }

    // Send individually with open tracking enabled
    const results = await Promise.allSettled(
      subscribers.map((sub) =>
        client.sendEmail({
          From:          process.env.EMAIL_FROM,
          To:            sub.email,
          Subject:       subject,
          HtmlBody:      htmlBody.split("{{name}}").join(sub.name || "there"),
          ReplyTo:       process.env.EMAIL_REPLY_TO,
          MessageStream: "broadcast",
          TrackOpens:    true,
        })
      )
    );

    const sent   = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    // Build recipient records with Postmark MessageIDs
    const recipients = subscribers.map((sub, i) => {
      const r = results[i];
      return {
        subscriberId: sub._id,
        email:        sub.email,
        name:         sub.name || "",
        messageId:    r.status === "fulfilled" ? (r.value?.MessageID || "") : "",
        opened:       false,
        openedAt:     null,
        openCount:    0,
      };
    });

    // Save campaign record
    const campaign = await Campaign.create({
      subject,
      tags:      tags || [],
      sentCount: sent,
      failCount: failed,
      openCount: 0,
      recipients,
      dripEnabled: req.body.dripEnabled || false,
      sentAt:      new Date(),
    });

    return res.status(200).json({
      message: `Campaign sent. ${sent} delivered, ${failed} failed.`,
      sent,
      failed,
      campaignId: campaign._id,
    });
  } catch (err) {
    console.error("sendCampaign error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};



// -----------------------------------------------
// GET /api/v1/marketing/campaigns
// List all campaigns with open stats (admin only)
// -----------------------------------------------
exports.getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find()
      .select("-recipients")
      .sort({ createdAt: -1 });
    return res.status(200).json({ campaigns });
  } catch (err) {
    console.error("getCampaigns error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

// -----------------------------------------------
// GET /api/v1/marketing/campaigns/:id
// Get single campaign with full recipient list
// -----------------------------------------------
exports.getCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: "Campaign not found." });
    return res.status(200).json({ campaign });
  } catch (err) {
    console.error("getCampaign error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

// -----------------------------------------------
// POST /api/v1/marketing/webhooks/postmark
// Postmark open tracking webhook — no auth
// -----------------------------------------------
exports.postmarkWebhook = async (req, res) => {
  try {
    const { RecordType, MessageID } = req.body;
    if (RecordType !== "Open" || !MessageID) {
      return res.status(200).json({ ok: true });
    }
    const campaign = await Campaign.findOne({ "recipients.messageId": MessageID });
    if (!campaign) return res.status(200).json({ ok: true });

    const recipient = campaign.recipients.find((r) => r.messageId === MessageID);
    if (!recipient) return res.status(200).json({ ok: true });

    recipient.openCount += 1;
    if (!recipient.opened) {
      recipient.opened   = true;
      recipient.openedAt = new Date();
      campaign.openCount += 1;
    }
    await campaign.save();
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("postmarkWebhook error:", err);
    return res.status(200).json({ ok: true });
  }
};

// -----------------------------------------------
// POST /api/v1/marketing/upload-image
// Upload a campaign image to Cloudinary (admin only)
// -----------------------------------------------
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file provided." });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "ellcworth/marketing",
          resource_type: "image",
          transformation: [{ width: 600, crop: "limit", quality: "auto" }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });

    return res.status(200).json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (err) {
    console.error("uploadImage error:", err);
    return res.status(500).json({ message: "Image upload failed." });
  }
};

// -----------------------------------------------
// GET /api/v1/marketing/unsubscribe?email=...
// Public one-click unsubscribe — no auth required
// -----------------------------------------------
exports.publicUnsubscribe = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const subscriber = await Subscriber.findOne({ email: email.toLowerCase().trim() });

    if (!subscriber) {
      // Return success anyway — don't reveal whether email exists (GDPR)
      return res.status(200).json({ message: "Unsubscribed successfully." });
    }

    if (subscriber.unsubscribed) {
      return res.status(200).json({ message: "Already unsubscribed." });
    }

    subscriber.unsubscribed    = true;
    subscriber.unsubscribedAt  = new Date();
    await subscriber.save();

    console.log(`✅ Public unsubscribe: ${email}`);
    return res.status(200).json({ message: "Unsubscribed successfully." });
  } catch (err) {
    console.error("publicUnsubscribe error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};
