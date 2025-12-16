const { createLog } = require("../utils/createLog");

async function overview(req, res) {
  const range = String(req.query.range || "30d");
  await createLog(req, {
    type: "analytics",
    action: "Viewed analytics overview",
    ref: range,
  });

  return res.json({
    range,
    statusBreakdown: [
      { id: 0, value: 18, label: "Booked" },
      { id: 1, value: 11, label: "Sailed" },
      { id: 2, value: 7, label: "Arrived" },
      { id: 3, value: 5, label: "Delivered" },
    ],
    monthlyBookings: {
      labels: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      values: [22, 28, 19, 31, 26, 34],
    },
    kpis: {
      avgDaysToBooked: 1.2,
      avgDaysToSailed: 4.8,
      avgDaysToDelivered: 18.3,
    },
  });
}

module.exports = { overview };
