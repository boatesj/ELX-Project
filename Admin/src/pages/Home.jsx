// Admin/src/pages/Home.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { HiArrowTrendingUp, HiArrowTrendingDown } from "react-icons/hi2";
import { PieChart } from "@mui/x-charts/PieChart";
import { authRequest } from "../requestMethods";

// ---------- helpers ----------
const safeArray = (maybeArr) => (Array.isArray(maybeArr) ? maybeArr : []);

const pickUsersArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.users)) return payload.users;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const pickShipmentsArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.shipments)) return payload.shipments;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const formatIsoDate = (iso) =>
  iso ? new Date(iso).toISOString().slice(0, 10) : "—";

const formatStatusLabel = (status) =>
  (status || "pending").toString().trim().toLowerCase().replace(/_/g, " ");

const MetricCard = ({ title, value, trend, subLabel, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={!onClick}
    className={`
      flex flex-col justify-between text-left
      bg-[#1A1A1A] rounded-xl shadow-lg
      w-full min-h-[150px] sm:min-h-[170px] md:min-h-[190px]
      p-4 sm:p-5 md:p-6 text-[#E5E5E5]
      ${
        onClick
          ? "cursor-pointer hover:bg-[#222222] transition"
          : "cursor-default"
      }
      focus:outline-none focus:ring-2 focus:ring-[#FFA500]/40
    `}
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
  </button>
);

// Responsive width/height for the PieChart without extra deps
const useElementSize = () => {
  const ref = useRef(null);
  const [size, setSize] = useState({ w: 360, h: 260 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      const cr = entry?.contentRect;
      if (!cr) return;
      setSize({
        w: Math.max(260, Math.floor(cr.width)),
        h: Math.max(240, Math.floor(cr.height)),
      });
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return [ref, size];
};

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [totalUsers, setTotalUsers] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);

  const [shipmentTotals, setShipmentTotals] = useState({
    deliveredCount: null,
    pendingCount: null,
    active: null,
    total: null,
  });

  const [pieData, setPieData] = useState([]);
  const [topRoutes, setTopRoutes] = useState([]);
  const [latestShipments, setLatestShipments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [chartWrapRef, chartSize] = useElementSize();

  const chartDims = useMemo(() => {
    // keep chart readable across breakpoints
    const w = Math.min(520, chartSize.w);
    const h = Math.min(340, Math.max(260, Math.floor(chartSize.h)));
    const outerRadius = Math.min(140, Math.max(95, Math.floor(w * 0.28)));
    const innerRadius = Math.max(40, Math.floor(outerRadius * 0.35));
    return { w, h, outerRadius, innerRadius };
  }, [chartSize]);

  const handleAuthFail = (
    message = "Please log in to view dashboard analytics."
  ) => {
    setLoadError(message);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setLoadError("");

      try {
        // authRequest should include token; still guard if token missing
        const token = localStorage.getItem("token");
        if (!token) {
          handleAuthFail("Please log in to view dashboard analytics.");
          setLoading(false);
          return;
        }

        const [usersRes, dashboardRes, shipmentsRes] = await Promise.all([
          authRequest.get("/users"),
          authRequest.get("/shipments/dashboard"),
          authRequest.get("/shipments"),
        ]);

        // ----- USERS -----
        const usersPayload = usersRes?.data;
        const usersArray = pickUsersArray(usersPayload);
        setTotalUsers(usersArray.length);

        // If backend is not sorted, do a best-effort sort by createdAt desc
        const sortedUsers = [...usersArray].sort((a, b) => {
          const da = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
          const db = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
          return db - da;
        });
        setRecentUsers(sortedUsers.slice(0, 5));

        // ----- SHIPMENTS DASHBOARD -----
        const dashboardPayload =
          dashboardRes?.data?.data || dashboardRes?.data || {};
        const totals = dashboardPayload.totals || {};
        const byStatus = dashboardPayload.byStatus || {};
        const routes = safeArray(dashboardPayload.topRoutes);

        const pending =
          totals.pending ?? totals.pendingShipments ?? byStatus.pending ?? 0;

        const delivered =
          totals.delivered ??
          totals.deliveredShipments ??
          byStatus.delivered ??
          0;

        const total =
          totals.total ??
          totals.totalShipments ??
          pending + delivered + (totals.active ?? totals.activeShipments ?? 0);

        const active =
          totals.active ??
          totals.activeShipments ??
          Math.max(0, (total || 0) - delivered - pending);

        setShipmentTotals({
          deliveredCount: delivered,
          pendingCount: pending,
          active,
          total: total ?? pending + delivered + active,
        });

        setPieData([
          { id: 0, value: pending, label: "Pending", color: "#FFA500" },
          { id: 1, value: delivered, label: "Delivered", color: "#22C55E" },
          {
            id: 2,
            value: active,
            label: "In Transit / Active",
            color: "#38BDF8",
          },
        ]);

        setTopRoutes(routes);

        // ----- LATEST SHIPMENTS -----
        const shipmentsPayload = shipmentsRes?.data;
        const shipmentsArray = pickShipmentsArray(shipmentsPayload);

        const sortedShipments = [...shipmentsArray].sort((a, b) => {
          const da = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
          const db = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
          return db - da;
        });

        setLatestShipments(sortedShipments.slice(0, 5));
      } catch (err) {
        const status = err?.response?.status;

        if (status === 401) {
          handleAuthFail("Your session has expired. Please log in again.");
          return;
        }

        console.error("Dashboard load error:", err?.response?.data || err);
        setLoadError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load dashboard analytics."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white px-4 py-6 sm:px-6 lg:px-8 font-montserrat">
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
          <MetricCard
            title="Total Users"
            value={totalUsers}
            trend={totalUsers !== null ? "up" : null}
            subLabel="All CRM users in the system"
            onClick={() => navigate("/users")}
          />
          <MetricCard
            title="Delivered Shipments"
            value={shipmentTotals.deliveredCount}
            trend={shipmentTotals.deliveredCount !== null ? "up" : null}
            subLabel="Completed deliveries"
            onClick={() => navigate("/shipments?status=delivered")}
          />
          <MetricCard
            title="Pending Shipments"
            value={shipmentTotals.pendingCount}
            trend={
              shipmentTotals.pendingCount !== null &&
              shipmentTotals.pendingCount > 0
                ? "down"
                : null
            }
            subLabel="Awaiting dispatch or loading"
            onClick={() => navigate("/shipments?status=pending")}
          />
          <MetricCard
            title="Active Shipments"
            value={shipmentTotals.active}
            trend={
              shipmentTotals.active !== null && shipmentTotals.active > 0
                ? "up"
                : null
            }
            subLabel="Currently in progress"
            onClick={() => navigate("/shipments")}
          />
        </div>

        {/* MIDDLE ROW */}
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {/* PIE CHART */}
          <div className="order-1 bg-[#1A1A1A] rounded-xl p-4 sm:p-6 shadow-lg w-full min-h-[320px] xl:col-span-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-1 tracking-wide">
                  Shipment Breakdown
                </h3>
                <p className="text-[11px] sm:text-xs text-gray-400">
                  Pending vs delivered vs active shipments.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/shipments")}
                className="text-[11px] sm:text-xs font-semibold text-gray-300 hover:text-[#FFA500] transition"
              >
                View all →
              </button>
            </div>

            {loading ? (
              <div className="h-[260px] sm:h-[280px] flex items-center justify-center text-sm text-gray-400">
                Loading chart...
              </div>
            ) : (
              <>
                <div
                  ref={chartWrapRef}
                  className="mt-4 w-full h-[260px] sm:h-[280px] md:h-[300px] flex items-center justify-center"
                >
                  <PieChart
                    width={chartDims.w}
                    height={chartDims.h}
                    slotProps={{ legend: { hidden: true } }}
                    series={[
                      {
                        data: pieData,
                        innerRadius: chartDims.innerRadius,
                        outerRadius: chartDims.outerRadius,
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

                {/* LEGEND */}
                <div className="mt-3 flex flex-wrap gap-4 text-[11px] sm:text-xs text-gray-300">
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
            <div className="flex items-start justify-between gap-3">
              <h3
                className="text-base sm:text-lg font-semibold tracking-wide cursor-pointer hover:text-[#FFA500] transition"
                onClick={() => navigate("/users")}
              >
                Recent Users
              </h3>
              <button
                type="button"
                onClick={() => navigate("/users")}
                className="text-[11px] sm:text-xs font-semibold text-gray-300 hover:text-[#FFA500] transition"
              >
                Open →
              </button>
            </div>

            {loading ? (
              <div className="mt-4 text-sm text-gray-400">Loading users...</div>
            ) : recentUsers.length === 0 ? (
              <div className="mt-4 text-sm text-gray-400">
                No users found yet.
              </div>
            ) : (
              <ul className="mt-4 space-y-3 text-sm text-gray-300">
                {recentUsers.map((u) => (
                  <li
                    key={u._id}
                    className="flex items-center justify-between gap-3 hover:text-[#FFA500] cursor-pointer"
                    onClick={() => navigate(`/users/${u._id}`)}
                  >
                    <span className="truncate max-w-[70%]">
                      {u.fullname || u.name || "—"}
                    </span>
                    <span className="text-xs text-gray-500 truncate max-w-[30%] text-right">
                      {u.country || "—"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* TOP ROUTES */}
          <div className="order-3 bg-[#1A1A1A] rounded-xl shadow-lg p-4 sm:p-6 w-full">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base sm:text-lg font-semibold tracking-wide">
                Top Routes
              </h3>
              <button
                type="button"
                onClick={() => navigate("/shipments")}
                className="text-[11px] sm:text-xs font-semibold text-gray-300 hover:text-[#FFA500] transition"
              >
                Shipments →
              </button>
            </div>

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
                    key={`${route.route || "route"}-${idx}`}
                    className="flex items-center justify-between border-b border-[#333] pb-2 hover:bg-[#222] px-2 -mx-2 rounded cursor-pointer"
                    onClick={() => {
                      const raw = String(route.route || "");
                      const [origin, destination] = raw.split(" → ");
                      navigate(
                        `/shipments?origin=${encodeURIComponent(
                          origin || ""
                        )}&destination=${encodeURIComponent(destination || "")}`
                      );
                    }}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium truncate max-w-[170px] sm:max-w-[220px]">
                        {route.route || "—"}
                      </span>
                      <span className="text-[11px] text-gray-500">Route</span>
                    </div>
                    <span className="text-sm font-semibold text-[#FFA500]">
                      {route.count ?? 0}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* BOTTOM ROW: LATEST SHIPMENTS */}
        <div className="mt-10 bg-[#1A1A1A] rounded-xl shadow-lg p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base sm:text-lg font-semibold tracking-wide">
                Latest Shipments
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-400 mt-1">
                Most recently created records.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/shipments")}
              className="text-[11px] sm:text-xs font-semibold text-gray-300 hover:text-[#FFA500] transition"
            >
              View all →
            </button>
          </div>

          {loading ? (
            <div className="text-sm text-gray-400">Loading shipments...</div>
          ) : latestShipments.length === 0 ? (
            <div className="text-sm text-gray-400">No shipments found yet.</div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="min-w-[720px] w-full text-xs sm:text-sm text-left text-gray-300">
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
                        {s.referenceNo || "—"}
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
                        {s.mode ? String(s.mode) : "—"}
                      </td>
                      <td className="py-2 pr-4">
                        <span className="px-2 py-1 rounded-full bg-[#222] text-[11px] sm:text-xs capitalize">
                          {formatStatusLabel(s.status)}
                        </span>
                      </td>
                      <td className="py-2 pr-4">
                        {formatIsoDate(s.createdAt)}
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
