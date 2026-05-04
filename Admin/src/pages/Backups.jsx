import { useEffect, useState, useCallback } from "react";
import PageShell from "../components/PageShell";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const BACKUPS_API = `${API_BASE_URL}/api/v1/admin/backups`;

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function formatBytes(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const Pill = ({ children, color = "amber" }) => {
  const colors = {
    amber: "bg-[#FFA500]/10 text-[#FFA500] border-[#FFA500]/25",
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
    red:   "bg-red-500/10 text-red-400 border-red-500/25",
    blue:  "bg-sky-500/10 text-sky-400 border-sky-500/25",
  };
  return (
    <span className={`text-[11px] px-3 py-1 rounded-full border font-semibold ${colors[color] || colors.amber}`}>
      {children}
    </span>
  );
};

const StatusPill = ({ status }) => {
  if (status === "Success") return <Pill color="green">Success</Pill>;
  if (status === "Failed")  return <Pill color="red">Failed</Pill>;
  if (status === "Running") return <Pill color="blue">Running</Pill>;
  return <Pill>{status}</Pill>;
};

const Card = ({ title, subtitle, children, right }) => (
  <div className="rounded-2xl bg-[#0F1720] border border-white/5 shadow-xl">
    <div className="p-5 border-b border-white/5 flex items-start justify-between gap-4">
      <div>
        <h3 className="text-white font-semibold text-[14px]">{title}</h3>
        {subtitle && <p className="text-gray-400 text-[12px] mt-1">{subtitle}</p>}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const Button = ({ variant = "primary", loading, children, ...props }) => {
  const base = "rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2";
  const styles = variant === "primary"
    ? "bg-[#FFA500] text-[#0B1118] hover:brightness-110 shadow-[0_10px_30px_rgba(255,165,0,0.18)]"
    : "bg-white/5 text-gray-100 hover:bg-white/10 border border-white/10";
  return (
    <button {...props} className={`${base} ${styles} ${props.className || ""}`}>
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {children}
    </button>
  );
};

export default function Backups() {
  const [jobs, setJobs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError]     = useState(null);
  const [toast, setToast]     = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(BACKUPS_API, { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to load backups");
      const data = await res.json();
      setJobs(data);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handleRunBackup = async () => {
    try {
      setRunning(true);
      const res = await fetch(`${BACKUPS_API}/run`, {
        method: "POST",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Backup failed");
      showToast("Backup completed successfully");
      await fetchJobs();
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setRunning(false);
    }
  };

  const handleDownload = async (job) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKUPS_API}/${job._id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = job.fileName || "backup.zip";
      a.click();
      URL.revokeObjectURL(url);
      showToast("Download started");
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const lastSuccess = jobs.find(j => j.status === "Success");

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-[#0B1118]">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 rounded-xl px-4 py-3 text-[13px] font-semibold shadow-xl border ${
          toast.type === "error"
            ? "bg-red-900/80 border-red-500/30 text-red-200"
            : "bg-emerald-900/80 border-emerald-500/30 text-emerald-200"
        }`}>
          {toast.msg}
        </div>
      )}

      <PageShell
        title="Backups"
        subtitle="On-demand MongoDB backup — download a full snapshot of all collections."
        right={<Pill>Live</Pill>}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Controls */}
          <Card
            title="Backup controls"
            subtitle="Run a manual backup and download the snapshot"
            right={lastSuccess ? <Pill color="green">Last: {formatDate(lastSuccess.createdAt)}</Pill> : <Pill color="amber">No backups yet</Pill>}
          >
            <div className="space-y-3">
              <div className="rounded-2xl bg-[#0B1118] border border-white/10 p-4">
                <p className="text-gray-100 text-[13px] font-semibold">What gets backed up</p>
                <p className="text-gray-400 text-[12px] mt-2">
                  All MongoDB collections — shipments, users, subscribers, campaigns, logs — exported as JSON and zipped into a single downloadable file.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Button
                  onClick={handleRunBackup}
                  disabled={running}
                  loading={running}
                >
                  {running ? "Running backup..." : "Run manual backup"}
                </Button>

                {lastSuccess && (
                  <Button
                    variant="ghost"
                    onClick={() => handleDownload(lastSuccess)}
                  >
                    Download latest snapshot
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* History */}
          <div className="lg:col-span-2">
            <Card
              title="Backup history"
              subtitle="Last 50 backup jobs"
              right={
                <button
                  onClick={fetchJobs}
                  className="text-[11px] text-gray-400 hover:text-white transition px-3 py-1 rounded-xl border border-white/10 hover:bg-white/5"
                >
                  Refresh
                </button>
              }
            >
              {loading ? (
                <p className="text-gray-400 text-[13px]">Loading...</p>
              ) : error ? (
                <p className="text-red-400 text-[13px]">{error}</p>
              ) : jobs.length === 0 ? (
                <p className="text-gray-400 text-[13px]">No backups yet. Run your first backup above.</p>
              ) : (
                <div className="space-y-2">
                  {jobs.map((job) => (
                    <div
                      key={job._id}
                      className="rounded-2xl bg-[#0B1118] border border-white/10 p-4 flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <p className="text-gray-100 text-[13px] font-semibold truncate">
                          {job.fileName || "Unnamed backup"}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-gray-500 text-[11px]">{formatDate(job.createdAt)}</span>
                          <span className="text-gray-500 text-[11px]">{formatBytes(job.fileSizeBytes)}</span>
                        </div>
                        {job.error && (
                          <p className="text-red-400 text-[11px] mt-1">{job.error}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <StatusPill status={job.status} />
                        {job.status === "Success" && job.fileName && (
                          <button
                            onClick={() => handleDownload(job)}
                            className="text-[11px] font-semibold text-[#FFA500] hover:opacity-80 transition"
                          >
                            Download
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </PageShell>
    </div>
  );
}
