const Log = require("../models/Log");

async function createLog(req, { type, action, ref = "", meta = {} }) {
  const actorId = req?.user?.id ? String(req.user.id) : "";
  return Log.create({ type, actorId, action, ref, meta });
}

module.exports = { createLog };
