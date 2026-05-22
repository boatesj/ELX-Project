const mongoose = require("mongoose");
const Shipment = require("../models/Shipment");
const User = require("../models/User");

function isAdmin(req) {
  return req.user && (req.user.isAdmin || req.user.role === "admin");
}

async function globalSearch(req, res) {
  if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });

  const q = String(req.query.q || "").trim();
  if (!q || q.length < 2) return res.json({ shipments: [], users: [] });

  const regex = new RegExp(q, "i");

  try {
    const [shipments, users] = await Promise.all([
      Shipment.find({
        isDeleted: false,
        $or: [
          { referenceNo: regex },
          { "shipper.name": regex },
          { "consignee.name": regex },
          { "shipper.email": regex },
          { status: regex },
        ],
      })
        .select("referenceNo shipper consignee status createdAt")
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),

      User.find({
        isDeleted: false,
        $or: [
          { fullname: regex },
          { email: regex },
          { company: regex },
          { phone: regex },
        ],
      })
        .select("fullname email company status")
        .limit(6)
        .lean(),
    ]);

    return res.json({ shipments, users });
  } catch (err) {
    console.error("Global search error:", err);
    return res.status(500).json({ message: "Search failed", error: err.message });
  }
}

module.exports = { globalSearch };
