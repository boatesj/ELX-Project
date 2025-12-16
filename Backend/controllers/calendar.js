const CalendarEvent = require("../models/CalendarEvent");
const { createLog } = require("../utils/createLog");

async function listEvents(req, res) {
  const from = String(req.query.from || "0000-01-01");
  const to = String(req.query.to || "9999-12-31");

  const items = await CalendarEvent.find({
    date: { $gte: from, $lte: to },
  }).sort({ date: 1, time: 1 });

  return res.json(items);
}

async function createEvent(req, res) {
  const body = req.body || {};
  const title = String(body.title || "").trim();
  const date = String(body.date || "").trim();
  const time = String(body.time || "").trim();
  const tag = String(body.tag || "Operations").trim();
  const meta = String(body.meta || "").trim();
  const shipmentId = body.shipmentId || null;

  if (!title || !date)
    return res.status(400).json({ message: "title and date are required" });

  const createdBy = req.user?.id || null;

  const event = await CalendarEvent.create({
    title,
    date,
    time,
    tag,
    meta,
    shipmentId,
    createdBy,
  });

  await createLog(req, {
    type: "calendar",
    action: "Created calendar event",
    ref: title,
  });
  return res.status(201).json(event);
}

// placeholder — later map to Shipment ETD/ETA
async function syncFromShipments(req, res) {
  await createLog(req, {
    type: "calendar",
    action: "Synced calendar from shipments (placeholder)",
    ref: "sync",
  });
  return res.json({
    ok: true,
    message:
      "Sync placeholder. Next: connect to Shipment fields (ETD/ETA/cutoff).",
  });
}

module.exports = { listEvents, createEvent, syncFromShipments };
