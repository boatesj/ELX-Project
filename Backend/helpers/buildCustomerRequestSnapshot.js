// Backend/helpers/buildCustomerRequestSnapshot.js

function s(v) {
  return String(v ?? "").trim();
}

function first(...vals) {
  for (const v of vals) {
    // allow 0 as a valid value
    if (typeof v === "number" && Number.isFinite(v)) return String(v);

    const t = String(v ?? "").trim();
    if (t) return t;
  }
  return "";
}

function n(v) {
  const num = Number(v);
  return Number.isFinite(num) ? num : null;
}

/**
 * Build immutable "customer requested" snapshot (schema-aligned)
 * Shape MUST match Shipment.js CustomerRequestSchema:
 * {
 *   capturedAt,
 *   route: { origin, destination, originPort, destinationPort },
 *   parties: { shipper: {...}, consignee: {...} },
 *   cargo: { goodsDescription, pieces, packagingType, weightKg, volumeM3, declaredValue, declaredCurrency, notes },
 *   dates: { shippingDate, eta }
 * }
 */
function buildCustomerRequestSnapshot(shipmentDoc) {
  // --------- robust pick helpers (handles flat + nested + legacy) ----------
  const pick = (obj, paths) => {
    for (const p of paths) {
      const parts = String(p).split(".");
      let cur = obj;
      for (const key of parts) cur = cur?.[key];
      if (cur !== undefined && cur !== null && cur !== "") return cur;
    }
    return undefined;
  };

  const toFiniteOrNull = (val) => {
    const num = Number(val);
    return Number.isFinite(num) ? num : null;
  };

  const parseNumberFromTextOrNull = (val) => {
    const txt = String(val ?? "").trim();
    if (!txt) return null;
    const m = txt.match(/-?\d+(\.\d+)?/);
    return m ? toFiniteOrNull(m[0]) : null;
  };

  const shipment = shipmentDoc?.toObject ? shipmentDoc.toObject() : shipmentDoc;
  if (!shipment) return null;

  // Turn address objects into a readable location string
  const addressToText = (addr) => {
    if (!addr) return "";
    if (typeof addr === "string") return s(addr);

    if (typeof addr === "object") {
      const line1 = first(
        addr.line1,
        addr.address1,
        addr.street1,
        addr.street,
        addr.addressLine1,
      );
      const city = first(addr.city, addr.town, addr.locality);
      const region = first(addr.county, addr.state, addr.province, addr.region);
      const postcode = first(addr.postcode, addr.zip, addr.zipCode);
      const country = first(addr.country, addr.countryName, addr.countryCode);

      // Prefer "City, Country" when present
      const cityCountry = [city, country].filter(Boolean).join(", ");
      if (cityCountry) return s(cityCountry);

      // Otherwise build a compact address string
      return s(
        [line1, city, region, postcode, country].filter(Boolean).join(", "),
      );
    }

    return "";
  };

  // Turn port objects into a readable port string
  const portToText = (port) => {
    if (!port) return "";
    if (typeof port === "string") return s(port);

    if (typeof port === "object") {
      return first(
        port.name,
        port.portName,
        port.unlocode,
        port.locode,
        port.code,
      );
    }

    return "";
  };

  const intake = shipment?.meta?.intake || {};
  const intakeRoute = intake?.route || {};

  // ROUTE (priority order: meta.intake -> addresses -> ports -> parties -> existing snapshot)
  const origin = first(
    intake.origin,
    intakeRoute.origin,
    addressToText(shipment?.originAddress),
    portToText(shipment?.ports?.originPort),
    addressToText(shipment?.shipper?.address),
    shipment?.customerRequest?.route?.origin,
  );

  const destination = first(
    intake.destination,
    intakeRoute.destination,
    addressToText(shipment?.destinationAddress),
    portToText(shipment?.ports?.destinationPort),
    addressToText(shipment?.consignee?.address),
    shipment?.customerRequest?.route?.destination,
  );

  const originPort = portToText(
    first(
      intake.originPort,
      intake.loadPort,
      intake.portOfLoading,
      intakeRoute.originPort,
      intakeRoute.loadPort,
      shipment?.ports?.originPort,
      shipment?.ports?.origin,
      shipment?.ports?.loadPort,
      shipment?.ports?.portOfLoading,
      shipment?.customerRequest?.route?.originPort,
    ),
  );

  const destinationPort = portToText(
    first(
      intake.destinationPort,
      intake.dischargePort,
      intake.portOfDischarge,
      intakeRoute.destinationPort,
      intakeRoute.dischargePort,
      shipment?.ports?.destinationPort,
      shipment?.ports?.destination,
      shipment?.ports?.dischargePort,
      shipment?.ports?.portOfDischarge,
      shipment?.customerRequest?.route?.destinationPort,
    ),
  );

  // ---------------- CARGO (fix: packages + volume now follow weight-style fallbacks) ----------------

  // Weight (prefer numeric fields; else parse from "2400 kg" text)
  const weightText = first(
    intake.weight,
    // ✅ include common intake locations (container/roro/air)
    pick(shipment, [
      "meta.intake.container.weightKg",
      "meta.intake.roro.weightKg",
      "meta.intake.air.weightKg",
      "meta.intake.container.weight",
      "meta.intake.roro.weight",
      "meta.intake.air.weight",
      "meta.intake.weightKg",
      "meta.intake.weight",
      "cargo.weight",
      "weight",
    ]),
  );

  const weightKg =
    toFiniteOrNull(
      pick(shipment, [
        // ✅ shipment-level first (customer/admin edits)
        "weightKg",
        "cargo.weightKg",
        // ✅ lead intake fallbacks
        "meta.intake.container.weightKg",
        "meta.intake.roro.weightKg",
        "meta.intake.air.weightKg",
        "meta.intake.weightKg",
      ]),
    ) ?? parseNumberFromTextOrNull(weightText);

  // Packages / pieces
  // IMPORTANT: include BOTH flat and cargo.* keys because different UIs write different shapes
  const packageCount = toFiniteOrNull(
    pick(shipment, [
      // intake first
      "meta.intake.packageCount",
      "meta.intake.packagesCount",
      "meta.intake.pieces",
      "meta.intake.qty",

      // flat writes (some clients)
      "packageCount",
      "packagesCount",
      "pieces",
      "qty",

      // cargo writes (customer edit page writes here)
      "cargo.packageCount",
      "cargo.packagesCount",
      "cargo.pieces",
      "cargo.qty",
    ]),
  );

  // Volume (CBM / m3)
  const volumeCbm = toFiniteOrNull(
    pick(shipment, [
      // intake first
      "meta.intake.volumeCbm",
      "meta.intake.volumeM3",

      // flat writes
      "volumeCbm",
      "volumeM3",
      "cbm",

      // cargo writes
      "cargo.volumeCbm",
      "cargo.volumeM3",
      "cargo.cbm",
    ]),
  );

  // Declared value
  const declaredValue =
    toFiniteOrNull(
      pick(shipment, [
        "meta.intake.declaredValue",
        "declaredValue",
        "cargo.declaredValue",
        "cargoValue.amount",
      ]),
    ) ?? null;

  const declaredCurrency = first(
    pick(shipment, [
      "meta.intake.declaredCurrency",
      "cargoValue.currency",
      "quote.currency",
    ]),
    "GBP",
  );

  // Packaging type (schema-first: cargo.packages[0].type; else cargo.packagingType; else intake)
  const packagingType = (() => {
    const p = shipment?.cargo?.packages;
    if (Array.isArray(p) && p.length) {
      const firstPkg = p[0];
      if (typeof firstPkg === "string") return s(firstPkg);
      if (firstPkg && typeof firstPkg === "object") {
        return first(firstPkg.type, firstPkg.packageType, firstPkg.name);
      }
    }
    return first(
      pick(shipment, ["cargo.packagingType", "cargo.packaging"]),
      intake.packagingType,
      "",
    );
  })();

  const goodsDescription = first(
    intake.cargoDescription,
    intake.goodsDescription,
    pick(shipment, ["cargo.goodsDescription", "cargo.description"]),
  );

  const notes = first(
    intake.customerNotes,
    intake.notes,
    pick(shipment, [
      "cargo.notes",
      "customerNotes",
      "notes",
      "instructions",
      "specialInstructions",
    ]),
  );

  return {
    capturedAt: new Date(),
    route: {
      origin,
      destination,
      originPort,
      destinationPort,
    },
    parties: {
      shipper: {
        name: first(shipment?.shipper?.name),
        email: first(shipment?.shipper?.email),
        phone: first(shipment?.shipper?.phone),
        address: first(
          addressToText(shipment?.shipper?.address),
          addressToText(shipment?.originAddress),
        ),
      },
      consignee: {
        name: first(shipment?.consignee?.name),
        email: first(shipment?.consignee?.email),
        phone: first(shipment?.consignee?.phone),
        address: first(
          addressToText(shipment?.consignee?.address),
          addressToText(shipment?.destinationAddress),
        ),
      },
    },
    cargo: {
      goodsDescription,

      // ✅ Mirror counts in both common keys:
      // - Admin immutable card reads packageCount/volumeCbm
      // - Customer schema/UI may read pieces/volumeM3
      pieces: packageCount,
      packageCount,

      packagingType,

      weightKg,

      volumeM3: volumeCbm,
      volumeCbm,

      declaredValue,
      declaredCurrency,

      notes,
    },
    dates: {
      shippingDate: first(intake.shippingDate, shipment?.shippingDate) || null,
      eta: first(intake.eta, shipment?.eta) || null,
    },
  };
}

module.exports = buildCustomerRequestSnapshot;
