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

  // ROUTE (priority order: meta.intake -> addresses -> ports -> parties)
  const origin = first(
    intake.origin,
    intakeRoute.origin,
    addressToText(shipment?.originAddress),
    portToText(shipment?.ports?.originPort),
    addressToText(shipment?.shipper?.address),
    shipment?.customerRequest?.route?.origin, // keep existing last
  );

  const destination = first(
    intake.destination,
    intakeRoute.destination,
    addressToText(shipment?.destinationAddress),
    portToText(shipment?.ports?.destinationPort),
    addressToText(shipment?.consignee?.address),
    shipment?.customerRequest?.route?.destination, // keep existing last
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

  // CARGO (add meta.intake fallbacks)
  const weightText = first(intake.weight, shipment?.cargo?.weight);
  const weightKg = (() => {
    const m = String(weightText || "").match(/[\d.]+/);
    if (!m) return null;
    const parsed = Number(m[0]);
    return Number.isFinite(parsed) ? parsed : null;
  })();

  const declaredValue =
    n(first(intake.declaredValue, shipment?.cargoValue?.amount)) ?? null;

  const packagingType = (() => {
    const p = shipment?.cargo?.packages;
    if (Array.isArray(p) && p.length) {
      const firstPkg = p[0];
      if (typeof firstPkg === "string") return s(firstPkg);
      if (firstPkg && typeof firstPkg === "object") {
        return first(firstPkg.type, firstPkg.packageType, firstPkg.name);
      }
    }
    return first(intake.packagingType, "");
  })();

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
      goodsDescription: first(
        intake.cargoDescription,
        intake.goodsDescription,
        shipment?.cargo?.description,
      ),
      pieces: n(first(intake.packageCount, shipment?.cargo?.packageCount)),
      packagingType,
      weightKg,
      volumeM3: n(
        first(intake.volumeM3, intake.volumeCbm, shipment?.cargo?.volumeCbm),
      ),
      declaredValue,
      declaredCurrency: first(
        intake.declaredCurrency,
        shipment?.cargoValue?.currency,
        "GBP",
      ),
      notes: first(intake.customerNotes, intake.notes, shipment?.customerNotes),
    },
    dates: {
      shippingDate: first(intake.shippingDate, shipment?.shippingDate) || null,
      eta: first(intake.eta, shipment?.eta) || null,
    },
  };
}

module.exports = buildCustomerRequestSnapshot;
