// Admin/src/pages/Home.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { HiArrowTrendingUp, HiArrowTrendingDown } from "react-icons/hi2";
import { PieChart } from "@mui/x-charts/PieChart";
import { authRequest } from "../requestMethods";

// -------------------- helpers --------------------
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

// Responsive element size hook
const useElementSize = () => {
  const ref = useRef(null);
  const [size, setSize] = useState({ w: 360, h: 260 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const cr = entries?.[0]?.contentRect;
      if (!cr) return;
      setSize({
        w: Math.max(280, Math.floor(cr.width)),
        h: Math.max(240, Math.floor(cr.height)),
      });
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return [ref, size];
};

// -------------------- UI atoms (Ellcworth corporate mogul) --------------------
const MetricCard = ({
  title,
  value,
  trend = null,
  subLabel = "",
  onClick,
  accent = "orange", // orange | teal | green
}) => {
  const accentRing =
    accent === "teal"
      ? "focus:ring-sky-400/30"
      : accent === "green"
      ? "focus:ring-emerald-400/30"
      : "focus:ring-[#FFA500]/30";

  const accentBar =
    accent === "teal"
      ? "from-sky-400/70 to-sky-400/0"
      : accent === "green"
      ? "from-emerald-400/70 to-emerald-400/0"
      : "from-[#FFA500]/70 to-[#FFA500]/0";

  const accentGlow =
    accent === "teal"
      ? "bg-sky-500/20"
      : accent === "green"
      ? "bg-emerald-500/20"
      : "bg-[#FFA500]/20";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`
        group relative overflow-hidden text-left
        rounded-2xl border border-white/10
        bg-gradient-to-b from-[#0E1B20] to-[#0A1418]
        shadow-[0_18px_60px_-28px_rgba(0,0,0,0.8)]
        w-full min-h-[150px] sm:min-h-[170px] md:min-h-[190px]
        p-4 sm:p-5 md:p-6
        ${
          onClick
            ? "cursor-pointer hover:border-white/20 transition"
            : "cursor-default"
        }
        focus:outline-none focus:ring-2 ${accentRing}
        disabled:opacity-80
      `}
    >
      <div
        className={`
          pointer-events-none absolute -top-16 -right-16
          h-44 w-44 rounded-full blur-3xl ${accentGlow}
        `}
      />
      <div
        className={`pointer-events-none absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${accentBar}`}
      />

      <div>
        <h2 className="text-[11px] sm:text-xs font-semibold tracking-[0.24em] uppercase text-white/60">
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
        <span className="text-2xl sm:text-3xl font-bold text-white">
          {value !== null && value !== undefined ? value : "—"}
        </span>
      </div>

      <p className="mt-3 text-[11px] sm:text-xs text-white/55">{subLabel}</p>

      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition">
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0" />
      </div>
    </button>
  );
};

