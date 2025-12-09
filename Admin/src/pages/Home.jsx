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
    className={`flex flex-col justify-between bg-[#1A1A1A] rounded-xl shadow-lg p-6 w-[260px] h-[200px] text-[#E5E5E5]
      ${onClick ? "cursor-pointer hover:bg-[#222222] transition" : ""}`}
    onClick={onClick}
  >
    <div>
      <h2 className="text-sm font-semibold tracking-wide uppercase text-gray-300">
        {title}
      </h2>
    </div>

    <div className="flex items-center gap-3">
      {trend === "up" && (
        <HiArrowTrendingUp className="text-3xl text-emerald-400" />
      )}
      {trend === "down" && (
        <HiArrowTrendingDown className="text-3xl text-red-400" />
      )}
      {!trend && <div className="w-6" />}
      <span className="text-3xl font-bold">
        {value !== null && value !== undefined ? value : "—"}
      </span>
    </div>

    <p className="text-xs text-gray-400 mt-2">{subLabel}</p>
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
        const shipmentsDashboardData = await shipmentsDashboardRes.json();
        const shipmentsListData = await shipmentsListRes.json();

        // ----- USERS -----
        const usersArray = Array.isArray(usersData)
          ? usersData
          : usersData.users || [];

        setTotalUsers(usersArray.length);
        setRecentUsers(usersArray.slice(0, 5)); // newest first (backend already sorts by createdAt desc)

        // ----- SHIPMENTS DASHBOARD -----
        const totals = shipmentsDashboardData?.data?.totals || {};
        const byStatus = shipmentsDashboardData?.data?.byStatus || {};
        const routes = shipmentsDashboardData?.data?.topRoutes || [];

        const pending = byStatus.pending || 0;
        const delivered = byStatus.delivered || 0;
        const active =
          totals.active ?? (totals.totalShipments || 0) - delivered - pending;

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

        // ----- LATEST SHIPMENTS -----
        const shipmentsArray = Array.isArray(shipmentsListData?.data)
          ? shipmentsListData.data
          : [];

        setLatestShipments(shipmentsArray.slice(0, 5));
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
    <div className="p-8 bg-[#0F0F0F] min-h-screen text-white">
      {/* PAGE HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-wide">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Snapshot of users and shipments across Ellcworth Express.
          </p>
        </div>
      </div>

      {loadError && (
        <div className="mb-4 px-4 py-2 rounded-md bg-red-100 text-red-800 text-sm border border-red-300">
          {loadError}
        </div>
      )}

      {/* TOP METRICS */}
      <div className="flex gap-4 flex-wrap">
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
      <div className="flex justify-between mt-12 gap-6 flex-wrap">
        {/* PIE CHART */}
        <div className="bg-[#1A1A1A] rounded-xl p-6 shadow-lg h-[450px] w-[520px]">
          <h3 className="text-lg font-semibold mb-4 tracking-wide">
            Shipment Breakdown
          </h3>
          {loading ? (
            <div className="h-full flex items-center justify-center text-sm text-gray-400">
              Loading chart...
            </div>
          ) : (
            <>
              <PieChart
                width={450}
                height={330}
                slotProps={{
                  legend: { hidden: true }, // REMOVE default MUI legend
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

              {/* LEGEND */}
              <div className="mt-3 flex gap-6 text-xs text-gray-300">
                <button
                  type="button"
                  className="flex items-center gap-2 focus:outline-none hover:text-[#FFA500]"
                  onClick={() => navigate("/shipments?status=pending")}
                >
                  <span className="inline-block w-3 h-3 rounded-full bg-[#FFA500]" />
                  <span>Pending</span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 focus:outline-none hover:text-[#22C55E]"
                  onClick={() => navigate("/shipments?status=delivered")}
                >
                  <span className="inline-block w-3 h-3 rounded-full bg-[#22C55E]" />
                  <span>Delivered</span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 focus:outline-none hover:text-[#38BDF8]"
                  onClick={() => navigate("/shipments")}
                >
                  <span className="inline-block w-3 h-3 rounded-full bg-[#38BDF8]" />
                  <span>In Transit / Active</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* RECENT USERS */}
        <div className="bg-[#1A1A1A] rounded-xl shadow-lg p-6 w-[260px] h-[450px]">
          <h3
            className="text-lg font-semibold tracking-wide cursor-pointer hover:text-[#FFA500] transition"
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
            <ul className="mt-4 space-y-4 text-sm text-gray-300">
              {recentUsers.map((user, idx) => (
                <li
                  key={user._id || idx}
                  className="flex justify-between hover:text-[#FFA500] cursor-pointer"
                  onClick={() => navigate("/users")}
                >
                  <span>{user.fullname || user.name}</span>
                  <span className="text-xs text-gray-500">
                    {user.country || "—"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* TOP ROUTES */}
        <div className="bg-[#1A1A1A] rounded-xl shadow-lg p-6 w-[260px] h-[450px]">
          <h3 className="text-lg font-semibold tracking-wide">Top Routes</h3>
          {loading ? (
            <div className="mt-4 text-sm text-gray-400">Loading routes...</div>
          ) : topRoutes.length === 0 ? (
            <div className="mt-4 text-sm text-gray-400">No route data yet.</div>
          ) : (
            <ul className="mt-4 space-y-3 text-sm text-gray-300">
              {topRoutes.map((route, idx) => (
                <li
                  key={idx}
                  className="flex justify-between items-center border-b border-[#333] pb-2 hover:bg-[#222] px-2 -mx-2 rounded cursor-pointer"
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
                    <span className="font-medium">{route.route}</span>
                    <span className="text-xs text-gray-500">Route</span>
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
      <div className="mt-10 bg-[#1A1A1A] rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold tracking-wide mb-4">
          Latest Shipments
        </h3>
        {loading ? (
          <div className="text-sm text-gray-400">Loading shipments...</div>
        ) : latestShipments.length === 0 ? (
          <div className="text-sm text-gray-400">No shipments found yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-300">
              <thead className="border-b border-[#333] text-xs uppercase tracking-wide text-gray-400">
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
                    <td className="py-2 pr-4">{s.customer?.fullname || "—"}</td>
                    <td className="py-2 pr-4">{s.ports?.originPort || "—"}</td>
                    <td className="py-2 pr-4">
                      {s.ports?.destinationPort || "—"}
                    </td>
                    <td className="py-2 pr-4">{s.mode || "—"}</td>
                    <td className="py-2 pr-4">
                      <span className="px-2 py-1 rounded-full bg-[#222] text-xs capitalize">
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
  );
};

export default Home;
