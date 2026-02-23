// Backend/scripts/backfillCustomerRequest.js
require("dotenv").config();
const mongoose = require("mongoose");

const Shipment = require("../models/Shipment");
const buildCustomerRequestSnapshot = require("../helpers/buildCustomerRequestSnapshot");

async function run() {
  const uri =
    process.env.MONGO_URI || process.env.MONGO_URL || process.env.DATABASE_URL;
  if (!uri) {
    console.error("❌ Missing MONGO_URL (or DATABASE_URL) in Backend/.env");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("✅ DB connected");

  const query = {
    $or: [{ customerRequest: { $exists: false } }, { customerRequest: null }],
  };

  const cursor = Shipment.find(query).cursor();

  let scanned = 0;
  let updated = 0;

  for await (const shipment of cursor) {
    scanned += 1;

    const snap = buildCustomerRequestSnapshot(shipment);
    if (!snap) continue;

    shipment.customerRequest = snap;
    await shipment.save();

    updated += 1;
    if (updated % 25 === 0) {
      console.log(`…updated ${updated} (scanned ${scanned})`);
    }
  }

  console.log(`✅ Done. scanned=${scanned}, updated=${updated}`);
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error("❌ Backfill failed:", e);
  process.exit(1);
});
