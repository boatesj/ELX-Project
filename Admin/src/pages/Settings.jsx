import { useMemo, useState } from "react";
import PageShell from "../components/PageShell";

const SectionCard = ({ title, hint, children }) => (
  <div className="rounded-2xl bg-[#0F1720] border border-white/5 shadow-xl">
    <div className="p-5 border-b border-white/5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-white font-semibold text-[14px] tracking-[0.02em]">
          {title}
        </h3>
        {hint ? (
          <span className="text-[11px] text-gray-400">{hint}</span>
        ) : null}
      </div>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const Label = ({ children }) => (
  <label className="text-[12px] text-gray-300">{children}</label>
);

const Input = (props) => (
  <input
    {...props}
    className={[
      "mt-2 w-full rounded-xl bg-[#0B1118] border border-white/10",
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
      "mt-2 w-full rounded-xl bg-[#0B1118] border border-white/10",
      "px-3 py-2.5 text-[13px] text-gray-100",
      "outline-none focus:border-[#FFA500]/60 focus:ring-2 focus:ring-[#FFA500]/20",
      props.className || "",
    ].join(" ")}
  />
);

const Button = ({ variant = "primary", ...props }) => {
  const base =
    "rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all active:scale-[0.99]";
  const styles =
    variant === "primary"
      ? "bg-[#FFA500] text-[#0B1118] hover:brightness-110 shadow-[0_10px_30px_rgba(255,165,0,0.18)]"
      : variant === "ghost"
      ? "bg-white/5 text-gray-100 hover:bg-white/10 border border-white/10"
      : "bg-red-500/10 text-red-200 hover:bg-red-500/15 border border-red-500/20";

  return (
    <button
      {...props}
      className={`${base} ${styles} ${props.className || ""}`}
    />
  );
};

export default function Settings() {
  const tabs = useMemo(
    () => [
      { key: "company", label: "Company" },
      { key: "security", label: "Security" },
      { key: "notifications", label: "Notifications" },
      { key: "integrations", label: "Integrations" },
    ],
    []
  );

  const [active, setActive] = useState("company");

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-[#0B1118]">
      <PageShell
        title="Settings"
        subtitle="Control your organisation defaults, security posture, and admin workflows."
        right={
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-[11px] text-gray-400">
              Environment
            </span>
            <span className="text-[11px] text-[#FFA500] bg-[#FFA500]/10 border border-[#FFA500]/25 rounded-full px-3 py-1">
              Production-ready
            </span>
          </div>
        }
      >
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={[
                "shrink-0 rounded-full px-4 py-2 text-[12px] font-semibold border transition",
                active === t.key
                  ? "bg-[#FFA500]/10 text-[#FFA500] border-[#FFA500]/30"
                  : "bg-white/5 text-gray-200 border-white/10 hover:bg-white/8",
              ].join(" ")}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {active === "company" && (
            <>
              <SectionCard
                title="Company identity"
                hint="Used across invoices & comms"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Company name</Label>
                    <Input
                      defaultValue="Ellcworth Express Ltd"
                      placeholder="Company name"
                    />
                  </div>
                  <div>
                    <Label>Trading name</Label>
                    <Input
                      defaultValue="Ellcworth Express"
                      placeholder="Trading name"
                    />
                  </div>
                  <div>
                    <Label>Base currency</Label>
                    <Select defaultValue="GBP">
                      <option value="GBP">GBP (£)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </Select>
                  </div>
                  <div>
                    <Label>Default timezone</Label>
                    <Select defaultValue="Europe/London">
                      <option value="Europe/London">Europe/London</option>
                      <option value="UTC">UTC</option>
                      <option value="Africa/Accra">Africa/Accra</option>
                    </Select>
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <Button>Save changes</Button>
                  <Button variant="ghost">Preview invoice header</Button>
                </div>
              </SectionCard>

              <SectionCard
                title="Operational defaults"
                hint="Used when creating shipments"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Default origin country</Label>
                    <Select defaultValue="UK">
                      <option value="UK">United Kingdom</option>
                      <option value="GH">Ghana</option>
                      <option value="NG">Nigeria</option>
                    </Select>
                  </div>
                  <div>
                    <Label>Default destination country</Label>
                    <Select defaultValue="GH">
                      <option value="GH">Ghana</option>
                      <option value="NG">Nigeria</option>
                      <option value="CI">Côte d’Ivoire</option>
                    </Select>
                  </div>
                  <div>
                    <Label>Shipment reference prefix</Label>
                    <Input defaultValue="ELX" placeholder="e.g., ELX" />
                  </div>
                  <div>
                    <Label>Default incoterm</Label>
                    <Select defaultValue="CIF">
                      <option value="CIF">CIF</option>
                      <option value="FOB">FOB</option>
                      <option value="EXW">EXW</option>
                    </Select>
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <Button>Save defaults</Button>
                  <Button variant="ghost">Reset to recommended</Button>
                </div>
              </SectionCard>
            </>
          )}

          {active === "security" && (
            <>
              <SectionCard
                title="Admin access controls"
                hint="Hardening your console"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Require MFA</Label>
                    <Select defaultValue="recommended">
                      <option value="required">Required</option>
                      <option value="recommended">Recommended</option>
                      <option value="off">Off</option>
                    </Select>
                  </div>
                  <div>
                    <Label>Session timeout</Label>
                    <Select defaultValue="60">
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">60 minutes</option>
                      <option value="240">4 hours</option>
                    </Select>
                  </div>
                  <div>
                    <Label>Password minimum length</Label>
                    <Input type="number" defaultValue={10} min={8} />
                  </div>
                  <div>
                    <Label>Lockout threshold</Label>
                    <Input type="number" defaultValue={5} min={3} />
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <Button>Apply security policy</Button>
                  <Button variant="ghost">Download policy report</Button>
                </div>
              </SectionCard>

              <SectionCard
                title="Audit & compliance"
                hint="Your trail stays clean"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                    <div>
                      <p className="text-gray-100 text-[13px] font-semibold">
                        Log all admin actions
                      </p>
                      <p className="text-gray-400 text-[12px] mt-1">
                        Records user edits, shipment updates, status changes,
                        exports and backups.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="mt-1 accent-[#FFA500]"
                    />
                  </div>

                  <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                    <div>
                      <p className="text-gray-100 text-[13px] font-semibold">
                        IP allowlist (recommended)
                      </p>
                      <p className="text-gray-400 text-[12px] mt-1">
                        Restrict admin access to known networks (office/VPN).
                      </p>
                    </div>
                    <Button variant="ghost">Configure</Button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="danger">Rotate JWT secret</Button>
                    <Button variant="ghost">View recent logins</Button>
                  </div>
                </div>
              </SectionCard>
            </>
          )}

          {active === "notifications" && (
            <>
              <SectionCard
                title="Email & WhatsApp notifications"
                hint="Client trust at scale"
              >
                <div className="space-y-3">
                  {[
                    [
                      "Shipment status updates",
                      "Notify customers when statuses change (Booked → Sailed → Arrived).",
                    ],
                    [
                      "Payment confirmations",
                      "Send receipt confirmations and payment reminders.",
                    ],
                    [
                      "Document requests",
                      "Prompt users to upload V5C, ID, invoices, packing lists.",
                    ],
                  ].map(([t, d]) => (
                    <div
                      key={t}
                      className="flex items-start justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
                    >
                      <div>
                        <p className="text-gray-100 text-[13px] font-semibold">
                          {t}
                        </p>
                        <p className="text-gray-400 text-[12px] mt-1">{d}</p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="mt-1 accent-[#FFA500]"
                      />
                    </div>
                  ))}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>From name</Label>
                      <Input defaultValue="Ellcworth Express" />
                    </div>
                    <div>
                      <Label>Reply-to email</Label>
                      <Input defaultValue="support@ellcworth.com" />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button>Save notification rules</Button>
                    <Button variant="ghost">Send test email</Button>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Internal alerts" hint="Keep the team sharp">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Notify when shipment is overdue</Label>
                    <Select defaultValue="48">
                      <option value="24">After 24 hours</option>
                      <option value="48">After 48 hours</option>
                      <option value="72">After 72 hours</option>
                    </Select>
                  </div>
                  <div>
                    <Label>Daily digest time</Label>
                    <Input type="time" defaultValue="08:30" />
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <Button>Save alerts</Button>
                  <Button variant="ghost">Preview digest</Button>
                </div>
              </SectionCard>
            </>
          )}

          {active === "integrations" && (
            <>
              <SectionCard title="Integrations" hint="Plug in, don’t patch">
                <div className="space-y-3">
                  {[
                    [
                      "Google Maps",
                      "Enable address and route validations for collections/deliveries.",
                    ],
                    [
                      "Payment links (SumUp/Stripe)",
                      "Attach payment links to invoices and orders.",
                    ],
                    ["VIN lookup", "Auto-validate vehicle details on booking."],
                    [
                      "Port schedules",
                      "Sync sailing windows and cut-off dates.",
                    ],
                  ].map(([t, d]) => (
                    <div
                      key={t}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start justify-between gap-4"
                    >
                      <div>
                        <p className="text-gray-100 text-[13px] font-semibold">
                          {t}
                        </p>
                        <p className="text-gray-400 text-[12px] mt-1">{d}</p>
                      </div>
                      <Button variant="ghost">Configure</Button>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <Button>Save integrations</Button>
                  <Button variant="ghost">View API keys</Button>
                </div>
              </SectionCard>

              <SectionCard title="Webhooks" hint="Automate operations">
                <div className="space-y-4">
                  <div>
                    <Label>Webhook URL</Label>
                    <Input placeholder="https://..." />
                    <p className="text-[11px] text-gray-500 mt-2">
                      Triggered on shipment created, status changed, payment
                      updated, document uploaded.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button>Enable webhooks</Button>
                    <Button variant="ghost">Send test payload</Button>
                  </div>
                </div>
              </SectionCard>
            </>
          )}
        </div>
      </PageShell>
    </div>
  );
}
