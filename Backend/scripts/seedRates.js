// One-time seed script — populates the Rate collection from prices already
// published on the destination pages. Run once, then manage rates from the
// admin panel going forward.
//
// Usage: node Backend/scripts/seedRates.js

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const Rate = require("../models/Rate");

const RATES = [
  // Ghana
  {
    destination: "ghana",
    service: "roro",
    label: "RoRo — per vehicle",
    priceFrom: 750,
    unit: "per vehicle / unit",
  },
  {
    destination: "ghana",
    service: "fcl20",
    label: "FCL — 20ft container",
    priceFrom: 1500,
    unit: "per 20ft container",
  },
  {
    destination: "ghana",
    service: "fcl40",
    label: "FCL — 40ft container",
    priceFrom: 2500,
    unit: "per 40ft container",
  },

  // Nigeria
  {
    destination: "nigeria",
    service: "roro",
    label: "RoRo — per vehicle",
    priceFrom: 950,
    unit: "per vehicle / unit",
  },
  {
    destination: "nigeria",
    service: "fcl20",
    label: "FCL — 20ft container",
    priceFrom: 1600,
    unit: "per 20ft container",
  },
  {
    destination: "nigeria",
    service: "fcl40",
    label: "FCL — 40ft container",
    priceFrom: 2800,
    unit: "per 40ft container",
  },

  // Kenya
  {
    destination: "kenya",
    service: "roro",
    label: "RoRo — per vehicle",
    priceFrom: 1050,
    unit: "per vehicle / unit",
  },
  {
    destination: "kenya",
    service: "fcl20",
    label: "FCL — 20ft container",
    priceFrom: 1700,
    unit: "per 20ft container",
  },
  {
    destination: "kenya",
    service: "fcl40",
    label: "FCL — 40ft container",
    priceFrom: 2900,
    unit: "per 40ft container",
  },

  // Sierra Leone (no RoRo confirmed yet — FCL only)
  {
    destination: "sierra-leone",
    service: "fcl20",
    label: "FCL — 20ft container",
    priceFrom: 1650,
    unit: "per 20ft container",
  },

  // Cote d'Ivoire (no RoRo confirmed yet — FCL only)
  {
    destination: "cote-divoire",
    service: "fcl20",
    label: "FCL — 20ft container",
    priceFrom: 1600,
    unit: "per 20ft container",
  },
];

async function run() {
  const uri = process.env.MONGO_URI || process.env.DB;
  if (!uri) {
    console.error("No MONGO_URI (or DB) found in environment. Aborting.");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB.");

  let created = 0;
  let skipped = 0;

  for (const rate of RATES) {
    const existing = await Rate.findOne({
      destination: rate.destination,
      service: rate.service,
    });
    if (existing) {
      skipped += 1;
      continue;
    }
    await Rate.create(rate);
    created += 1;
    console.log(
      `Created: ${rate.destination} / ${rate.service} — £${rate.priceFrom}`,
    );
  }

  console.log(
    `\nDone. Created ${created}, skipped ${skipped} (already existed).`,
  );
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Seed script failed:", err);
  process.exit(1);
});
