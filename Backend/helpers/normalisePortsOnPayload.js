// Backend/helpers/normalisePortsOnPayload.js
import Port from "../models/Port.js";

function norm(v) {
  return String(v || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

async function resolvePort({ portId, legacyText, snapCode, snapName }) {
  // 1) If an ID is provided, it MUST be valid.
  if (portId) {
    const port = await Port.findOne({ _id: portId, isActive: true }).lean();
    if (!port) {
      const err = new Error("Invalid or inactive portId provided.");
      err.statusCode = 400;
      throw err;
    }
    return port;
  }

  // 2) Otherwise try to match by snapshot code/name, then legacy text.
  const candidates = [snapCode, snapName, legacyText].filter(Boolean).map(norm);

  if (!candidates.length) return null;

  // Try by code first (fast + precise)
  for (const c of candidates) {
    const byCode = await Port.findOne({
      isActive: true,
      code: {
        $regex: `^${c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i",
      },
    }).lean();
    if (byCode) return byCode;
  }

  // Then try by name (a bit fuzzier)
  for (const c of candidates) {
    const byName = await Port.findOne({
      isActive: true,
      name: { $regex: c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" },
    }).lean();
    if (byName) return byName;
  }

  return null;
}

/**
 * Normalises ports on an incoming shipment payload BEFORE create.
 *
 * Rules:
 * - Port model is source of truth
 * - IDs + snapshot fields live in payload.ports.*
 * - legacy fields payload.originPort / payload.destinationPort remain populated for backwards compatibility
 * - If we can't resolve, we keep legacy text and leave IDs null (no crash)
 */
export async function normalisePortsOnPayload(payload) {
  if (!payload || typeof payload !== "object") return;

  // Ensure nested object exists
  payload.ports =
    payload.ports && typeof payload.ports === "object" ? payload.ports : {};

  // --- ORIGIN ---
  const originPortId =
    payload.ports.originPortId || payload.originPortId || null;

  const originLegacy =
    payload.originPort ||
    payload.ports.originPortName ||
    payload.originPortName ||
    payload.ports.originPortCode ||
    payload.originPortCode ||
    "";

  const originPort = await resolvePort({
    portId: originPortId,
    legacyText: originLegacy,
    snapCode: payload.ports.originPortCode || payload.originPortCode,
    snapName: payload.ports.originPortName || payload.originPortName,
  });

  if (originPort) {
    payload.ports.originPortId = originPort._id;

    // Canonical snapshots from Port model (source of truth)
    payload.ports.originPortCode = originPort.code || "";
    payload.ports.originPortName = originPort.name || "";
    payload.ports.originPortCountry = originPort.country || "";
    payload.ports.originPortType = originPort.type || "";

    // Legacy string stays required; keep what user sent if present, else use canonical
    payload.originPort =
      payload.originPort || originPort.name || originPort.code || "";
  } else {
    // Could not resolve: keep legacy text, leave IDs null
    payload.ports.originPortId = null;
    payload.originPort = payload.originPort || originLegacy || "";
  }

  // --- DESTINATION ---
  const destinationPortId =
    payload.ports.destinationPortId || payload.destinationPortId || null;

  const destinationLegacy =
    payload.destinationPort ||
    payload.ports.destinationPortName ||
    payload.destinationPortName ||
    payload.ports.destinationPortCode ||
    payload.destinationPortCode ||
    "";

  const destinationPort = await resolvePort({
    portId: destinationPortId,
    legacyText: destinationLegacy,
    snapCode: payload.ports.destinationPortCode || payload.destinationPortCode,
    snapName: payload.ports.destinationPortName || payload.destinationPortName,
  });

      if (originPort) {
    payload.ports.originPortId = originPort._id;

    // Canonical snapshots from Port model (source of truth)
    payload.ports.originPortCode = originPort.code || "";
    payload.ports.originPortName = originPort.name || "";
    payload.ports.originPortCountry = originPort.country || "";
    payload.ports.originPortType = originPort.type || "";

    // Top-level legacy (kept)
    payload.originPort =
      payload.originPort || originPort.name || originPort.code || "";

    // ✅ Nested legacy (schema/dashboard requires this)
    payload.ports.originPort =
      payload.ports.originPort || originPort.name || originPort.code || "";
  } else {
    // Could not resolve: keep legacy text, leave IDs null
    payload.ports.originPortId = null;

    // Top-level legacy (kept)
    payload.originPort = payload.originPort || originLegacy || "";

    // ✅ Nested legacy (schema/dashboard requires this)
    payload.ports.originPort =
      payload.ports.originPort || payload.originPort || "";
  }


