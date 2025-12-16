import { useEffect, useMemo, useState } from "react";
import PageShell from "../components/PageShell";
import { adminRequest } from "../requestMethods";

const Input = (props) => (
  <input
    {...props}
    className={[
      "w-full rounded-xl bg-[#0B1118] border border-white/10",
      "px-3 py-2.5 text-[13px] text-gray-100 placeholder:text-gray-500",
      "outline-none focus:border-[#FFA500]/60 focus:ring-2 focus:ring-[#FFA500]/20",
      props.className || "",
    ].join(" ")}
  />
);

const Select = (props) => (
  <select
    {...props}
    className={[
      "w-full rounded-xl bg-[#0B1118] border border-white/10",
      "px-3 py-2.5 text-[13px] text-gray-100",
      "outline-none focus:border-[#FFA500]/60 focus:ring-2 focus:ring-[#FFA500]/20",
      props.className || "",
    ].join(" ")}
  />
);

const Button = ({ variant = "ghost", ...props }) => {
  const base =
    "rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all active:scale-[0.99]";
  const styles =
    variant === "primary"
      ? "bg-[#FFA500] text-[#0B1118] hover:brightness-110"
      : "bg-white/5 text-gray-100 hover:bg-white/10 border border-white/10";
  return (
    <button
      {...props}
      className={`${base} ${styles} ${props.className || ""}`}
    />
  );
};

const fmtTs = (isoOrDate) => {
  if (!isoOrDate) return "";
  try {
    const d = new Date(isoOrDate);
    if (Number.isNaN(d.getTime())) return String(isoOrDate);
    // Keep a compact “YYYY-MM-DD HH:mm” feel
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate()
    )} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return String(isoOrDate);
  }
};

export default function Logs() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");

  // server-side paging
  const [page, setPage] = useState(1);
  const limit = 20;

  // data
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  // UX
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const fetchLogs = async ({ pageOverride } = {}) => {
    setErr("");
    setLoading(true);
    try {
      const p = pageOverride ?? page;
      const res = await adminRequest.get("/logs", {
        params: { q, type, page: p, limit },
      });

      const data = res?.data || {};
      setItems(Array.isArray(data.items) ? data.items : []);
      setTotal(Number.isFinite(data.total) ? data.total : 0);
      setPage(Number.isFinite(data.page) ? data.page : p);
    } catch (e) {
      setErr(
        e?.response?.data?.message ||
          "Failed to load logs (are you logged in as admin?)"
      );
    } finally {
      setLoading(false);
    }
  };

  // initial load
  useEffect(() => {
    fetchLogs({ pageOverride: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPages = useMemo(() => {
    return Math.max(Math.ceil((total || 0) / limit), 1);
  }, [total, limit]);

  const rows = useMemo(() => {
    // Keep the UI the same fields you display
    return items.map((l) => ({
      id: l._id,
      ts: fmtTs(l.createdAt),
      type: l.type || "",
      actor: l.actorId || "",
      action: l.action || "",
      ref: l.ref || "",
    }));
  }, [items]);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const exportJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      filters: { q, type, page, limit },
      total,
      items,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ellcworth-logs-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-[#0B1118]">
      <PageShell
        title="All logs"
        subtitle="Audit trail for admin actions, exports, payments, backups and shipment changes."
        right={
          <Button variant="primary" onClick={exportJson} disabled={loading}>
            Export
          </Button>
        }
      >
        <div className="rounded-2xl bg-[#0F1720] border border-white/5 shadow-xl">
          <div className="p-5 border-b border-white/5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search logs (shipment ref, email, action...)"
              />
              <Select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="all">All types</option>
                <option value="auth">Auth</option>
                <option value="settings">Settings</option>
                <option value="shipment">Shipment</option>
                <option value="user">User</option>
                <option value="invoice">Invoice</option>
                <option value="backup">Backup</option>
                <option value="calendar">Calendar</option>
                <option value="analytics">Analytics</option>
              </Select>
              <div className="flex gap-2">
                <Button
                  className="w-full"
                  onClick={() => {
                    setQ("");
                    setType("all");
                    setPage(1);
                    // Fetch with cleared filters
                    setTimeout(() => fetchLogs({ pageOverride: 1 }), 0);
                  }}
                  disabled={loading}
                >
                  Clear
                </Button>
                <Button
                  className="w-full"
                  variant="primary"
                  onClick={() => fetchLogs({ pageOverride: 1 })}
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Apply"}
                </Button>
              </div>
            </div>

            {err ? (
              <div className="mt-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 text-[12px]">
                {err}
              </div>
            ) : null}
          </div>

          <div className="p-5 overflow-x-auto">
            <table className="min-w-[860px] w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-[0.18em] text-gray-400">
                  <th className="py-3 pr-4">Timestamp</th>
                  <th className="py-3 pr-4">Type</th>
                  <th className="py-3 pr-4">Actor</th>
                  <th className="py-3 pr-4">Action</th>
                  <th className="py-3">Reference</th>
                </tr>
              </thead>
              <tbody className="text-[13px]">
                {rows.map((l) => (
                  <tr key={l.id} className="border-t border-white/5">
                    <td className="py-3 pr-4 text-gray-100">{l.ts}</td>
                    <td className="py-3 pr-4">
                      <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-200 text-[12px]">
                        {l.type}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-300">{l.actor}</td>
                    <td className="py-3 pr-4 text-gray-100">{l.action}</td>
                    <td className="py-3 text-gray-300">{l.ref}</td>
                  </tr>
                ))}

                {!loading && rows.length === 0 ? (
                  <tr className="border-t border-white/5">
                    <td className="py-6 text-gray-400" colSpan={5}>
                      No logs found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>

            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-[11px] text-gray-500">
                Showing page {page} of {totalPages} • Total {total}
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    if (!canPrev) return;
                    const nextPage = page - 1;
                    setPage(nextPage);
                    fetchLogs({ pageOverride: nextPage });
                  }}
                  disabled={!canPrev || loading}
                >
                  Prev
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    if (!canNext) return;
                    const nextPage = page + 1;
                    setPage(nextPage);
                    fetchLogs({ pageOverride: nextPage });
                  }}
                  disabled={!canNext || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PageShell>
    </div>
  );
}
