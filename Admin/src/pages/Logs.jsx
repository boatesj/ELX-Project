import { useMemo, useState } from "react";
import PageShell from "../components/PageShell";

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

export default function Logs() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");

  const logs = useMemo(
    () => [
      {
        id: "l1",
        ts: "2025-12-14 18:22",
        type: "shipment",
        actor: "Ellcworth Admin",
        action: "Updated status → Sailed",
        ref: "ELX-LCL-251211-0001",
      },
      {
        id: "l2",
        ts: "2025-12-14 10:05",
        type: "user",
        actor: "Ellcworth Admin",
        action: "Created user",
        ref: "ellcworth.admin@example.com",
      },
      {
        id: "l3",
        ts: "2025-12-13 16:40",
        type: "backup",
        actor: "System",
        action: "Auto backup completed",
        ref: "Snapshot b2",
      },
      {
        id: "l4",
        ts: "2025-12-12 09:10",
        type: "invoice",
        actor: "Ellcworth Admin",
        action: "Generated invoice",
        ref: "INV-2025-1212-004",
      },
    ],
    []
  );

  const filtered = logs.filter((l) => {
    const matchType = type === "all" ? true : l.type === type;
    const blob =
      `${l.ts} ${l.type} ${l.actor} ${l.action} ${l.ref}`.toLowerCase();
    const matchQ = blob.includes(q.toLowerCase());
    return matchType && matchQ;
  });

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-[#0B1118]">
      <PageShell
        title="All logs"
        subtitle="Audit trail for admin actions, exports, payments, backups and shipment changes."
        right={<Button variant="primary">Export</Button>}
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
                <option value="shipment">Shipment</option>
                <option value="user">User</option>
                <option value="invoice">Invoice</option>
                <option value="backup">Backup</option>
              </Select>
              <div className="flex gap-2">
                <Button className="w-full">Clear</Button>
                <Button className="w-full" variant="primary">
                  Apply
                </Button>
              </div>
            </div>
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
                {filtered.map((l) => (
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
              </tbody>
            </table>

            <p className="text-[11px] text-gray-500 mt-4">
              Next step: wire this table to a `/logs` endpoint and paginate
              server-side.
            </p>
          </div>
        </div>
      </PageShell>
    </div>
  );
}
