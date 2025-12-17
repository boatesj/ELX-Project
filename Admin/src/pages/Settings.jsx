import { useEffect, useMemo, useRef, useState } from "react";
import PageShell from "../components/PageShell";
import { adminRequest } from "../requestMethods";

/* ----------------------------- UI Primitives ----------------------------- */

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
    "rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed";
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

/* ------------------------------- Component ------------------------------- */

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

  // Loaded settings snapshot (for prefill + reset)
  const [loaded, setLoaded] = useState(null);

  // UX
  const [busyKey, setBusyKey] = useState("");
  const [banner, setBanner] = useState(null); // { type: 'success'|'error', text }
  const bannerTimerRef = useRef(null);

  // --- Refs (uncontrolled inputs; safest upgrade) ---
  // Company
  const companyNameRef = useRef(null);
  const tradingNameRef = useRef(null);
  const currencyRef = useRef(null);
  const timezoneRef = useRef(null);

  // Operations
  const originCountryRef = useRef(null);
  const destinationCountryRef = useRef(null);
  const refPrefixRef = useRef(null);
  const incotermRef = useRef(null);

  // Security
  const requireMfaRef = useRef(null);
  const sessionTimeoutRef = useRef(null);
  const passwordMinLengthRef = useRef(null);
  const lockoutThresholdRef = useRef(null);
  const [logAllAdminActions, setLogAllAdminActions] = useState(true);

  // Notifications
  const [shipmentStatusUpdates, setShipmentStatusUpdates] = useState(true);
  const [paymentConfirmations, setPaymentConfirmations] = useState(true);
  const [documentRequests, setDocumentRequests] = useState(true);
  const fromNameRef = useRef(null);
  const replyToRef = useRef(null);
  const overdueHoursRef = useRef(null);
  const digestTimeRef = useRef(null);

  // Integrations
  const [googleMapsEnabled, setGoogleMapsEnabled] = useState(false);
  const [paymentsEnabled, setPaymentsEnabled] = useState(false);
  const [vinLookupEnabled, setVinLookupEnabled] = useState(false);
  const [portSchedulesEnabled, setPortSchedulesEnabled] = useState(false);
  const webhookUrlRef = useRef(null);
  const [webhooksEnabled, setWebhooksEnabled] = useState(false);

  const showBanner = (type, text) => {
    setBanner({ type, text });

    if (bannerTimerRef.current) {
      window.clearTimeout(bannerTimerRef.current);
      bannerTimerRef.current = null;
    }

    bannerTimerRef.current = window.setTimeout(() => {
      setBanner(null);
      bannerTimerRef.current = null;
    }, 3500);
  };

  const safeNum = (v, fallback) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  // IMPORTANT: defaultValue does NOT update when loaded changes.
  // So we hydrate refs manually once settings are fetched.
  const hydrateRefsFromSettings = (s) => {
    if (!s) return;

    // Company
    if (companyNameRef.current)
      companyNameRef.current.value =
        s?.company?.companyName ?? "Ellcworth Express Ltd";
    if (tradingNameRef.current)
      tradingNameRef.current.value =
        s?.company?.tradingName ?? "Ellcworth Express";
    if (currencyRef.current)
      currencyRef.current.value = s?.company?.currency ?? "GBP";
    if (timezoneRef.current)
      timezoneRef.current.value = s?.company?.timezone ?? "Europe/London";

    // Operations
    if (originCountryRef.current)
      originCountryRef.current.value =
        s?.operations?.defaultOriginCountry ?? "UK";
    if (destinationCountryRef.current)
      destinationCountryRef.current.value =
        s?.operations?.defaultDestinationCountry ?? "GH";
    if (refPrefixRef.current)
      refPrefixRef.current.value = s?.operations?.refPrefix ?? "ELX";
    if (incotermRef.current)
      incotermRef.current.value = s?.operations?.defaultIncoterm ?? "CIF";

    // Security
    if (requireMfaRef.current)
      requireMfaRef.current.value = s?.security?.requireMfa ?? "recommended";
    if (sessionTimeoutRef.current)
      sessionTimeoutRef.current.value = String(
        s?.security?.sessionTimeoutMinutes ?? 60
      );
    if (passwordMinLengthRef.current)
      passwordMinLengthRef.current.value = String(
        s?.security?.passwordMinLength ?? 10
      );
    if (lockoutThresholdRef.current)
      lockoutThresholdRef.current.value = String(
        s?.security?.lockoutThreshold ?? 5
      );

    // Notifications
    if (fromNameRef.current)
      fromNameRef.current.value =
        s?.notifications?.fromName ?? "Ellcworth Express";
    if (replyToRef.current)
      replyToRef.current.value =
        s?.notifications?.replyTo ?? "support@ellcworth.com";
    if (overdueHoursRef.current)
      overdueHoursRef.current.value = String(
        s?.notifications?.overdueHours ?? 48
      );
    if (digestTimeRef.current)
      digestTimeRef.current.value = s?.notifications?.digestTime ?? "08:30";

    // Integrations
    if (webhookUrlRef.current)
      webhookUrlRef.current.value = s?.integrations?.webhookUrl ?? "";
  };

  // Load settings on mount
  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        const res = await adminRequest.get("/settings");
        if (ignore) return;

        const s = res?.data || null;

        // snapshot
        setLoaded(s);

        // hydrate all refs (uncontrolled inputs)
        hydrateRefsFromSettings(s);

        // Sync checkbox/toggle state (these ARE controlled)
        setLogAllAdminActions(!!s?.security?.logAllAdminActions);

        setShipmentStatusUpdates(!!s?.notifications?.shipmentStatusUpdates);
        setPaymentConfirmations(!!s?.notifications?.paymentConfirmations);
        setDocumentRequests(!!s?.notifications?.documentRequests);

        setGoogleMapsEnabled(!!s?.integrations?.googleMapsEnabled);
        setPaymentsEnabled(!!s?.integrations?.paymentsEnabled);
        setVinLookupEnabled(!!s?.integrations?.vinLookupEnabled);
        setPortSchedulesEnabled(!!s?.integrations?.portSchedulesEnabled);
        setWebhooksEnabled(!!s?.integrations?.webhooksEnabled);
      } catch (err) {
        showBanner(
          "error",
          err?.response?.data?.message ||
            "Failed to load settings (are you logged in as admin?)"
        );
      }
    })();

    return () => {
      ignore = true;
      if (bannerTimerRef.current) {
        window.clearTimeout(bannerTimerRef.current);
        bannerTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------------------------- Payload Readers -------------------------- */

  const readCompanyPayload = () => ({
    company: {
      companyName: companyNameRef.current?.value ?? "Ellcworth Express Ltd",
      tradingName: tradingNameRef.current?.value ?? "Ellcworth Express",
      currency: currencyRef.current?.value ?? "GBP",
      timezone: timezoneRef.current?.value ?? "Europe/London",
    },
  });

  const readOperationsPayload = () => ({
    operations: {
      defaultOriginCountry: originCountryRef.current?.value ?? "UK",
      defaultDestinationCountry: destinationCountryRef.current?.value ?? "GH",
      refPrefix: refPrefixRef.current?.value ?? "ELX",
      defaultIncoterm: incotermRef.current?.value ?? "CIF",
    },
  });

  const readSecurityPayload = () => ({
    security: {
      requireMfa: requireMfaRef.current?.value ?? "recommended",
      sessionTimeoutMinutes: safeNum(sessionTimeoutRef.current?.value, 60),
      passwordMinLength: safeNum(passwordMinLengthRef.current?.value, 10),
      lockoutThreshold: safeNum(lockoutThresholdRef.current?.value, 5),
      logAllAdminActions: !!logAllAdminActions,
    },
  });

  const readNotificationsPayload = () => ({
    notifications: {
      shipmentStatusUpdates: !!shipmentStatusUpdates,
      paymentConfirmations: !!paymentConfirmations,
      documentRequests: !!documentRequests,
      fromName: fromNameRef.current?.value ?? "Ellcworth Express",
      replyTo: replyToRef.current?.value ?? "support@ellcworth.com",
      overdueHours: safeNum(overdueHoursRef.current?.value, 48),
      digestTime: digestTimeRef.current?.value ?? "08:30",
    },
  });

  const readIntegrationsPayload = () => ({
    integrations: {
      googleMapsEnabled: !!googleMapsEnabled,
      paymentsEnabled: !!paymentsEnabled,
      vinLookupEnabled: !!vinLookupEnabled,
      portSchedulesEnabled: !!portSchedulesEnabled,
      webhookUrl: webhookUrlRef.current?.value ?? "",
      webhooksEnabled: !!webhooksEnabled,
    },
  });

  /* ------------------------------ Actions ------------------------------ */

  const save = async (key, payload) => {
    try {
      setBusyKey(key);
      const res = await adminRequest.put("/settings", payload);
      const s = res?.data || loaded;

      setLoaded(s);
      // keep UI aligned with DB response
      hydrateRefsFromSettings(s);

      // controlled toggles aligned too
      setLogAllAdminActions(!!s?.security?.logAllAdminActions);

      setShipmentStatusUpdates(!!s?.notifications?.shipmentStatusUpdates);
      setPaymentConfirmations(!!s?.notifications?.paymentConfirmations);
      setDocumentRequests(!!s?.notifications?.documentRequests);

      setGoogleMapsEnabled(!!s?.integrations?.googleMapsEnabled);
      setPaymentsEnabled(!!s?.integrations?.paymentsEnabled);
      setVinLookupEnabled(!!s?.integrations?.vinLookupEnabled);
      setPortSchedulesEnabled(!!s?.integrations?.portSchedulesEnabled);
      setWebhooksEnabled(!!s?.integrations?.webhooksEnabled);

      showBanner("success", "Settings saved successfully");
    } catch (err) {
      showBanner(
        "error",
        err?.response?.data?.message || "Save failed. Please try again."
      );
    } finally {
      setBusyKey("");
    }
  };

  const resetOperationsRecommended = () => {
    // Recommended == schema defaults
    if (originCountryRef.current) originCountryRef.current.value = "UK";
    if (destinationCountryRef.current)
      destinationCountryRef.current.value = "GH";
    if (refPrefixRef.current) refPrefixRef.current.value = "ELX";
    if (incotermRef.current) incotermRef.current.value = "CIF";
    showBanner("success", "Operational defaults reset to recommended");
  };

  const previewInvoiceHeader = () => {
    const cn = companyNameRef.current?.value || "Ellcworth Express Ltd";
    const tn = tradingNameRef.current?.value || "Ellcworth Express";
    const cur = currencyRef.current?.value || "GBP";
    const tz = timezoneRef.current?.value || "Europe/London";
    showBanner("success", `Preview: ${tn} • ${cn} • ${cur} • ${tz}`);
  };

  // ✅ WIRED: Send test email (Backend should implement POST /admin/settings/test-email)
  const sendTestEmail = async () => {
    try {
      setBusyKey("testEmail");
      const res = await adminRequest.post("/settings/test-email");
      showBanner("success", res?.data?.message || "Test email sent");
    } catch (err) {
      showBanner(
        "error",
        err?.response?.data?.message || "Failed to send test email"
      );
    } finally {
      setBusyKey("");
    }
  };

  // Still not wired (safe placeholders)
  const downloadPolicyReport = () =>
    showBanner("error", "Download policy report: not wired yet");

  const configureIpAllowlist = () =>
    showBanner("error", "IP allowlist: not wired yet");

  const rotateJwtSecret = () =>
    showBanner("error", "Rotate JWT secret: not wired yet");

  const viewRecentLogins = () =>
    showBanner("error", "Recent logins: not wired yet");

  const viewApiKeys = () => showBanner("error", "View API keys: not wired yet");

  const sendTestWebhook = () =>
    showBanner("error", "Send test payload: not wired yet");

  /* ------------------------------- Render ------------------------------- */

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
        {/* Banner (small + unobtrusive) */}
        {banner ? (
          <div
            className={[
              "mb-3 rounded-xl border px-4 py-3 text-[12px]",
              banner.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-200"
                : "bg-red-500/10 border-red-500/20 text-red-200",
            ].join(" ")}
          >
            {banner.text}
          </div>
        ) : null}

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
          {/* ------------------------------ COMPANY ------------------------------ */}
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
                      ref={companyNameRef}
                      defaultValue={
                        loaded?.company?.companyName ?? "Ellcworth Express Ltd"
                      }
                      placeholder="Company name"
                    />
                  </div>
                  <div>
                    <Label>Trading name</Label>
                    <Input
                      ref={tradingNameRef}
                      defaultValue={
                        loaded?.company?.tradingName ?? "Ellcworth Express"
                      }
                      placeholder="Trading name"
                    />
                  </div>
                  <div>
                    <Label>Base currency</Label>
                    <Select
                      ref={currencyRef}
                      defaultValue={loaded?.company?.currency ?? "GBP"}
                    >
                      <option value="GBP">GBP (£)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </Select>
                  </div>
                  <div>
                    <Label>Default timezone</Label>
                    <Select
                      ref={timezoneRef}
                      defaultValue={
                        loaded?.company?.timezone ?? "Europe/London"
                      }
                    >
                      <option value="Europe/London">Europe/London</option>
                      <option value="UTC">UTC</option>
                      <option value="Africa/Accra">Africa/Accra</option>
                    </Select>
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={() => save("company", readCompanyPayload())}
                    disabled={busyKey === "company"}
                  >
                    {busyKey === "company" ? "Saving..." : "Save changes"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={previewInvoiceHeader}
                    disabled={busyKey === "company"}
                  >
                    Preview invoice header
                  </Button>
                </div>
              </SectionCard>

              <SectionCard
                title="Operational defaults"
                hint="Used when creating shipments"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Default origin country</Label>
                    <Select
                      ref={originCountryRef}
                      defaultValue={
                        loaded?.operations?.defaultOriginCountry ?? "UK"
                      }
                    >
                      <option value="UK">United Kingdom</option>
                      <option value="GH">Ghana</option>
                      <option value="NG">Nigeria</option>
                    </Select>
                  </div>
                  <div>
                    <Label>Default destination country</Label>
                    <Select
                      ref={destinationCountryRef}
                      defaultValue={
                        loaded?.operations?.defaultDestinationCountry ?? "GH"
                      }
                    >
                      <option value="GH">Ghana</option>
                      <option value="NG">Nigeria</option>
                      <option value="CI">Côte d’Ivoire</option>
                    </Select>
                  </div>
                  <div>
                    <Label>Shipment reference prefix</Label>
                    <Input
                      ref={refPrefixRef}
                      defaultValue={loaded?.operations?.refPrefix ?? "ELX"}
                      placeholder="e.g., ELX"
                    />
                  </div>
                  <div>
                    <Label>Default incoterm</Label>
                    <Select
                      ref={incotermRef}
                      defaultValue={
                        loaded?.operations?.defaultIncoterm ?? "CIF"
                      }
                    >
                      <option value="CIF">CIF</option>
                      <option value="FOB">FOB</option>
                      <option value="EXW">EXW</option>
                    </Select>
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={() => save("operations", readOperationsPayload())}
                    disabled={busyKey === "operations"}
                  >
                    {busyKey === "operations" ? "Saving..." : "Save defaults"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={resetOperationsRecommended}
                    disabled={busyKey === "operations"}
                  >
                    Reset to recommended
                  </Button>
                </div>
              </SectionCard>
            </>
          )}

          {/* ------------------------------ SECURITY ------------------------------ */}
          {active === "security" && (
            <>
              <SectionCard
                title="Admin access controls"
                hint="Hardening your console"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Require MFA</Label>
                    <Select
                      ref={requireMfaRef}
                      defaultValue={
                        loaded?.security?.requireMfa ?? "recommended"
                      }
                    >
                      <option value="required">Required</option>
                      <option value="recommended">Recommended</option>
                      <option value="off">Off</option>
                    </Select>
                  </div>
                  <div>
                    <Label>Session timeout</Label>
                    <Select
                      ref={sessionTimeoutRef}
                      defaultValue={String(
                        loaded?.security?.sessionTimeoutMinutes ?? 60
                      )}
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">60 minutes</option>
                      <option value="240">4 hours</option>
                    </Select>
                  </div>
                  <div>
                    <Label>Password minimum length</Label>
                    <Input
                      ref={passwordMinLengthRef}
                      type="number"
                      defaultValue={loaded?.security?.passwordMinLength ?? 10}
                      min={8}
                    />
                  </div>
                  <div>
                    <Label>Lockout threshold</Label>
                    <Input
                      ref={lockoutThresholdRef}
                      type="number"
                      defaultValue={loaded?.security?.lockoutThreshold ?? 5}
                      min={3}
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={() => save("security", readSecurityPayload())}
                    disabled={busyKey === "security"}
                  >
                    {busyKey === "security"
                      ? "Saving..."
                      : "Apply security policy"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={downloadPolicyReport}
                    disabled={busyKey === "security"}
                  >
                    Download policy report
                  </Button>
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
                      checked={logAllAdminActions}
                      onChange={(e) => setLogAllAdminActions(e.target.checked)}
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
                    <Button variant="ghost" onClick={configureIpAllowlist}>
                      Configure
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="danger" onClick={rotateJwtSecret}>
                      Rotate JWT secret
                    </Button>
                    <Button variant="ghost" onClick={viewRecentLogins}>
                      View recent logins
                    </Button>
                  </div>
                </div>
              </SectionCard>
            </>
          )}

          {/* ---------------------------- NOTIFICATIONS ---------------------------- */}
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
                      shipmentStatusUpdates,
                      setShipmentStatusUpdates,
                    ],
                    [
                      "Payment confirmations",
                      "Send receipt confirmations and payment reminders.",
                      paymentConfirmations,
                      setPaymentConfirmations,
                    ],
                    [
                      "Document requests",
                      "Prompt users to upload V5C, ID, invoices, packing lists.",
                      documentRequests,
                      setDocumentRequests,
                    ],
                  ].map(([t, d, v, setV]) => (
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
                        checked={!!v}
                        onChange={(e) => setV(e.target.checked)}
                        className="mt-1 accent-[#FFA500]"
                      />
                    </div>
                  ))}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>From name</Label>
                      <Input
                        ref={fromNameRef}
                        defaultValue={
                          loaded?.notifications?.fromName ?? "Ellcworth Express"
                        }
                      />
                    </div>
                    <div>
                      <Label>Reply-to email</Label>
                      <Input
                        ref={replyToRef}
                        defaultValue={
                          loaded?.notifications?.replyTo ??
                          "support@ellcworth.com"
                        }
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={() =>
                        save("notifications", readNotificationsPayload())
                      }
                      disabled={busyKey === "notifications"}
                    >
                      {busyKey === "notifications"
                        ? "Saving..."
                        : "Save notification rules"}
                    </Button>

                    {/* ✅ Wired */}
                    <Button
                      variant="ghost"
                      onClick={sendTestEmail}
                      disabled={
                        busyKey === "testEmail" || busyKey === "notifications"
                      }
                    >
                      {busyKey === "testEmail"
                        ? "Sending..."
                        : "Send test email"}
                    </Button>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Internal alerts" hint="Keep the team sharp">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Notify when shipment is overdue</Label>
                    <Select
                      ref={overdueHoursRef}
                      defaultValue={String(
                        loaded?.notifications?.overdueHours ?? 48
                      )}
                    >
                      <option value="24">After 24 hours</option>
                      <option value="48">After 48 hours</option>
                      <option value="72">After 72 hours</option>
                    </Select>
                  </div>
                  <div>
                    <Label>Daily digest time</Label>
                    <Input
                      ref={digestTimeRef}
                      type="time"
                      defaultValue={
                        loaded?.notifications?.digestTime ?? "08:30"
                      }
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={() => save("alerts", readNotificationsPayload())}
                    disabled={busyKey === "alerts"}
                  >
                    {busyKey === "alerts" ? "Saving..." : "Save alerts"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      showBanner("success", "Preview digest (UI): coming next")
                    }
                    disabled={busyKey === "alerts"}
                  >
                    Preview digest
                  </Button>
                </div>
              </SectionCard>
            </>
          )}

          {/* ---------------------------- INTEGRATIONS ---------------------------- */}
          {active === "integrations" && (
            <>
              <SectionCard title="Integrations" hint="Plug in, don’t patch">
                <div className="space-y-3">
                  {[
                    [
                      "Google Maps",
                      "Enable address and route validations for collections/deliveries.",
                      googleMapsEnabled,
                      setGoogleMapsEnabled,
                    ],
                    [
                      "Payment links (SumUp/Stripe)",
                      "Attach payment links to invoices and orders.",
                      paymentsEnabled,
                      setPaymentsEnabled,
                    ],
                    [
                      "VIN lookup",
                      "Auto-validate vehicle details on booking.",
                      vinLookupEnabled,
                      setVinLookupEnabled,
                    ],
                    [
                      "Port schedules",
                      "Sync sailing windows and cut-off dates.",
                      portSchedulesEnabled,
                      setPortSchedulesEnabled,
                    ],
                  ].map(([t, d, v, setV]) => (
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
                      <Button
                        variant="ghost"
                        onClick={() => setV(!v)}
                        title="Toggle on/off"
                      >
                        {v ? "Enabled" : "Configure"}
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={() =>
                      save("integrations", readIntegrationsPayload())
                    }
                    disabled={busyKey === "integrations"}
                  >
                    {busyKey === "integrations"
                      ? "Saving..."
                      : "Save integrations"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={viewApiKeys}
                    disabled={busyKey === "integrations"}
                  >
                    View API keys
                  </Button>
                </div>
              </SectionCard>

              <SectionCard title="Webhooks" hint="Automate operations">
                <div className="space-y-4">
                  <div>
                    <Label>Webhook URL</Label>
                    <Input
                      ref={webhookUrlRef}
                      defaultValue={loaded?.integrations?.webhookUrl ?? ""}
                      placeholder="https://..."
                    />
                    <p className="text-[11px] text-gray-500 mt-2">
                      Triggered on shipment created, status changed, payment
                      updated, document uploaded.
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                    <div>
                      <p className="text-gray-100 text-[13px] font-semibold">
                        Enable webhooks
                      </p>
                      <p className="text-gray-400 text-[12px] mt-1">
                        Turn on/off webhook delivery.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={webhooksEnabled}
                      onChange={(e) => setWebhooksEnabled(e.target.checked)}
                      className="mt-1 accent-[#FFA500]"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={() =>
                        save("webhooks", readIntegrationsPayload())
                      }
                      disabled={busyKey === "webhooks"}
                    >
                      {busyKey === "webhooks" ? "Saving..." : "Save webhooks"}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={sendTestWebhook}
                      disabled={busyKey === "webhooks"}
                    >
                      Send test payload
                    </Button>
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
