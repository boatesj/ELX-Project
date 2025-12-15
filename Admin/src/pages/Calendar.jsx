import { useMemo, useState } from "react";
import PageShell from "../components/PageShell";

const Chip = ({ children }) => (
  <span className="text-[11px] px-3 py-1 rounded-full bg-white/5 text-gray-200 border border-white/10">
    {children}
  </span>
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

export default function Calendar() {
  const [view, setView] = useState("agenda");

  const events = useMemo(
    () => [
      {
        id: "e1",
        date: "2025-12-16",
        time: "09:00",
        title: "Shipment intake (warehouse) — LCL",
        meta: "Docs check + packing list verification",
        tag: "Operations",
      },
      {
        id: "e2",
        date: "2025-12-18",
        time: "14:30",
        title: "Vehicle collection window",
        meta: "Confirm VIN + condition photos",
        tag: "RoRo",
      },
      {
        id: "e3",
        date: "2025-12-21",
        time: "11:00",
        title: "Cut-off: Documentation deadline",
        meta: "V5C, ID, invoice, consignee details",
        tag: "Compliance",
      },
      {
        id: "e4",
        date: "2025-12-24",
        time: "08:00",
        title: "ETD: Sailing scheduled",
        meta: "Port handover confirmation",
        tag: "Sea freight",
      },
    ],
    []
  );

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-[#0B1118]">
      <PageShell
        title="Calendar"
        subtitle="Operational scheduling for cut-offs, ETDs/ETAs, collections, and document deadlines."
        right={
          <div className="flex gap-2">
            <Button
              variant={view === "agenda" ? "primary" : "ghost"}
              onClick={() => setView("agenda")}
            >
              Agenda
            </Button>
            <Button
              variant={view === "milestones" ? "primary" : "ghost"}
              onClick={() => setView("milestones")}
            >
              Milestones
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <Card
              title={view === "agenda" ? "Upcoming agenda" : "Key milestones"}
              subtitle="Designed for mobile speed and operational clarity"
              right={<Chip>Next 14 days</Chip>}
            >
              <div className="space-y-3">
                {events.map((e) => (
                  <div
                    key={e.id}
                    className="p-4 rounded-2xl bg-[#0B1118] border border-white/10 hover:border-[#FFA500]/25 transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[#FFA500] text-[12px] font-semibold">
                            {e.date}
                          </span>
                          <span className="text-gray-500 text-[12px]">•</span>
                          <span className="text-gray-200 text-[12px]">
                            {e.time}
                          </span>
                          <span className="ml-2">
                            <Chip>{e.tag}</Chip>
                          </span>
                        </div>
                        <p className="text-white font-semibold text-[14px] mt-2">
                          {e.title}
                        </p>
                        <p className="text-gray-400 text-[12px] mt-1">
                          {e.meta}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button className="whitespace-nowrap">Open</Button>
                        <Button variant="primary" className="whitespace-nowrap">
                          Create task
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-gray-500 mt-4">
                Next step: pull ETD/ETA + cut-off fields from shipments and
                auto-generate calendar events.
              </p>
            </Card>
          </div>

          <Card title="Quick actions" subtitle="Move like a pro">
            <div className="space-y-2">
              <Button variant="primary" className="w-full">
                Add event
              </Button>
              <Button className="w-full">Sync from shipments</Button>
              <Button className="w-full">Export iCal</Button>
              <Button className="w-full">Set reminders</Button>
            </div>

            <div className="mt-5 p-4 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-gray-100 text-[13px] font-semibold">Policy</p>
              <p className="text-gray-400 text-[12px] mt-1">
                Any event creation should write to{" "}
                <span className="text-[#FFA500]">All logs</span> for audit.
              </p>
            </div>
          </Card>
        </div>
      </PageShell>
    </div>
  );
}