const SectionCard = ({ title, subtitle, rightSlot, children }) => (
  <section
    className="
      relative overflow-hidden
      rounded-2xl border border-white/10
      bg-gradient-to-b from-[#0E1B20] to-[#0A1418]
      shadow-[0_18px_60px_-28px_rgba(0,0,0,0.8)]
      p-4 sm:p-6
    "
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="text-base sm:text-lg font-semibold tracking-wide text-white">
          {title}
        </h3>
        {subtitle ? (
          <p className="mt-1 text-[11px] sm:text-xs text-white/55">
            {subtitle}
          </p>
        ) : null}
      </div>
      {rightSlot}
    </div>

    <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/5" />

    <div className="mt-4">{children}</div>
  </section>
);

const PillLink = ({ label, onClick, tone = "orange" }) => {
  const toneCls =
    tone === "teal"
      ? "hover:text-sky-300"
      : tone === "green"
      ? "hover:text-emerald-300"
      : "hover:text-[#FFA500]";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-[11px] sm:text-xs font-semibold text-white/70 ${toneCls} transition`}
    >
      {label}
    </button>
  );
};

// -------------------- Page --------------------
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
    const w = Math.min(560, chartSize.w);
    const h = Math.min(360, Math.max(260, Math.floor(chartSize.h)));
    const outerRadius = Math.min(150, Math.max(95, Math.floor(w * 0.28)));
    const innerRadius = Math.max(44, Math.floor(outerRadius * 0.34));
    return { w, h, outerRadius, innerRadius };
  }, [chartSize]);

  const redirectToLogin = (message) => {
    setLoadError(message || "Please log in to view dashboard analytics.");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          redirectToLogin("Please log in to view dashboard analytics.");
          setLoading(false);
          return;
        }

        // Fetch users, shipment dashboard stats, and latest shipments in parallel
        const [usersRes, dashboardRes, shipmentsRes] = await Promise.all([
          authRequest.get("/users"),
          authRequest.get("/shipments/dashboard"),
          authRequest.get("/shipments"),
        ]);

        // ----- USERS -----
        const usersArray = pickUsersArray(usersRes?.data);
        setTotalUsers(usersArray.length);

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

        // Keep MUI pie colors explicit (Ellcworth palette accents)
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

        // ----- LATEST SHIPMENTS (from full list endpoint) -----
        const shipmentsArray = pickShipmentsArray(shipmentsRes?.data);

        const sortedShipments = [...shipmentsArray].sort((a, b) => {
          const da = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
          const db = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
          return db - da;
        });

        setLatestShipments(sortedShipments.slice(0, 5));
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401) {
          redirectToLogin("Your session has expired. Please log in again.");
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
    <div className="min-h-screen font-montserrat text-white">
      {/* Corporate mogul backdrop (replaces any white container) */}
      <div
        className="
          min-h-screen
          bg-[#071013]
          bg-[radial-gradient(900px_450px_at_20%_0%,rgba(255,165,0,0.18),transparent_55%),radial-gradient(700px_420px_at_90%_10%,rgba(56,189,248,0.14),transparent_55%),radial-gradient(800px_520px_at_55%_100%,rgba(16,185,129,0.10),transparent_60%)]
          px-4 py-6 sm:px-6 lg:px-8
        "
      >
        <div className="mx-auto w-full max-w-7xl">
          {/* PAGE HEADER */}
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-start gap-3">
              <div
                className="
                  h-11 w-11 rounded-2xl
                  bg-gradient-to-br from-[#FFA500] to-[#ffb732]
                  shadow-[0_18px_40px_-24px_rgba(255,165,0,0.9)]
                  grid place-items-center
                "
                aria-hidden="true"
              >
                <span className="text-[#1A2930] font-black tracking-[0.18em] text-sm">
                  ELX
                </span>
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-semibold tracking-wide">
                  Admin Dashboard
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-white/60">
                  Snapshot of users and shipments across Ellcworth Express.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <PillLink
                label="Users →"
                onClick={() => navigate("/users")}
                tone="orange"
              />
              <span className="text-white/20">·</span>
              <PillLink
                label="Shipments →"
                onClick={() => navigate("/shipments")}
                tone="teal"
              />
            </div>
          </div>

          {/* ERROR */}
          {loadError && (
            <div className="mb-4 rounded-xl border border-red-300/40 bg-red-500/10 px-4 py-3 text-xs sm:text-sm text-red-200">
              {loadError}
            </div>
          )}

          {/* TOP METRICS (was metricCard) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Total Users"
              value={totalUsers}
              trend={totalUsers !== null ? "up" : null}
              subLabel="All CRM users in the system"
              onClick={() => navigate("/users")}
              accent="orange"
            />
            <MetricCard
              title="Delivered Shipments"
              value={shipmentTotals.deliveredCount}
              trend={shipmentTotals.deliveredCount !== null ? "up" : null}
              subLabel="Completed deliveries"
              onClick={() => navigate("/shipments?status=delivered")}
              accent="green"
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
              accent="orange"
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
              accent="teal"
            />
          </div>

          {/* MIDDLE ROW: PIE + RECENT USERS + TOP ROUTES */}
          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {/* PIE CHART */}
            <div className="xl:col-span-2">
              <SectionCard
                title="Shipment Breakdown"
                subtitle="Pending vs delivered vs active shipments."
                rightSlot={
                  <PillLink
                    label="View shipments →"
                    onClick={() => navigate("/shipments")}
                    tone="orange"
                  />
                }
              >
                {loading ? (
                  <div className="h-[280px] flex items-center justify-center text-sm text-white/60">
                    Loading chart...
                  </div>
                ) : (
                  <>
                    <div
                      ref={chartWrapRef}
                      className="w-full h-[280px] sm:h-[300px] md:h-[320px] flex items-center justify-center"
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
                    <div className="mt-2 flex flex-wrap gap-4 text-[11px] sm:text-xs text-white/70">
                      <button
                        type="button"
                        className="flex items-center gap-2 hover:text-[#FFA500] transition"
                        onClick={() => navigate("/shipments?status=pending")}
                      >
                        <span className="inline-block h-3 w-3 rounded-full bg-[#FFA500]" />
                        <span>Pending</span>
                      </button>
                      <button
                        type="button"
                        className="flex items-center gap-2 hover:text-emerald-300 transition"
                        onClick={() => navigate("/shipments?status=delivered")}
                      >
                        <span className="inline-block h-3 w-3 rounded-full bg-[#22C55E]" />
                        <span>Delivered</span>
                      </button>
                      <button
                        type="button"
                        className="flex items-center gap-2 hover:text-sky-300 transition"
                        onClick={() => navigate("/shipments")}
                      >
                        <span className="inline-block h-3 w-3 rounded-full bg-[#38BDF8]" />
                        <span>In Transit / Active</span>
                      </button>
                    </div>
                  </>
                )}
              </SectionCard>
            </div>

            {/* RECENT USERS */}
            <SectionCard
              title="Recent Users"
              subtitle="Newest CRM accounts."
              rightSlot={
                <PillLink
                  label="Open →"
                  onClick={() => navigate("/users")}
                  tone="orange"
                />
              }
            >
              {loading ? (
                <div className="text-sm text-white/60">Loading users...</div>
              ) : recentUsers.length === 0 ? (
                <div className="text-sm text-white/60">No users found yet.</div>
              ) : (
                <ul className="space-y-3 text-sm text-white/80">
                  {recentUsers.map((u, idx) => (
                    <li
                      key={u._id || idx}
                      className="
                        flex items-center justify-between gap-3
                        rounded-xl border border-white/5 bg-white/5 px-3 py-2
                        hover:border-white/15 hover:bg-white/8
                        cursor-pointer transition
                      "
                      onClick={() => navigate(`/users/${u._id}`)}
                    >
                      <span className="truncate max-w-[70%] font-medium">
                        {u.fullname || u.name || "—"}
                      </span>
                      <span className="text-xs text-white/55 truncate max-w-[30%] text-right">
                        {u.country || "—"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>

            {/* TOP ROUTES */}
            <SectionCard
              title="Top Routes"
              subtitle="Most frequent lanes in the system."
              rightSlot={
                <PillLink
                  label="Shipments →"
                  onClick={() => navigate("/shipments")}
                  tone="teal"
                />
              }
            >
              {loading ? (
                <div className="text-sm text-white/60">Loading routes...</div>
              ) : topRoutes.length === 0 ? (
                <div className="text-sm text-white/60">No route data yet.</div>
              ) : (
                <ul className="space-y-3 text-sm text-white/80">
                  {topRoutes.map((route, idx) => (
                    <li
                      key={`${route.route || "route"}-${idx}`}
                      className="
                        flex items-center justify-between gap-3
                        rounded-xl border border-white/5 bg-white/5 px-3 py-2
                        hover:border-white/15 hover:bg-white/8
                        cursor-pointer transition
                      "
                      onClick={() => {
                        const raw = String(route.route || "");
                        const [origin, destination] = raw.split(" → ");
                        navigate(
                          `/shipments?origin=${encodeURIComponent(
                            origin || ""
                          )}&destination=${encodeURIComponent(
                            destination || ""
                          )}`
                        );
                      }}
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium truncate">
                          {route.route || "—"}
                        </span>
                        <span className="text-[11px] text-white/50">Route</span>
                      </div>
                      <span
                        className="
                          inline-flex items-center justify-center
                          min-w-[40px] h-7 px-2 rounded-full
                          bg-[#FFA500]/15 border border-[#FFA500]/25
                          text-[#FFA500] font-semibold
                        "
                      >
                        {route.count ?? 0}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          </div>

          {/* BOTTOM ROW: LATEST SHIPMENTS TABLE */}
          <div className="mt-10">
            <SectionCard
              title="Latest Shipments"
              subtitle="Most recently created records."
              rightSlot={
                <PillLink
                  label="View all →"
                  onClick={() => navigate("/shipments")}
                  tone="orange"
                />
              }
            >
              {loading ? (
                <div className="text-sm text-white/60">
                  Loading shipments...
                </div>
              ) : latestShipments.length === 0 ? (
                <div className="text-sm text-white/60">
                  No shipments found yet.
                </div>
              ) : (
                <div className="w-full overflow-x-auto rounded-2xl border border-white/10">
                  <table className="min-w-[760px] w-full text-xs sm:text-sm text-left text-white/80">
                    <thead className="bg-[#071013] border-b border-white/10 text-[11px] sm:text-xs uppercase tracking-[0.16em] text-white/55">
                      <tr>
                        <th className="py-3 px-4">Reference</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Origin</th>
                        <th className="py-3 px-4">Destination</th>
                        <th className="py-3 px-4">Mode</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {latestShipments.map((s) => (
                        <tr
                          key={s._id}
                          className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition"
                          onClick={() => navigate(`/shipments/${s._id}`)}
                        >
                          <td className="py-3 px-4 text-[#FFA500] font-semibold">
                            {s.referenceNo || "—"}
                          </td>
                          <td className="py-3 px-4">
                            {s.customer?.fullname ||
                              s.customer?.name ||
                              s.shipper?.name ||
                              "—"}
                          </td>
                          <td className="py-3 px-4">
                            {s.ports?.originPort || s.origin || "—"}
                          </td>
                          <td className="py-3 px-4">
                            {s.ports?.destinationPort || s.destination || "—"}
                          </td>
                          <td className="py-3 px-4">
                            {s.mode ? String(s.mode) : "—"}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] sm:text-xs bg-white/5 border border-white/10 capitalize">
                              {formatStatusLabel(s.status)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-white/60">
                            {formatIsoDate(s.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
