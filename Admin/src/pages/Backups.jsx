import { useEffect, useMemo, useState } from "react";
import PageShell from "../components/PageShell";
import { adminRequest } from "../requestMethods";

const Pill = ({ children }) => (
  <span className="text-[11px] px-3 py-1 rounded-full bg-[#FFA500]/10 text-[#FFA500] border border-[#FFA500]/25">
    {children}
  </span>
);

const Card = ({ title, subtitle, children, right }) => (
  <div className="rounded-2xl bg-[#0F1720] border border-white/5 shadow-xl">
    <div className="p-5 border-b border-white/5 flex items-start justify-between gap-4">
      <div>
        <h3 className="text-white font-semibold text-[14px]">{title}</h3>
        {subtitle ? (
          <p className="text-gray-400 text-[12px] mt-1">{subtitle}</p>
        ) : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const Button = ({ variant = "primary", ...props }) => {
  const base =
    "rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all active:scale-[0.99]";
  const styles =
    variant === "primary"
      ? "bg-[#FFA500] text-[#0B1118] hover:brightness-110 shadow-[0_10px_30px_rgba(255,165,0,0.18)]"
      : "bg-white/5 text-gray-100 hover:bg-white/10 border border-white/10";
  return (
    <button
      {...props}
      className={`${base} ${styles} ${props.className || ""}`}
    />
  );
};

export default function Backups() {
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [backups, setBackups] = useState([]);

  const pickList = (payload) => {
    // Accept multiple response shapes without breaking
    if (Array.isArray(payload)) return payload;
    if (payload?.data && Array.isArray(payload.data)) return payload.data;
    if (payload?.backups && Array.isArray(payload.backups))
      return payload.backups;
    return [];
  };

  const formatGbDateTime = (val) => {
    if (!val) return "—";
    try {
      const d = new Date(val);
      if (Number.isNaN(d.getTime())) return String(val);
      return d.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(val);
    }
  };

  const formatSize = (bytesOrText) => {
    // If API already returns "48.2 MB", keep it
    if (typeof bytesOrText === "string") return bytesOrText;

    const n = Number(bytesOrText || 0);
    if (!Number.isFinite(n) || n <= 0) return "—";

    const units = ["B", "KB", "MB", "GB", "TB"];
    let i = 0;
    let v = n;
    while (v >= 1024 && i < units.length - 1) {
      v = v / 1024;
      i += 1;
    }
    return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
  };

  const normaliseBackup = (b) => {
    const id = b?._id || b?.id || b?.backupId || b?.key;
    return {
      id,
      createdAt: b?.createdAt || b?.created_at || b?.timestamp || b?.time,
      size: b?.size || b?.sizeText || b?.sizeBytes || b?.bytes,
      type: b?.type || b?.kind || b?.mode || "—",
      status: b?.status || b?.state || "—",
    };
  };

  const fetchBackups = async () => {
    setLoading(true);
    setError("");
    try {
      // Backend mounts backups at /admin/backups, and adminRequest baseURL includes /admin
      const res = await adminRequest.get("/backups");
      const list = pickList(res?.data);
      setBackups(list.map(normaliseBackup).filter((b) => b.id));
    } catch (e) {
      console.error("Backups fetch failed:", e);
      setError("Unable to load backups. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const runBackup = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    setSuccess("");

    try {
      await adminRequest.post("/backups/run", {});
      setSuccess("Backup started successfully.");
      await fetchBackups();
    } catch (e) {
      console.error("Run backup failed:", e);
      setError("Could not run backup. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const downloadBackup = async (backup) => {
    const id = backup?.id;
    if (!id) return;

    setError("");
    setSuccess("");

    try {
      const res = await adminRequest.get(`/backups/${id}/download`, {
        responseType: "blob",
      });

      const blob = new Blob([res.data], {
        type: res.headers?.["content-type"] || "application/octet-stream",
      });

      // Try to read filename from Content-Disposition
      const cd = res.headers?.["content-disposition"] || "";
      const match = /filename="?([^"]+)"?/i.exec(cd);
      const filename = match?.[1] || `backup-${id}.zip`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Download backup failed:", e);
      setError("Could not download backup. Please try again.");
    }
  };

  const latestBackup = useMemo(() => {
    if (!backups.length) return null;
    // Sort newest first using createdAt when possible
    const sorted = [...backups].sort((a, b) => {
      const ad = new Date(a.createdAt || 0).getTime();
      const bd = new Date(b.createdAt || 0).getTime();
      return bd - ad;
    });
    return sorted[0];
  }, [backups]);

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-[#0B1118]">
      <PageShell
        title="Backups"
        subtitle="Protect your data. Export snapshots and keep recovery clean."
        right={<Pill>Encrypted</Pill>}
      >
        {error ? (
          <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-200">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-[13px] text-emerald-200">
            {success}
          </div>
        ) : null}

        {loading ? (
          <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[13px] text-gray-200">
            Loading backups…
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card
            title="Backup health"
            subtitle="Last successful backup and retention policy"
            right={<Pill>Healthy</Pill>}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-gray-400">Last backup</span>
                <span className="text-gray-100 font-semibold">
                  {latestBackup
                    ? formatGbDateTime(latestBackup.createdAt)
                    : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-gray-400">Retention</span>
                <span className="text-gray-100 font-semibold">30 days</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-gray-400">Storage region</span>
                <span className="text-gray-100 font-semibold">EU</span>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Button onClick={runBackup} disabled={busy}>
                  {busy ? "Running backup..." : "Run manual backup"}
                </Button>

                <Button
                  variant="ghost"
                  disabled={!latestBackup}
                  onClick={() => latestBackup && downloadBackup(latestBackup)}
                >
                  Download latest snapshot
                </Button>
              </div>
            </div>
          </Card>

          <div className="lg:col-span-2">
            <Card
              title="Backup history"
              subtitle="Recent snapshots"
              right={<Button variant="ghost">Export CSV</Button>}
            >
              <div className="overflow-x-auto">
                <table className="min-w-[720px] w-full text-left">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-[0.18em] text-gray-400">
                      <th className="py-3 pr-4">Created</th>
                      <th className="py-3 pr-4">Type</th>
                      <th className="py-3 pr-4">Size</th>
                      <th className="py-3 pr-4">Status</th>
                      <th className="py-3">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="text-[13px]">
                    {backups.map((b) => (
                      <tr key={b.id} className="border-t border-white/5">
                        <td className="py-3 pr-4 text-gray-100">
                          {formatGbDateTime(b.createdAt)}
                        </td>
                        <td className="py-3 pr-4 text-gray-300">{b.type}</td>
                        <td className="py-3 pr-4 text-gray-300">
                          {formatSize(b.size)}
                        </td>
                        <td className="py-3 pr-4">
                          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-200 text-[12px]">
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              onClick={() => downloadBackup(b)}
                            >
                              Download
                            </Button>

                            <Button
                              variant="ghost"
                              disabled
                              title="Restore is not implemented in the backend yet."
                            >
                              Restore
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {!loading && backups.length === 0 ? (
                      <tr className="border-t border-white/5">
                        <td
                          colSpan={5}
                          className="py-6 text-center text-gray-400 text-[13px]"
                        >
                          No backups yet.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>

              <p className="text-[11px] text-gray-500 mt-4">
                Restore should be admin-protected (confirm modal + audit log).
              </p>
            </Card>
          </div>
        </div>
      </PageShell>
    </div>
  );
}
