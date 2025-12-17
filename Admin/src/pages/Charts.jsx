import { useEffect, useMemo, useState, useCallback } from "react";
import PageShell from "../components/PageShell";
import { PieChart } from "@mui/x-charts/PieChart";
import { BarChart } from "@mui/x-charts/BarChart";
import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function apiGet(path) {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("token");

  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `GET ${path} failed (${res.status}): ${text || res.statusText}`
    );
  }

  return res.json();
}

const Panel = ({ title, subtitle, children }) => (
  <div className="rounded-2xl bg-[#0F1720] border border-white/5 shadow-xl">
    <div className="p-5 border-b border-white/5">
      <h3 className="text-white font-semibold text-[14px]">{title}</h3>
      {subtitle ? (
        <p className="text-gray-400 text-[12px] mt-1">{subtitle}</p>
      ) : null}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const titleCaseStatus = (s) => {
  const map = {
    pending: "Pending",
    booked: "Booked",
    at_origin_yard: "At origin yard",
    loaded: "Loaded",
    sailed: "Sailed",
    arrived: "Arrived",
    cleared: "Cleared",
    delivered: "Delivered",
    cancelled: "Cancelled",
    unknown: "Unknown",
  };
  return map[String(s || "unknown")] || String(s || "Unknown");
};

export default function Charts() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [dashboard, setDashboard] = useState(null); // <-- this will be the inner "data" object

  // Filters use RAW backend enums (lowercase)
  const [activeStatus, setActiveStatus] = useState(null); // e.g. "booked"
  const [activeMonth, setActiveMonth] = useState(null); // e.g. "2025-12"

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await apiGet("/shipments/dashboard");
      setDashboard(res?.data || null); // ✅ correct for your backend shape
    } catch (e) {
      setErr(e?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const statusCounts = useMemo(() => {
    // backend will provide this once you add it; otherwise fall back to byStatus
    const sc = dashboard?.statusCounts || dashboard?.byStatus;
    return sc && typeof sc === "object" ? sc : {};
  }, [dashboard]);

  const monthlyBookings = useMemo(() => {
    const mb = dashboard?.monthlyBookings;
    return Array.isArray(mb) ? mb : [];
  }, [dashboard]);

  const rows = useMemo(() => {
    return Array.isArray(dashboard?.rows) ? dashboard.rows : [];
  }, [dashboard]);

  const monthLabels = useMemo(() => {
    const toShort = (yyyyMM) => {
      const [y, m] = String(yyyyMM).split("-");
      const dt = new Date(Number(y), Number(m) - 1, 1);
      return dt.toLocaleString("en-GB", { month: "short" });
    };

    return monthlyBookings.map((x) => ({
      key: x.month,
      label: toShort(x.month),
      count: Number(x.count || 0),
    }));
  }, [monthlyBookings]);

  const pieData = useMemo(() => {
    // stable ordering for lifecycle (raw enums)
    const preferred = [
      "booked",
      "sailed",
      "arrived",
      "delivered",
      "pending",
      "loaded",
      "cleared",
      "cancelled",
    ];

    const keys = Object.keys(statusCounts || {});
    const ordered = [
      ...preferred.filter((k) => keys.includes(k)),
      ...keys.filter((k) => !preferred.includes(k)),
    ];

    return ordered.map((raw, idx) => ({
      id: idx,
      raw,
      value: Number(statusCounts[raw] || 0),
      label: titleCaseStatus(raw),
    }));
  }, [statusCounts]);

  const filteredRows = useMemo(() => {
    if (!rows.length) return [];
    return rows.filter((r) => {
      const statusOk = activeStatus ? String(r?.status) === activeStatus : true;

      const monthOk = activeMonth
        ? (() => {
            const dt = r?.createdAt ? new Date(r.createdAt) : null;
            if (!dt || Number.isNaN(dt.getTime())) return false;
            const key = `${dt.getFullYear()}-${String(
              dt.getMonth() + 1
            ).padStart(2, "0")}`;
            return key === activeMonth;
          })()
        : true;

      return statusOk && monthOk;
    });
  }, [rows, activeStatus, activeMonth]);

  const clearFilters = () => {
    setActiveStatus(null);
    setActiveMonth(null);
  };

  const kpis = useMemo(() => {
    const data = filteredRows.length ? filteredRows : rows;
    if (!data.length) {
      return { avgToBooked: "—", avgToSailed: "—", avgToDelivered: "—" };
    }

    const now = Date.now();

    const avgDaysSinceCreatedForStatus = (statusEnum) => {
      const subset = data.filter(
        (r) => String(r?.status) === statusEnum && r?.createdAt
      );
      if (!subset.length) return null;

      const days = subset
        .map((r) => {
          const ms = new Date(r.createdAt).getTime();
          if (Number.isNaN(ms)) return null;
          return (now - ms) / (1000 * 60 * 60 * 24);
        })
        .filter((x) => typeof x === "number");

      if (!days.length) return null;
      return days.reduce((a, b) => a + b, 0) / days.length;
    };

    const fmt = (n) => (typeof n === "number" ? n.toFixed(1) : "—");

    return {
      avgToBooked: fmt(avgDaysSinceCreatedForStatus("booked")),
      avgToSailed: fmt(avgDaysSinceCreatedForStatus("sailed")),
      avgToDelivered: fmt(avgDaysSinceCreatedForStatus("delivered")),
    };
  }, [rows, filteredRows]);

  const handlePieClick = (event, item) => {
    const idx = item?.dataIndex;
    const clicked = typeof idx === "number" ? pieData[idx]?.raw : null;
    if (!clicked) return;
    setActiveStatus((prev) => (prev === clicked ? null : clicked));
  };

  const handleBarClick = (event, item) => {
    const idx = item?.dataIndex;
    const clicked = typeof idx === "number" ? monthLabels[idx]?.key : null;
    if (!clicked) return;
    setActiveMonth((prev) => (prev === clicked ? null : clicked));
  };

  const exportCSV = () => {
    const data = filteredRows.length ? filteredRows : rows;
    if (!data.length) return;

    const flat = data.map((r) => ({
      referenceNo: r?.referenceNo ?? "",
      status: titleCaseStatus(r?.status),
      createdAt: r?.createdAt ? new Date(r.createdAt).toISOString() : "",
      mode: r?.mode ?? "",
      origin: r?.origin ?? "",
      destination: r?.destination ?? "",
      shipperName: r?.shipperName ?? "",
      consigneeName: r?.consigneeName ?? "",
      amount: r?.amount ?? 0,
      currency: r?.currency ?? "GBP",
    }));

    const csv = Papa.unparse(flat);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const stamp = new Date().toISOString().slice(0, 10);
    const parts = ["elx_shipments", stamp];
    if (activeStatus) parts.push(activeStatus);
    if (activeMonth) parts.push(activeMonth);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${parts.join("_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const data = filteredRows.length ? filteredRows : rows;
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    const title = "Ellcworth Express — Charts Export";
    const sub = [
      activeStatus ? `Status: ${titleCaseStatus(activeStatus)}` : "Status: All",
      activeMonth ? `Month: ${activeMonth}` : "Month: All",
      `Exported: ${new Date().toLocaleString("en-GB")}`,
    ].join(" • ");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(title, 40, 50);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(sub, 40, 70);

    doc.setFontSize(10);
    doc.text("KPIs (proxy):", 40, 95);
    doc.text(`Avg days (Booked): ${kpis.avgToBooked}`, 40, 112);
    doc.text(`Avg days (Sailed): ${kpis.avgToSailed}`, 40, 129);
    doc.text(`Avg days (Delivered): ${kpis.avgToDelivered}`, 40, 146);

    autoTable(doc, {
      startY: 170,
      head: [
        [
          "Reference",
          "Status",
          "Created",
          "Mode",
          "Origin",
          "Destination",
          "Amount",
        ],
      ],
      body: (data || [])
        .slice(0, 45)
        .map((r) => [
          r?.referenceNo ?? "",
          titleCaseStatus(r?.status),
          r?.createdAt ? new Date(r.createdAt).toLocaleDateString("en-GB") : "",
          r?.mode ?? "",
          r?.origin ?? "",
          r?.destination ?? "",
          `${r?.currency ?? "GBP"} ${Number(r?.amount ?? 0).toFixed(2)}`,
        ]),
      styles: { fontSize: 8 },
      headStyles: { fontSize: 8 },
      margin: { left: 40, right: 40 },
    });

    const stamp = new Date().toISOString().slice(0, 10);
    const parts = ["elx_charts", stamp];
    if (activeStatus) parts.push(activeStatus);
    if (activeMonth) parts.push(activeMonth);
    doc.save(`${parts.join("_")}.pdf`);
  };

  const statusBadge = (rawStatus) => {
    const active = activeStatus === rawStatus;
    return (
      <button
        key={rawStatus}
        onClick={() =>
          setActiveStatus((prev) => (prev === rawStatus ? null : rawStatus))
        }
        className={[
          "px-3 py-1 rounded-full text-[12px] border transition",
          active
            ? "bg-[#FFA500] text-[#0B1118] border-[#FFA500]"
            : "bg-white/5 text-gray-200 border-white/10 hover:bg-white/10",
        ].join(" ")}
        title="Toggle filter"
        type="button"
      >
        {titleCaseStatus(rawStatus)}
      </button>
    );
  };

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-[#0B1118] elx-charts-page">
      <style>{`
        .elx-charts-page svg text { fill: #E5E7EB !important; }
        .elx-charts-page [class*="MuiCharts"] text { fill: #E5E7EB !important; }
        .elx-charts-page [class*="MuiChartsAxis"] text { fill: #CBD5E1 !important; }
        .elx-charts-page .MuiChartsLegend-label,
        .elx-charts-page [class*="MuiChartsLegend"] .MuiChartsLegend-label {
          fill: #E5E7EB !important;
          color: #E5E7EB !important;
        }
        body .MuiChartsLegend-label,
        body [class*="MuiChartsLegend"] .MuiChartsLegend-label {
          fill: #E5E7EB !important;
          color: #E5E7EB !important;
        }
        .elx-charts-page [class*="MuiChartsAxis-line"],
        .elx-charts-page [class*="MuiChartsAxis-tick"] {
          stroke: rgba(255,255,255,0.28) !important;
        }
        .elx-charts-page [class*="MuiChartsGrid-line"] {
          stroke: rgba(255,255,255,0.10) !important;
        }
      `}</style>

      <PageShell
        title="Charts"
        subtitle="Operational insight: statuses, bookings trend, and exportable reporting."
      >
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12px] text-gray-400 mr-1">Filters:</span>

            {Object.keys(statusCounts || {}).length
              ? Object.keys(statusCounts)
                  .slice(0, 8)
                  .map((s) => statusBadge(s))
              : null}

            {activeStatus || activeMonth ? (
              <button
                onClick={clearFilters}
                className="px-3 py-1 rounded-full text-[12px] bg-white/5 text-gray-200 border border-white/10 hover:bg-white/10"
                type="button"
              >
                Clear
              </button>
            ) : null}
          </div>

          <div className="flex gap-2">
            <button
              onClick={fetchDashboard}
              className="rounded-xl px-4 py-2.5 text-[13px] font-semibold bg-white/5 text-gray-100 hover:bg-white/10 border border-white/10"
              type="button"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-[#0F1720] border border-white/5 p-6 text-gray-300">
            Loading charts…
          </div>
        ) : err ? (
          <div className="rounded-2xl bg-[#0F1720] border border-white/5 p-6">
            <p className="text-red-300 text-[13px] font-semibold">
              Couldn’t load charts
            </p>
            <p className="text-gray-400 text-[12px] mt-1">{err}</p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={fetchDashboard}
                className="rounded-xl px-4 py-2.5 text-[13px] font-semibold bg-[#FFA500] text-[#0B1118] hover:brightness-110"
                type="button"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Panel
              title="Shipments by status"
              subtitle={
                activeStatus
                  ? `Filtered: ${titleCaseStatus(activeStatus)}`
                  : "Click a slice to filter"
              }
            >
              <div className="w-full overflow-x-auto">
                <div className="min-w-[340px]">
                  <PieChart
                    height={260}
                    series={[
                      {
                        data: pieData.map(({ id, value, label }) => ({
                          id,
                          value,
                          label,
                        })),
                        innerRadius: 55,
                        outerRadius: 100,
                        paddingAngle: 2,
                        cornerRadius: 4,
                      },
                    ]}
                    onItemClick={handlePieClick}
                  />
                </div>
              </div>

              <p className="text-[11px] text-gray-500 mt-3">
                Data source:{" "}
                <span className="text-gray-300">/shipments/dashboard</span>
              </p>
            </Panel>

            <Panel
              title="Monthly bookings"
              subtitle={
                activeMonth
                  ? `Filtered: ${activeMonth}`
                  : "Click a bar to filter"
              }
            >
              <div className="w-full overflow-x-auto">
                <div className="min-w-[420px]">
                  <BarChart
                    height={260}
                    xAxis={[
                      {
                        scaleType: "band",
                        data: monthLabels.map((m) => m.label),
                      },
                    ]}
                    series={[
                      {
                        data: monthLabels.map((m) => m.count),
                        label: "Bookings",
                      },
                    ]}
                    onItemClick={handleBarClick}
                  />
                </div>
              </div>

              <p className="text-[11px] text-gray-500 mt-3">
                Last 6 months based on{" "}
                <span className="text-gray-300">createdAt</span>.
              </p>
            </Panel>

            <Panel
              title="Throughput health"
              subtitle="Operational KPIs (proxy until timestamps exist)"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  ["Avg. days (Booked)", kpis.avgToBooked],
                  ["Avg. days (Sailed)", kpis.avgToSailed],
                  ["Avg. days (Delivered)", kpis.avgToDelivered],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="rounded-xl bg-[#0B1118] border border-white/10 p-4"
                  >
                    <p className="text-[11px] text-gray-400">{k}</p>
                    <p className="text-white font-semibold text-xl mt-1">
                      {v}
                      <span className="text-[12px] text-gray-400 ml-1">
                        days
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Exports" subtitle="Real exports (wired)">
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={exportPDF}
                  disabled={!rows.length && !filteredRows.length}
                  className="rounded-xl px-4 py-2.5 text-[13px] font-semibold bg-[#FFA500] text-[#0B1118] hover:brightness-110 disabled:opacity-50 disabled:hover:brightness-100"
                  type="button"
                >
                  Export PDF
                </button>

                <button
                  onClick={exportCSV}
                  disabled={!rows.length && !filteredRows.length}
                  className="rounded-xl px-4 py-2.5 text-[13px] font-semibold bg-white/5 text-gray-100 hover:bg-white/10 border border-white/10 disabled:opacity-50"
                  type="button"
                >
                  Export CSV
                </button>
              </div>

              <p className="text-[11px] text-gray-500 mt-3">
                Exports include current filters. Amount should be the sum of
                charge lines returned by backend.
              </p>
            </Panel>
          </div>
        )}
      </PageShell>
    </div>
  );
}
