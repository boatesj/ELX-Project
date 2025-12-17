const CalendarEvent = require("../models/CalendarEvent");
const Shipment = require("../models/Shipment");
const { createLog } = require("../utils/createLog");

// --- helpers ---
const asStr = (v, fallback = "") => String(v ?? fallback).trim();

function normLower(v, fallback) {
  const s = asStr(v, fallback);
  return s ? s.toLowerCase() : "";
}

function toYmd(d) {
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toISOString().slice(0, 10);
}

function toHm(d) {
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toISOString().slice(11, 16);
}

function parseYmdHmToDate(dateStr, timeStr) {
  const d = asStr(dateStr);
  const t = asStr(timeStr);
  if (!d) return null;
  const iso = t ? `${d}T${t}:00.000Z` : `${d}T00:00:00.000Z`;
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
}

function icsEscape(s) {
  return String(s ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function toICSDateTimeUTC(dt) {
  const yyyy = String(dt.getUTCFullYear());
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  const hh = String(dt.getUTCHours()).padStart(2, "0");
  const mi = String(dt.getUTCMinutes()).padStart(2, "0");
  const ss = String(dt.getUTCSeconds()).padStart(2, "0");
  return `${yyyy}${mm}${dd}T${hh}${mi}${ss}Z`;
}

function toICSDateValue(ymd) {
  return String(ymd || "").replaceAll("-", "");
}

function addDaysYmd(ymd, days) {
  const dt = new Date(`${ymd}T00:00:00.000Z`);
  if (Number.isNaN(dt.getTime())) return "";
  dt.setUTCDate(dt.getUTCDate() + Number(days || 0));
  return dt.toISOString().slice(0, 10);
}

async function listEvents(req, res) {
  try {
    const from = asStr(req.query.from, "0000-01-01");
    const to = asStr(req.query.to, "9999-12-31");

    const items = await CalendarEvent.find({
      date: { $gte: from, $lte: to },
    }).sort({ date: 1, time: 1 });

    return res.json(items);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to list events", error: err.message });
  }
}

async function createEvent(req, res) {
  try {
    const body = req.body || {};

    const title = asStr(body.title);
    const date = asStr(body.date);
    const tag = asStr(body.tag, "Operations");
    const meta = asStr(body.meta);

    const shipmentId = body.shipmentId || null;
    const time = asStr(body.time);

    const kind = normLower(body.kind, "event"); // event|milestone|reminder|task|holiday
    const source = normLower(body.source, shipmentId ? "shipment" : "manual"); // manual|shipment|holiday

    if (!title || !date) {
      return res.status(400).json({ message: "title and date are required" });
    }

    const createdBy = req.user?.id || null;

    const event = await CalendarEvent.create({
      title,
      date,
      time,
      tag,
      meta,
      shipmentId,
      createdBy,
      source,
      kind,
    });

    // Best-effort logging (never blocks)
    const logResult = await createLog(req, {
      type: "calendar",
      action: "Created calendar event",
      ref: event._id.toString(),
      meta: {
        title,
        date,
        time,
        tag,
        kind,
        source,
        shipmentId: shipmentId || "",
      },
    });

    return res.status(201).json({
      ...event.toObject(),
      _log: logResult?.ok ? undefined : logResult,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to create event", error: err.message });
  }
}

async function updateEvent(req, res) {
  try {
    const id = req.params.id;
    const body = req.body || {};

    const patch = {};
    if (body.title !== undefined) patch.title = asStr(body.title);
    if (body.date !== undefined) patch.date = asStr(body.date);
    if (body.time !== undefined) patch.time = asStr(body.time);
    if (body.tag !== undefined) patch.tag = asStr(body.tag, "Operations");
    if (body.meta !== undefined) patch.meta = asStr(body.meta);
    if (body.shipmentId !== undefined)
      patch.shipmentId = body.shipmentId || null;
    if (body.source !== undefined)
      patch.source = normLower(body.source, "manual");
    if (body.kind !== undefined) patch.kind = normLower(body.kind, "event");

    const updated = await CalendarEvent.findByIdAndUpdate(id, patch, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: "Event not found" });

    await createLog(req, {
      type: "calendar",
      action: "Updated calendar event",
      ref: updated._id.toString(),
      meta: { patch },
    });

    return res.json(updated);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to update event", error: err.message });
  }
}

async function deleteEvent(req, res) {
  try {
    const id = req.params.id;
    const removed = await CalendarEvent.findByIdAndDelete(id);
    if (!removed) return res.status(404).json({ message: "Event not found" });

    await createLog(req, {
      type: "calendar",
      action: "Deleted calendar event",
      ref: id,
      meta: { title: removed.title, date: removed.date, time: removed.time },
    });

    return res.json({ ok: true });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to delete event", error: err.message });
  }
}

/**
 * Sync from shipments:
 * - shippingDate => ETD milestone
 * - eta => ETA milestone
 * - auto docs-check reminder (7 days before shippingDate) if shippingDate exists
 *
 * De-dupe rule:
 * - same shipmentId + kind + title + date + time + source=shipment
 */
async function syncFromShipments(req, res) {
  try {
    const shipments = await Shipment.find({ isDeleted: false })
      .select("_id referenceNo mode ports shippingDate eta")
      .sort({ createdAt: -1 })
      .limit(500);

    let createdCount = 0;

    for (const sh of shipments) {
      const ref = sh.referenceNo || "ELX";

      const origin = sh?.ports?.originPort
        ? ` (${sh.ports.originPort} → ${sh.ports.destinationPort})`
        : "";

      const candidates = [];

      if (sh.shippingDate) {
        const d = toYmd(sh.shippingDate);
        const t = toHm(sh.shippingDate);
        if (d) {
          candidates.push({
            title: `ETD — ${ref}${origin}`,
            date: d,
            time: t,
            tag: "Sea freight",
            meta: "Auto from Shipment.shippingDate",
            shipmentId: sh._id,
            source: "shipment",
            kind: "milestone",
          });

          // Docs check reminder: 7 days before ETD
          const docsDt = new Date(
            new Date(sh.shippingDate).getTime() - 7 * 24 * 3600 * 1000
          );
          const docsD = toYmd(docsDt);
          if (docsD) {
            candidates.push({
              title: `Docs check — ${ref}`,
              date: docsD,
              time: "",
              tag: "Compliance",
              meta: "Auto reminder: verify V5C/ID/invoice/consignee details",
              shipmentId: sh._id,
              source: "shipment",
              kind: "reminder",
            });
          }
        }
      }

      if (sh.eta) {
        const d = toYmd(sh.eta);
        const t = toHm(sh.eta);
        if (d) {
          candidates.push({
            title: `ETA — ${ref}${origin}`,
            date: d,
            time: t,
            tag: "Sea freight",
            meta: "Auto from Shipment.eta",
            shipmentId: sh._id,
            source: "shipment",
            kind: "milestone",
          });
        }
      }

      for (const ev of candidates) {
        const exists = await CalendarEvent.findOne({
          shipmentId: ev.shipmentId,
          source: ev.source,
          kind: ev.kind,
          title: ev.title,
          date: ev.date,
          time: ev.time,
        });

        if (!exists) {
          await CalendarEvent.create({
            ...ev,
            createdBy: req.user?.id || null,
          });
          createdCount += 1;
        }
      }
    }

    await createLog(req, {
      type: "calendar",
      action: "Synced calendar from shipments",
      ref: "sync",
      meta: { createdCount, scanned: shipments.length },
    });

    return res.json({
      ok: true,
      createdCount,
      scanned: shipments.length,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: "Sync failed",
      error: err.message,
    });
  }
}

/**
 * Export iCal (.ics)
 * Query: ?from=YYYY-MM-DD&to=YYYY-MM-DD
 *
 * Change:
 * - kind === "reminder" OR "task" exports as ALL-DAY (VALUE=DATE, DTEND next day)
 * - others export as DATE-TIME (UTC)
 */
async function exportIcal(req, res) {
  try {
    const from = asStr(req.query.from, "0000-01-01");
    const to = asStr(req.query.to, "9999-12-31");

    const items = await CalendarEvent.find({
      date: { $gte: from, $lte: to },
    }).sort({ date: 1, time: 1 });

    const lines = [];
    lines.push("BEGIN:VCALENDAR");
    lines.push("VERSION:2.0");
    lines.push("PRODID:-//Ellcworth Express//ELX Admin Calendar//EN");
    lines.push("CALSCALE:GREGORIAN");
    lines.push("METHOD:PUBLISH");

    for (const e of items) {
      if (!e?.date) continue;

      lines.push("BEGIN:VEVENT");
      lines.push(`UID:${icsEscape(String(e._id))}@ellcworth.local`);
      lines.push(`DTSTAMP:${toICSDateTimeUTC(new Date())}`);

      const kind = String(e.kind || "").toLowerCase();
      const isAllDay = kind === "reminder" || kind === "task";

      if (isAllDay) {
        const dStart = toICSDateValue(e.date);
        const dEnd = toICSDateValue(addDaysYmd(e.date, 1));

        if (!dStart || !dEnd) {
          lines.push("END:VEVENT");
          continue;
        }

        lines.push(`DTSTART;VALUE=DATE:${dStart}`);
        lines.push(`DTEND;VALUE=DATE:${dEnd}`);
      } else {
        const dt = parseYmdHmToDate(e.date, e.time);
        if (!dt) {
          lines.push("END:VEVENT");
          continue;
        }
        lines.push(`DTSTART:${toICSDateTimeUTC(dt)}`);
      }

      lines.push(`SUMMARY:${icsEscape(e.title)}`);
      if (e.meta) lines.push(`DESCRIPTION:${icsEscape(e.meta)}`);
      lines.push("END:VEVENT");
    }

    lines.push("END:VCALENDAR");

    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="ellcworth.ics"'
    );
    return res.send(lines.join("\r\n"));
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to export iCal", error: err.message });
  }
}

/**
 * Open-source holidays feed proxy (no key)
 */
async function listHolidays(req, res) {
  try {
    const country = asStr(req.query.country, "GB").toUpperCase();
    const year = Number(req.query.year || new Date().getFullYear());
    const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`;

    const r = await fetch(url);
    if (!r.ok) {
      return res.status(502).json({
        ok: false,
        message: "Holiday provider error",
        status: r.status,
      });
    }

    const data = await r.json();

    const items = data.map((h) => ({
      _id: `holiday-${country}-${h.date}`,
      title: `Holiday — ${h.localName}`,
      date: h.date,
      time: "",
      tag: "Holiday",
      meta: h.name,
      shipmentId: null,
      createdBy: null,
      source: "holiday",
      kind: "holiday",
    }));

    return res.json({ ok: true, items });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: "Failed to fetch holidays",
      error: err.message,
    });
  }
}

module.exports = {
  listEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  syncFromShipments,
  exportIcal,
  listHolidays,
};
