const Prospect = require("../models/Prospect");
const User = require("../models/User");
const crypto = require("crypto");

const SECTOR_LABELS = {
  secure_print:              "Sector 1 — Secure Print",
  lab_equipment:             "Sector 2 — Lab Equipment",
  it_hardware:               "Sector 3 — IT Hardware",
  vehicle_exporters:         "Sector 4 — Vehicle Exporters",
  charities_ngos:            "Sector 5 — Charities & NGOs",
  commercial_vendors:        "Sector 6 — Commercial Vendors",
  uk_universities:           "Sector 7 — UK Universities",
  ghana_public_universities: "Sector 8 — Ghana Public Universities",
  ghana_private_universities:"Sector 9 — Ghana Private Universities",
  ghana_health:              "Sector 10 — Ghana Health",
  mining:                    "Sector 11 — Mining",
  automotive_importers:      "Sector 12 — Automotive Importers",
  ghanaian_smes:             "Sector 13 — Ghanaian SMEs",
  ghana_ngos:                "Sector 14 — Ghana NGOs",
};

// GET /api/v1/marketing/prospects
exports.getProspects = async (req, res) => {
  try {
    const { sector, stage, due } = req.query;
    const filter = {};
    if (sector) filter.sector = sector;
    if (stage)  filter.stage  = stage;
    if (due === "today") {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      filter.nextActionDate = { $lte: today };
      filter.stage = { $nin: ["converted", "dead"] };
    }
    const prospects = await Prospect.find(filter).sort({ nextActionDate: 1, createdAt: -1 });
    return res.status(200).json({ prospects });
  } catch (err) {
    console.error("getProspects error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

// POST /api/v1/marketing/prospects
exports.createProspect = async (req, res) => {
  try {
    const { name, email, phone, company, sector, channel, nextActionDate, nextActionNote } = req.body;
    if (!name || !sector) return res.status(400).json({ message: "Name and sector are required." });
    const prospect = await Prospect.create({
      name, email, phone, company, sector, channel,
      nextActionDate: nextActionDate || null,
      nextActionNote: nextActionNote || "",
      playbookDay: 0,
      stage: "cold",
    });
    return res.status(201).json({ message: "Prospect created.", prospect });
  } catch (err) {
    console.error("createProspect error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

// PATCH /api/v1/marketing/prospects/:id
exports.updateProspect = async (req, res) => {
  try {
    const { id } = req.params;
    const { stage, playbookDay, nextActionDate, nextActionNote, caseStudySent, note, convertedAt } = req.body;

    const prospect = await Prospect.findById(id);
    if (!prospect) return res.status(404).json({ message: "Prospect not found." });

    if (stage !== undefined)          prospect.stage          = stage;
    if (playbookDay !== undefined)    prospect.playbookDay    = playbookDay;
    if (nextActionDate !== undefined) prospect.nextActionDate = nextActionDate || null;
    if (nextActionNote !== undefined) prospect.nextActionNote = nextActionNote;
    if (convertedAt !== undefined)    prospect.convertedAt    = convertedAt || null;

    if (caseStudySent?.name) {
      prospect.caseStudySent = { name: caseStudySent.name, sentAt: new Date() };
    }

    if (note?.trim()) {
      prospect.notes.push({ text: note.trim(), createdAt: new Date() });
    }

    await prospect.save();
    return res.status(200).json({ message: "Prospect updated.", prospect });
  } catch (err) {
    console.error("updateProspect error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

// DELETE /api/v1/marketing/prospects/:id
exports.deleteProspect = async (req, res) => {
  try {
    const { id } = req.params;
    await Prospect.findByIdAndDelete(id);
    return res.status(200).json({ message: "Prospect deleted." });
  } catch (err) {
    console.error("deleteProspect error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

// POST /api/v1/marketing/prospects/:id/convert
exports.convertProspect = async (req, res) => {
  try {
    const { id } = req.params;

    const prospect = await Prospect.findById(id);
    if (!prospect) return res.status(404).json({ message: "Prospect not found." });
    if (prospect.stage === "converted") {
      return res.status(400).json({ message: "Prospect already converted." });
    }
    if (!prospect.email) {
      return res.status(400).json({ message: "Prospect has no email address — cannot create account." });
    }


    const existing = await User.findOne({ email: prospect.email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "A user account with this email already exists.", userId: existing._id });
    }

    // Create the user account — password placeholder, status pending until they set it
    const user = await User.create({
      fullname: prospect.name,
      email: prospect.email.toLowerCase(),
      company: prospect.company || "",
      phone: prospect.phone || "",
      role: "Shipper",
      status: "pending",
      password: crypto.randomBytes(32).toString("hex"), // unusable until reset
      country: "United Kingdom",
      address: prospect.address || "To be updated",
    });

    // Welcome email handled by BackgroundServices/EmailService/WelcomeEmail.js
    // It polls for { welcomeMailSent: false, status: "pending" } and sends the branded template

    // Mark prospect as converted
    prospect.stage = "converted";
    prospect.convertedAt = new Date();
    prospect.notes.push({ text: `Converted to customer account. User ID: ${user._id}`, createdAt: new Date() });
    await prospect.save();

    return res.status(201).json({
      message: "Prospect converted. Welcome email sent.",
      userId: user._id,
      email: user.email,
    });
  } catch (err) {
    console.error("convertProspect error:", err);
    return res.status(500).json({ message: "Server error.", error: err.message });
  }
};
