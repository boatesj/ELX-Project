import PageShell from "../components/PageShell";
import { PieChart } from "@mui/x-charts/PieChart";
import { BarChart } from "@mui/x-charts/BarChart";

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

export default function Charts() {
  return (
    <div className="min-h-[calc(100dvh-64px)] bg-[#0B1118]">
      <PageShell
        title="Charts"
        subtitle="Operational insight: statuses, revenue trend, and throughput."
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel title="Shipments by status" subtitle="Snapshot view">
            <div className="w-full overflow-x-auto">
              <div className="min-w-[340px]">
                <PieChart
                  height={260}
                  series={[
                    {
                      data: [
                        { id: 0, value: 18, label: "Booked" },
                        { id: 1, value: 11, label: "Sailed" },
                        { id: 2, value: 7, label: "Arrived" },
                        { id: 3, value: 5, label: "Delivered" },
                      ],
                      innerRadius: 55,
                      outerRadius: 100,
                      paddingAngle: 2,
                      cornerRadius: 4,
                    },
                  ]}
                />
              </div>
            </div>
            <p className="text-[11px] text-gray-500 mt-3">
              Wire this to your `/shipments/dashboard` endpoint when ready.
            </p>
          </Panel>

          <Panel title="Monthly bookings" subtitle="Trend over last 6 months">
            <div className="w-full overflow-x-auto">
              <div className="min-w-[420px]">
                <BarChart
                  height={260}
                  xAxis={[
                    {
                      scaleType: "band",
                      data: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                    },
                  ]}
                  series={[
                    { data: [22, 28, 19, 31, 26, 34], label: "Bookings" },
                  ]}
                />
              </div>
            </div>
            <p className="text-[11px] text-gray-500 mt-3">
              Add “Revenue” series later once orders are fully integrated.
            </p>
          </Panel>

          <Panel
            title="Throughput health"
            subtitle="Operational KPIs (placeholder)"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                ["Avg. days to Booked", "1.2"],
                ["Avg. days to Sailed", "4.8"],
                ["Avg. days to Delivered", "18.3"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="rounded-xl bg-[#0B1118] border border-white/10 p-4"
                >
                  <p className="text-[11px] text-gray-400">{k}</p>
                  <p className="text-white font-semibold text-xl mt-1">
                    {v}
                    <span className="text-[12px] text-gray-400 ml-1">days</span>
                  </p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Exports" subtitle="Get your insight reports out fast">
            <div className="flex flex-col sm:flex-row gap-2">
              <button className="rounded-xl px-4 py-2.5 text-[13px] font-semibold bg-[#FFA500] text-[#0B1118] hover:brightness-110">
                Export PDF
              </button>
              <button className="rounded-xl px-4 py-2.5 text-[13px] font-semibold bg-white/5 text-gray-100 hover:bg-white/10 border border-white/10">
                Export CSV
              </button>
            </div>
            <p className="text-[11px] text-gray-500 mt-3">
              Exports should be logged in All Logs for audit.
            </p>
          </Panel>
        </div>
      </PageShell>
    </div>
  );
}
