import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiArrowTrendingUp, HiArrowTrendingDown } from "react-icons/hi2";
import { PieChart } from "@mui/x-charts/PieChart";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const USERS_API = `${API_BASE_URL}/users`;
const SHIPMENTS_DASHBOARD_API = `${API_BASE_URL}/shipments/dashboard`;
const SHIPMENTS_API = `${API_BASE_URL}/shipments`;

// Reusable metric card with optional click handler
const metricCard = (
  title,
  value,
  trend = null,
  subLabel = "Compared to last period",
  onClick
) => (
  <div
    className={`flex flex-col justify-between bg-[#1A1A1A] rounded-xl shadow-lg
      w-full min-h-[150px] sm:min-h-[170px] md:min-h-[190px]
      p-4 sm:p-5 md:p-6 text-[#E5E5E5]
      ${onClick ? "cursor-pointer hover:bg-[#222222] transition" : ""}`}
    onClick={onClick}
  >
    <div>
      <h2 className="text-xs sm:text-sm font-semibold tracking-wide uppercase text-gray-300">
        {title}
      </h2>
    </div>

    <div className="mt-3 flex items-center gap-3">
      {trend === "up" && (
        <HiArrowTrendingUp className="text-2xl sm:text-3xl text-emerald-400" />
      )}
      {trend === "down" && (
        <HiArrowTrendingDown className="text-2xl sm:text-3xl text-red-400" />
      )}
      {!trend && <div className="w-6" />}
      <span className="text-2xl sm:text-3xl font-bold">
        {value !== null && value !== undefined ? value : "—"}
      </span>
    </div>

    <p className="mt-3 text-[11px] sm:text-xs text-gray-400">{subLabel}</p>
  </div>
);

