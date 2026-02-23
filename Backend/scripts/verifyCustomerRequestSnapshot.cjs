const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const Shipment = require("../models/Shipment");

const MONGO =
  process.env.MONGO_URI || process.env.MONGO_URL || process.env.DATABASE_URL;

if (!MONGO) {
  console.error("❌ Missing DB connection string in Backend/.env");
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(MONGO);

    // Prefer a shipment that actually has a customerRequest snapshot
    const s = await Shipment.findOne({
      customerRequest: { $exists: true },
    })
      .sort({ createdAt: -1 })
      .lean();

    console.log("✅ Sample shipment:", String(s?._id));

    const cr = s?.customerRequest || {};
    console.log({
      route: {
        origin: cr?.route?.origin,
        destination: cr?.route?.destination,
        originPort: cr?.route?.originPort,
        destinationPort: cr?.route?.destinationPort,
      },
      cargo: {
        goodsDescription: cr?.cargo?.goodsDescription,
        pieces: cr?.cargo?.pieces,
        packagingType: cr?.cargo?.packagingType,
        weightKg: cr?.cargo?.weightKg,
        volumeM3: cr?.cargo?.volumeM3,
        declaredValue: cr?.cargo?.declaredValue,
        declaredCurrency: cr?.cargo?.declaredCurrency,
        notes: cr?.cargo?.notes,
      },
      dates: {
        shippingDate: cr?.dates?.shippingDate,
        eta: cr?.dates?.eta,
      },
      capturedAt: cr?.capturedAt,
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Verify failed:", err);
    process.exit(1);
  }
})();
