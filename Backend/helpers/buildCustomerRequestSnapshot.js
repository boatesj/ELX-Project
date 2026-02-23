// Backend/helpers/buildCustomerRequestSnapshot.js

function cleanStr(v) {
  return String(v ?? "").trim();
}

function firstNonEmpty(...vals) {
  for (const v of vals) {
    const s = cleanStr(v);
    if (s) return s;
  }
  return "";
}

/**
 * Build immutable "customer requested" snapshot
 * Priority:
 *  1) meta.intake
 *  2) shipper/consignee
 *  3) ports + addresses
 *  4) cargo basics
 */
function buildCustomerRequestSnapshot(shipmentDoc) {
  const s = shipmentDoc?.toObject ? shipmentDoc.toObject() : shipmentDoc;
  if (!s) return null;

  const intake = s?.meta?.intake || {};

  const origin = firstNonEmpty(
    intake?.origin,
    s?.originAddress,
    s?.ports?.originPort,
    s?.shipper?.address,
  );

  const destination = firstNonEmpty(
    intake?.destination,
    s?.destinationAddress,
    s?.ports?.destinationPort,
    s?.consignee?.address,
  );

  const cargoSummary = firstNonEmpty(
    intake?.cargoSummary,
    s?.cargo?.description,
    s?.goodsDescription,
  );

  const cargoWeightKg = firstNonEmpty(
    intake?.cargoWeightKg,
    s?.cargo?.weight,
    s?.weightKg,
  );

  const readyDate = firstNonEmpty(
    intake?.readyDate,
    s?.pickupDate,
    s?.shippingDate,
  );

  const notes = firstNonEmpty(intake?.notes, s?.customerNotes, s?.notes);

  return {
    source: cleanStr(s?.meta?.source || "unknown") || "unknown",
    createdAtClient: s?.meta?.createdAtClient || null,

    origin,
    destination,

    shipper: {
      name: cleanStr(s?.shipper?.name),
      address: cleanStr(s?.shipper?.address),
      phone: cleanStr(s?.shipper?.phone),
      email: cleanStr(s?.shipper?.email),
    },

    consignee: {
      name: cleanStr(s?.consignee?.name),
      address: cleanStr(s?.consignee?.address),
      phone: cleanStr(s?.consignee?.phone),
      email: cleanStr(s?.consignee?.email),
    },

    cargo: {
      summary: cargoSummary,
      weight: cargoWeightKg,
      packageCount: s?.cargo?.packageCount ?? null,
      packagingType:
        (Array.isArray(s?.cargo?.packages) && s.cargo.packages[0]?.type) || "",
    },

    dates: {
      readyDate,
    },

    notes,
  };
}

module.exports = buildCustomerRequestSnapshot;
