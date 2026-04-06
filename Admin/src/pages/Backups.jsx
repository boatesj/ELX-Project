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
    "rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed";
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
  return (
    <div className="min-h-[calc(100dvh-64px)] bg-[#0B1118]">
      <PageShell
        title="Backups"
        subtitle="Backup controls are not yet wired to the production backend."
        right={<Pill>Coming soon</Pill>}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card
            title="Backup status"
            subtitle="This admin page is currently informational only"
            right={<Pill>Not live</Pill>}
          >
            <div className="space-y-3">
              <div className="rounded-2xl bg-[#0B1118] border border-white/10 p-4">
                <p className="text-gray-100 text-[13px] font-semibold">
                  Current state
                </p>
                <p className="text-gray-400 text-[12px] mt-2">
                  Manual backup, restore, and snapshot download actions have not
                  yet been connected to real backend endpoints.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Button disabled>Run manual backup</Button>
                <Button variant="ghost" disabled>
                  Download latest snapshot
                </Button>
              </div>
            </div>
          </Card>

          <div className="lg:col-span-2">
            <Card
              title="Recovery notes"
              subtitle="Keep production behaviour clear and non-misleading"
              right={<Pill>Safe UI</Pill>}
            >
              <div className="space-y-3">
                <div className="rounded-2xl bg-[#0B1118] border border-white/10 p-4">
                  <p className="text-gray-100 text-[13px] font-semibold">
                    Why this is disabled
                  </p>
                  <p className="text-gray-400 text-[12px] mt-2">
                    The previous version displayed backup actions, but they were
                    only placeholders and did not trigger any real server-side
                    backup process.
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0B1118] border border-white/10 p-4">
                  <p className="text-gray-100 text-[13px] font-semibold">
                    Next implementation step
                  </p>
                  <p className="text-gray-400 text-[12px] mt-2">
                    Wire this page to real admin backup endpoints for: create
                    backup, list snapshots, download snapshot, and restore
                    snapshot.
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0B1118] border border-white/10 p-4">
                  <p className="text-gray-100 text-[13px] font-semibold">
                    Go-live recommendation
                  </p>
                  <p className="text-gray-400 text-[12px] mt-2">
                    Keep this page honest in production for now, then implement
                    real backup operations as a separate post-launch admin
                    hardening task.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </PageShell>
    </div>
  );
}