const Home = () => {
  const navigate = useNavigate();

  const [totalUsers, setTotalUsers] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [shipmentTotals, setShipmentTotals] = useState({
    deliveredCount: null,
    pendingCount: null,
    active: null,
  });
  const [pieData, setPieData] = useState([]);
  const [topRoutes, setTopRoutes] = useState([]);
  const [latestShipments, setLatestShipments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoadError("Please log in to view dashboard analytics.");
          setLoading(false);
          return;
        }

        // Fetch users, shipment dashboard stats, and latest shipments in parallel
        const [usersRes, shipmentsDashboardRes, shipmentsListRes] =
          await Promise.all([
            fetch(USERS_API, {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }),
            fetch(SHIPMENTS_DASHBOARD_API, {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }),
            fetch(SHIPMENTS_API, {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }),
          ]);

        // Handle errors for each
        if (!usersRes.ok) {
          const errorData = await usersRes.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to load users");
        }

        if (!shipmentsDashboardRes.ok) {
          const errorData = await shipmentsDashboardRes
            .json()
            .catch(() => ({}));
          throw new Error(errorData.message || "Failed to load shipment stats");
        }

        if (!shipmentsListRes.ok) {
          const errorData = await shipmentsListRes.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to load shipments list");
        }

        const usersData = await usersRes.json();
        const shipmentsDashboardJson = await shipmentsDashboardRes.json();
        const shipmentsListData = await shipmentsListRes.json();

        console.log("Users API response:", usersData);
        console.log(
          "Shipments dashboard API response:",
          shipmentsDashboardJson
        );
        console.log("Shipments list API response:", shipmentsListData);

        // ----- USERS -----
        const usersArray = Array.isArray(usersData)
          ? usersData
          : usersData.users || [];

        setTotalUsers(usersArray.length);
        setRecentUsers(usersArray.slice(0, 5)); // newest first

        // ----- SHIPMENTS DASHBOARD -----
        const dashboardData =
          shipmentsDashboardJson?.data || shipmentsDashboardJson || {};

        const totals = dashboardData.totals || {};
        const byStatus = dashboardData.byStatus || {};
        const routes = dashboardData.topRoutes || [];

        const pending =
          totals.pending ?? totals.pendingShipments ?? byStatus.pending ?? 0;
        const delivered =
          totals.delivered ??
          totals.deliveredShipments ??
          byStatus.delivered ??
          0;

        // Prefer backend active value, fall back to derived
        const active =
          totals.active ??
          totals.activeShipments ??
          (totals.totalShipments || 0) - delivered - pending;

        setShipmentTotals({
          deliveredCount: delivered,
          pendingCount: pending,
          active,
        });

        setPieData([
          { id: 0, value: pending, label: "Pending", color: "#FFA500" }, // orange
          { id: 1, value: delivered, label: "Delivered", color: "#22C55E" }, // green
          {
            id: 2,
            value: active,
            label: "In Transit / Active",
            color: "#38BDF8",
          }, // blue
        ]);

        setTopRoutes(routes);

        // ----- LATEST SHIPMENTS (from full list endpoint) -----
        let shipmentsArray = [];

        if (Array.isArray(shipmentsListData)) {
          // backend returns just an array
          shipmentsArray = shipmentsListData;
        } else if (Array.isArray(shipmentsListData.data)) {
          // e.g. { data: [...] }
          shipmentsArray = shipmentsListData.data;
        } else if (Array.isArray(shipmentsListData.shipments)) {
          // e.g. { shipments: [...] }
          shipmentsArray = shipmentsListData.shipments;
        } else {
          console.warn(
            "Unexpected shipments list response shape:",
            shipmentsListData
          );
        }

        const latest = shipmentsArray.slice(0, 5);
        setLatestShipments(latest);
      } catch (err) {
        console.error("Dashboard load error:", err);
        setLoadError(err.message || "Failed to load dashboard analytics.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        {/* PAGE HEADER */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-wide">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-400">
              Snapshot of users and shipments across Ellcworth Express.
            </p>
          </div>
        </div>

        {loadError && (
          <div className="mb-4 rounded-md border border-red-300 bg-red-100 px-4 py-2 text-xs sm:text-sm text-red-800">
            {loadError}
          </div>
        )}

        {/* TOP METRICS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metricCard(
            "Total Users",
            totalUsers,
            totalUsers !== null ? "up" : null,
            "All CRM users in the system",
            () => navigate("/users")
          )}
          {metricCard(
            "Delivered Shipments",
            shipmentTotals.deliveredCount,
            shipmentTotals.deliveredCount !== null ? "up" : null,
            "Completed deliveries",
            () => navigate("/shipments?status=delivered")
          )}
          {metricCard(
            "Pending Shipments",
            shipmentTotals.pendingCount,
            shipmentTotals.pendingCount !== null &&
              shipmentTotals.pendingCount > 0
              ? "down"
              : null,
            "Awaiting dispatch or loading",
            () => navigate("/shipments?status=pending")
          )}
          {metricCard(
            "Active Shipments",
            shipmentTotals.active,
            shipmentTotals.active !== null && shipmentTotals.active > 0
              ? "up"
              : null,
            "Currently in progress",
            () => navigate("/shipments")
          )}
        </div>

        {/* MIDDLE ROW: PIE + RECENT USERS + TOP ROUTES */}
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {/* PIE CHART - make it first and full-width on small screens */}
          <div className="order-1 bg-[#1A1A1A] rounded-xl p-4 sm:p-6 shadow-lg w-full min-h-[320px] xl:col-span-2">
            <h3 className="text-base sm:text-lg font-semibold mb-4 tracking-wide">
              Shipment Breakdown
            </h3>
            {loading ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-400">
                Loading chart...
              </div>
            ) : (
              <>
                <div className="w-full overflow-x-auto flex justify-center">
                  <div className="min-w-[260px] sm:min-w-[320px] md:min-w-[380px]">
                    <PieChart
                      width={380}
                      height={260}
                      slotProps={{
                        legend: { hidden: true },
                      }}
                      series={[
                        {
                          data: pieData,
                          innerRadius: 40,
                          outerRadius: 120,
                          paddingAngle: 3,
                          cornerRadius: 4,
                        },
                      ]}
                      sx={{
                        "& .MuiPieArc-root": {
                          transition: "all 0.25s ease",
                          cursor: "default",
                        },
                      }}
                    />
                  </div>
                </div>

                {/* LEGEND */}
                <div className="mt-4 flex flex-wrap gap-4 text-[11px] sm:text-xs text-gray-300">
                  <button
                    type="button"
                    className="flex items-center gap-2 focus:outline-none hover:text-[#FFA500]"
                    onClick={() => navigate("/shipments?status=pending")}
                  >
                    <span className="inline-block h-3 w-3 rounded-full bg-[#FFA500]" />
                    <span>Pending</span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-2 focus:outline-none hover:text-[#22C55E]"
                    onClick={() => navigate("/shipments?status=delivered")}
                  >
                    <span className="inline-block h-3 w-3 rounded-full bg-[#22C55E]" />
                    <span>Delivered</span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-2 focus:outline-none hover:text-[#38BDF8]"
                    onClick={() => navigate("/shipments")}
                  >
                    <span className="inline-block h-3 w-3 rounded-full bg-[#38BDF8]" />
                    <span>In Transit / Active</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* RECENT USERS */}
          <div className="order-2 bg-[#1A1A1A] rounded-xl shadow-lg p-4 sm:p-6 w-full">
            <h3
              className="text-base sm:text-lg font-semibold tracking-wide cursor-pointer hover:text-[#FFA500] transition"
              onClick={() => navigate("/users")}
            >
              Recent Users
            </h3>
            {loading ? (
              <div className="mt-4 text-sm text-gray-400">Loading users...</div>
            ) : recentUsers.length === 0 ? (
              <div className="mt-4 text-sm text-gray-400">
                No users found yet.
              </div>
            ) : (
              <ul className="mt-4 space-y-3 text-sm text-gray-300">
                {recentUsers.map((user, idx) => (
                  <li
                    key={user._id || idx}
                    className="flex justify-between hover:text-[#FFA500] cursor-pointer"
                    onClick={() => navigate("/users")}
                  >
                    <span className="truncate max-w-[60%]">
                      {user.fullname || user.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {user.country || "—"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* TOP ROUTES */}
          <div className="order-3 bg-[#1A1A1A] rounded-xl shadow-lg p-4 sm:p-6 w-full">
            <h3 className="text-base sm:text-lg font-semibold tracking-wide">
              Top Routes
            </h3>
            {loading ? (
              <div className="mt-4 text-sm text-gray-400">
                Loading routes...
              </div>
            ) : topRoutes.length === 0 ? (
              <div className="mt-4 text-sm text-gray-400">
                No route data yet.
              </div>
            ) : (
              <ul className="mt-4 space-y-3 text-sm text-gray-300">
                {topRoutes.map((route, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between border-b border-[#333] pb-2 hover:bg-[#222] px-2 -mx-2 rounded cursor-pointer"
                    onClick={() => {
                      const [origin, destination] = route.route.split(" → ");
                      navigate(
                        `/shipments?origin=${encodeURIComponent(
                          origin || ""
                        )}&destination=${encodeURIComponent(destination || "")}`
                      );
                    }}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium truncate max-w-[150px] sm:max-w-[180px]">
                        {route.route}
                      </span>
                      <span className="text-[11px] text-gray-500">Route</span>
                    </div>
                    <span className="text-sm font-semibold text-[#FFA500]">
                      {route.count}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* BOTTOM ROW: LATEST SHIPMENTS TABLE */}
        <div className="mt-10 bg-[#1A1A1A] rounded-xl shadow-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold tracking-wide mb-4">
            Latest Shipments
          </h3>
          {loading ? (
            <div className="text-sm text-gray-400">Loading shipments...</div>
          ) : latestShipments.length === 0 ? (
            <div className="text-sm text-gray-400">No shipments found yet.</div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="min-w-[640px] w-full text-xs sm:text-sm text-left text-gray-300">
                <thead className="border-b border-[#333] text-[11px] sm:text-xs uppercase tracking-wide text-gray-400">
                  <tr>
                    <th className="py-2 pr-4">Reference</th>
                    <th className="py-2 pr-4">Customer</th>
                    <th className="py-2 pr-4">Origin</th>
                    <th className="py-2 pr-4">Destination</th>
                    <th className="py-2 pr-4">Mode</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {latestShipments.map((s) => (
                    <tr
                      key={s._id}
                      className="border-b border-[#222] hover:bg-[#222] cursor-pointer"
                      onClick={() => navigate(`/shipments/${s._id}`)}
                    >
                      <td className="py-2 pr-4 text-[#FFA500] font-medium">
                        {s.referenceNo}
                      </td>
                      <td className="py-2 pr-4">
                        {s.customer?.fullname ||
                          s.customer?.name ||
                          s.shipper?.name ||
                          "—"}
                      </td>
                      <td className="py-2 pr-4">
                        {s.ports?.originPort || s.origin || "—"}
                      </td>
                      <td className="py-2 pr-4">
                        {s.ports?.destinationPort || s.destination || "—"}
                      </td>
                      <td className="py-2 pr-4">
                        {s.mode ? String(s.mode).toLowerCase() : "—"}
                      </td>
                      <td className="py-2 pr-4">
                        <span className="px-2 py-1 rounded-full bg-[#222] text-[11px] sm:text-xs capitalize">
                          {s.status || "pending"}
                        </span>
                      </td>
                      <td className="py-2 pr-4">
                        {s.createdAt
                          ? new Date(s.createdAt).toISOString().slice(0, 10)
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
