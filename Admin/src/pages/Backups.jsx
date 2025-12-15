import { useMemo, useState } from "react";
import PageShell from "../components/PageShell";

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

  const backups = useMemo(
    () => [
      {
        id: "b1",
        createdAt: "2025-12-14 23:05",
        size: "48.2 MB",
        type: "Auto",
        status: "Success",
      },
      {
        id: "b2",
        createdAt: "2025-12-13 23:05",
        size: "47.9 MB",
        type: "Auto",
        status: "Success",
      },
      {
        id: "b3",
        createdAt: "2025-12-12 23:05",
        size: "47.6 MB",
        type: "Auto",
        status: "Success",
      },
      {
        id: "b4",
        createdAt: "2025-12-12 10:21",
        size: "47.6 MB",
        type: "Manual",
        status: "Success",
      },
    ],
    []
  );

  const runBackup = async () => {
    setBusy(true);
    // hook this to your API later
    setTimeout(() => setBusy(false), 900);
  };

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-[#0B1118]">
      <PageShell
        title="Backups"
        subtitle="Protect your data. Export snapshots and keep recovery clean."
        right={<Pill>Encrypted</Pill>}
      >
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
                  2025-12-14 23:05
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
                <Button variant="ghost">Download latest snapshot</Button>
              </div>
            </div>
          </Card>

          <div className="lg:col-span-2">
            <Card
              title="Backup history"
              subtitle="Recent snapshots (hook to your API later)"
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
                          {b.createdAt}
                        </td>
                        <td className="py-3 pr-4 text-gray-300">{b.type}</td>
                        <td className="py-3 pr-4 text-gray-300">{b.size}</td>
                        <td className="py-3 pr-4">
                          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-200 text-[12px]">
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <Button variant="ghost">Download</Button>
                            <Button variant="ghost">Restore</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
