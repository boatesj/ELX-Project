const Log = require("../models/Log");

async function listLogs(req, res) {
  const q = String(req.query.q || "").trim();
  const type = String(req.query.type || "all").trim();
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const limit = Math.min(
    Math.max(parseInt(req.query.limit || "20", 10), 5),
    100
  );

  const filter = {};
  if (type !== "all") filter.type = type;

  if (q) {
    filter.$or = [
      { action: { $regex: q, $options: "i" } },
      { ref: { $regex: q, $options: "i" } },
      { actorId: { $regex: q, $options: "i" } },
      { type: { $regex: q, $options: "i" } },
    ];
  }

  const total = await Log.countDocuments(filter);
  const items = await Log.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return res.json({ items, total, page, limit });
}

module.exports = { listLogs };
