const Setting = require("../models/Setting");
const { createLog } = require("../utils/createLog");

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
      s[k] = { ...s[k].toObject(), ...payload[k] };
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

module.exports = { getSettings, updateSettings };
