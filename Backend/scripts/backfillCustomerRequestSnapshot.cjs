const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const Shipment = require("../models/Shipment");

const MONGO =
  process.env.MONGO_URI || process.env.MONGO_URL || process.env.DATABASE_URL;

if (!MONGO) {
  console.error(
    "❌ Missing DB connection string. Set MONGO_URI (preferred) or MONGO_URL or DATABASE_URL.",
  );
  process.exit(1);
}

// Minimal: reuse the controller builder by requiring the controller file.
// (If this causes side-effects, we’ll move the builder into a helper next.)
const { buildCustomerRequestSnapshot } = require("../controllers/shipment");

const isEmpty = (v) => !v || String(v).trim() === "";
const FORCE = process.argv.includes("--force");

(async () => {
  try {
    await mongoose.connect(MONGO);
    console.log("✅ Connected");

    // We backfill when:
    // - snapshot missing entirely, OR
    // - route origin/destination missing, OR
    // - route ports missing, OR
    // - cargo summary fields missing (goodsDescription / pieces / weightKg / volumeM3), OR
    // - customer notes missing (stored under customerRequest.cargo.notes)
    //
    // NOTE: This query is intentionally broad so we can repair older snapshots
    // after schema/builder changes.
    const cursor = Shipment.find(
      FORCE
        ? {}
        : {
            $or: [
              { customerRequest: { $exists: false } },
              { "customerRequest.route": { $exists: false } },
              { "customerRequest.route.origin": { $in: [null, ""] } },
              { "customerRequest.route.destination": { $in: [null, ""] } },

              // Ports
              { "customerRequest.route.originPort": { $in: [null, ""] } },
              { "customerRequest.route.destinationPort": { $in: [null, ""] } },

              // Cargo (schema-aligned)
              { "customerRequest.cargo": { $exists: false } },
              { "customerRequest.cargo.goodsDescription": { $in: [null, ""] } },
              { "customerRequest.cargo.pieces": { $exists: false } },
              { "customerRequest.cargo.weightKg": { $exists: false } },
              { "customerRequest.cargo.volumeM3": { $exists: false } },

              // Notes (schema stores under cargo.notes)
              { "customerRequest.cargo.notes": { $in: [null, ""] } },
            ],
          },
    ).cursor();

    let scanned = 0;
    let updated = 0;

    for await (const shipment of cursor) {
      scanned += 1;

      const beforeOrigin = shipment?.customerRequest?.route?.origin;
      const beforeDest = shipment?.customerRequest?.route?.destination;
      const beforeOriginPort = shipment?.customerRequest?.route?.originPort;
      const beforeDestPort = shipment?.customerRequest?.route?.destinationPort;

      const beforeGoods = shipment?.customerRequest?.cargo?.goodsDescription;
      const beforePieces = shipment?.customerRequest?.cargo?.pieces;
      const beforeWeightKg = shipment?.customerRequest?.cargo?.weightKg;
      const beforeVolM3 = shipment?.customerRequest?.cargo?.volumeM3;
      const beforeNotes = shipment?.customerRequest?.cargo?.notes;

      const needsRefresh =
        FORCE ||
        isEmpty(beforeOrigin) ||
        isEmpty(beforeDest) ||
        isEmpty(beforeOriginPort) ||
        isEmpty(beforeDestPort) ||
        isEmpty(beforeGoods) ||
        beforePieces === undefined ||
        beforePieces === null ||
        beforeWeightKg === undefined ||
        beforeWeightKg === null ||
        beforeVolM3 === undefined ||
        beforeVolM3 === null ||
        isEmpty(beforeNotes);

      if (needsRefresh) {
        shipment.customerRequest = buildCustomerRequestSnapshot(shipment);
        await shipment.save();
        updated += 1;
      }
    }

    console.log(`✅ Done. Scanned=${scanned}, Updated=${updated}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Backfill failed:", err);
    process.exit(1);
  }
})();
