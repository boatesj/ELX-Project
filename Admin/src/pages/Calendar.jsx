import { useEffect, useMemo, useState } from "react";
import PageShell from "../components/PageShell";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const TOKEN_KEY = "token"; // change to "accessToken" if that's what you store

const Chip = ({ children }) => (
  <span className="text-[11px] px-3 py-1 rounded-full bg-white/5 text-gray-200 border border-white/10">
    {children}
  </span>
);

const Button = ({ variant = "ghost", ...props }) => {
  const base =
    "rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed";
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

const Modal = ({ open, title, subtitle, children, onClose, footer }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        role="button"
        tabIndex={0}
      />
      <div className="relative w-full sm:w-[560px] max-h-[85vh] overflow-auto rounded-t-3xl sm:rounded-3xl bg-[#0F1720] border border-white/10 shadow-2xl">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-white font-semibold text-[15px]">{title}</p>
              {subtitle ? (
                <p className="text-gray-400 text-[12px] mt-1">{subtitle}</p>
              ) : null}
            </div>
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
        <div className="p-5">{children}</div>
        {footer ? (
          <div className="p-5 border-t border-white/10">{footer}</div>
        ) : null}
      </div>
    </div>
  );
};

function fmtYmd(d) {
  return d.toISOString().slice(0, 10);
}

function safeTime(t) {
  const s = String(t || "").trim();
  return s ? s : "All day";
}

function normKind(k) {
  return String(k || "event")
    .trim()
    .toLowerCase();
}

function addDaysYmd(ymd, days) {
  const dt = new Date(`${ymd}T00:00:00.000Z`);
  if (Number.isNaN(dt.getTime())) return ymd;
  dt.setUTCDate(dt.getUTCDate() + Number(days || 0));
  return fmtYmd(dt);
}

async function apiRequest(path, { method = "GET", body, headers } = {}) {
  const token = localStorage.getItem(TOKEN_KEY);

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || "Request failed");
  return data;
}

function mapDbEventToUi(e) {
  return {
    id: e._id,
    date: e.date,
    time: e.time || "",
    title: e.title,
    meta: e.meta || "",
    tag: e.tag || "Operations",
    kind: normKind(e.kind || "event"),
    source: e.source || "manual",
    shipmentId: e.shipmentId || null,
    raw: e,
  };
}

// De-dupe key used only on the client for bulk actions
function keyFor({ date, title, shipmentId }) {
  return `${date}||${String(title || "")
    .trim()
    .toLowerCase()}||${String(shipmentId || "")}`;
}

export default function Calendar() {
  const [view, setView] = useState("agenda");

  const [events, setEvents] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState({ type: "info", text: "" });

  const [openEvent, setOpenEvent] = useState(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: "",
    date: fmtYmd(new Date()),
    time: "",
    tag: "Operations",
    meta: "",
    kind: "event",
  });

  // Window includes look-back for operational context
  const range = useMemo(() => {
    const now = new Date();
    const from = new Date(Date.now() - 7 * 24 * 3600 * 1000); // 7 days back
    const to = new Date(Date.now() + 14 * 24 * 3600 * 1000); // 14 days ahead
    return { from: fmtYmd(from), to: fmtYmd(to), today: fmtYmd(now) };
  }, []);

  const visible = useMemo(() => {
    const all = [...events, ...holidays];

    if (view === "milestones") {
      return all.filter((e) => {
        const k = normKind(e.kind);
        return k === "milestone" || k === "reminder";
      });
    }

    return all;
  }, [events, holidays, view]);

  const load = async ({ quiet = true } = {}) => {
    try {
      setLoading(true);

      const [db, hol] = await Promise.all([
        apiRequest(`/admin/calendar/events?from=${range.from}&to=${range.to}`),
        apiRequest(
          `/admin/calendar/holidays?country=GB&year=${new Date().getFullYear()}`
        ),
      ]);

      setEvents(Array.isArray(db) ? db.map(mapDbEventToUi) : []);
      setHolidays(
        (hol?.items || []).map((h) => ({
          id: h._id,
          date: h.date,
          time: "",
          title: h.title,
          meta: h.meta || "",
          tag: "Holiday",
          kind: "holiday",
          source: "holiday",
          shipmentId: null,
          raw: h,
        }))
      );

      if (!quiet && banner.type !== "success") {
        // no-op; we keep banners stable to avoid “reset to nothing” feel
      }
    } catch (e) {
      setBanner({
        type: "error",
        text: e.message || "Failed to load calendar",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load({ quiet: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onOpen = (e) => setOpenEvent(e);

  /**
   * ✅ NEW BEHAVIOUR:
   * Create task = same-day “Action today” reminder (NOT 1 day before).
   * This is deliberately different from shipment sync reminders.
   */
  const onCreateTask = async (e) => {
    try {
      setLoading(true);

      const today = range.today;

      await apiRequest(`/admin/calendar/events`, {
        method: "POST",
        body: {
          title: `Action today — ${e.title}`,
          date: today,
          time: "", // all-day action prompt
          tag: "Operations",
          meta: `Created from: ${e.title} (${e.date} • ${safeTime(e.time)}). ${
            e.meta ? `Notes: ${e.meta}` : ""
          }`.trim(),
          kind: "reminder",
          source: "manual",
          shipmentId: e.shipmentId || null,
        },
      });

      setBanner({
        type: "success",
        text: "Task created for today (all-day action).",
      });

      await load({ quiet: true });
    } catch (err) {
      setBanner({
        type: "error",
        text: err.message || "Failed to create task",
      });
    } finally {
      setLoading(false);
    }
  };

  const onAddEvent = () => {
    setCreateForm({
      title: "",
      date: fmtYmd(new Date()),
      time: "",
      tag: "Operations",
      meta: "",
      kind: "event",
    });
    setCreateOpen(true);
  };

  const submitCreate = async () => {
    try {
      if (!createForm.title.trim() || !createForm.date.trim()) {
        setBanner({ type: "error", text: "Title and date are required." });
        return;
      }

      setLoading(true);

      await apiRequest(`/admin/calendar/events`, {
        method: "POST",
        body: {
          title: createForm.title.trim(),
          date: createForm.date.trim(),
          time:
            normKind(createForm.kind) === "reminder"
              ? ""
              : (createForm.time || "").trim(),
          tag: (createForm.tag || "").trim() || "Operations",
          meta: (createForm.meta || "").trim(),
          kind: normKind(createForm.kind),
          source: "manual",
        },
      });

      setCreateOpen(false);
      setBanner({ type: "success", text: "Event created." });
      await load({ quiet: true });
    } catch (err) {
      setBanner({
        type: "error",
        text: err.message || "Failed to create event",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSync = async () => {
    try {
      setLoading(true);
      const r = await apiRequest(`/admin/calendar/sync-from-shipments`, {
        method: "POST",
      });

      setBanner({
        type: "success",
        text: `Synced from shipments. Created ${r?.createdCount ?? 0} events.`,
      });
      await load({ quiet: true });
    } catch (err) {
      setBanner({ type: "error", text: err.message || "Sync failed" });
    } finally {
      setLoading(false);
    }
  };

  const onExportIcal = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setBanner({
          type: "error",
          text: "Missing token. Please log in again.",
        });
        return;
      }

      const url = `${API_BASE_URL}/admin/calendar/ical?from=${range.from}&to=${range.to}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to export iCal");

      const blob = await res.blob();
      const dlUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = dlUrl;
      a.download = "ellcworth.ics";
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(dlUrl);

      setBanner({ type: "success", text: "iCal exported." });
    } catch (err) {
      setBanner({ type: "error", text: err.message || "Export failed" });
    } finally {
      setLoading(false);
    }
  };

  /**
   * ✅ NEW BEHAVIOUR:
   * Set reminders = bulk create reminders 3 DAYS BEFORE each milestone.
   * (Different from sync which does docs-check 7 days before ETD.)
   */
  const onSetReminders = async () => {
    try {
      setLoading(true);

      const milestones = events.filter((e) => normKind(e.kind) === "milestone");
      if (milestones.length === 0) {
        setBanner({
          type: "info",
          text: "No milestones in window. Sync from shipments or create a milestone first.",
        });
        return;
      }

      // Build existing reminder keys from what we currently have loaded
      const existing = new Set(
        events
          .filter((e) => normKind(e.kind) === "reminder")
          .map((r) =>
            keyFor({
              date: r.date,
              title: r.title,
              shipmentId: r.shipmentId,
            })
          )
      );

      let created = 0;
      let skipped = 0;

      for (const m of milestones) {
        const reminderYmd = addDaysYmd(m.date, -3);
        const title = `Reminder (3 days) — ${m.title}`;

        const k = keyFor({
          date: reminderYmd,
          title,
          shipmentId: m.shipmentId || null,
        });

        if (existing.has(k)) {
          skipped += 1;
          continue;
        }

        await apiRequest(`/admin/calendar/events`, {
          method: "POST",
          body: {
            title,
            date: reminderYmd,
            time: "",
            tag: "Compliance",
            meta: `Auto reminder: 3 days before → ${m.title}`,
            kind: "reminder",
            source: "manual",
            shipmentId: m.shipmentId || null,
          },
        });

        existing.add(k);
        created += 1;
      }

      setBanner({
        type: "success",
        text: `Reminders set: created ${created}, skipped ${skipped} existing.`,
      });

      await load({ quiet: true });
    } catch (err) {
      setBanner({
        type: "error",
        text: err.message || "Failed to set reminders",
      });
    } finally {
      setLoading(false);
    }
  };

  const onDeleteEvent = async (e) => {
    if (!e || e.source === "holiday") return;

    const ok = window.confirm(
      `Delete this calendar item?\n\n${e.title}\n${e.date} • ${safeTime(
        e.time
      )}`
    );
    if (!ok) return;

    try {
      setLoading(true);
      await apiRequest(`/admin/calendar/events/${e.id}`, { method: "DELETE" });

      setBanner({ type: "success", text: "Event deleted." });
      setOpenEvent(null);
      await load({ quiet: true });
    } catch (err) {
      setBanner({
        type: "error",
        text: err.message || "Delete failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  const bannerStyles =
    banner.type === "error"
      ? "bg-red-500/10 border-red-500/20 text-red-200"
      : banner.type === "success"
      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-200"
      : "bg-white/5 border-white/10 text-gray-200";

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
              disabled={loading}
            >
              Agenda
            </Button>
            <Button
              variant={view === "milestones" ? "primary" : "ghost"}
              onClick={() => setView("milestones")}
              disabled={loading}
            >
              Milestones
            </Button>
          </div>
        }
      >
        {banner.text ? (
          <div className={`mb-4 p-3 rounded-2xl border ${bannerStyles}`}>
            <p className="text-[12px]">{banner.text}</p>
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <Card
              title={view === "agenda" ? "Upcoming agenda" : "Key milestones"}
              subtitle={`Window: ${range.from} → ${range.to}`}
              right={
                <div className="flex items-center gap-2">
                  <Chip>Ops window</Chip>
                  <Button
                    onClick={() => load({ quiet: true })}
                    disabled={loading}
                  >
                    Refresh
                  </Button>
                </div>
              }
            >
              {loading ? (
                <div className="p-4 rounded-2xl bg-[#0B1118] border border-white/10">
                  <p className="text-gray-300 text-[13px]">Loading…</p>
                </div>
              ) : null}

              <div className="space-y-3">
                {visible.length === 0 && !loading ? (
                  <div className="p-4 rounded-2xl bg-[#0B1118] border border-white/10">
                    <p className="text-gray-300 text-[13px]">
                      No events in window. Try syncing from shipments.
                    </p>
                  </div>
                ) : null}

                {visible.map((e) => (
                  <div
                    key={e.id}
                    className="p-4 rounded-2xl bg-[#0B1118] border border-white/10 hover:border-[#FFA500]/25 transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[#FFA500] text-[12px] font-semibold">
                            {e.date}
                          </span>
                          <span className="text-gray-500 text-[12px]">•</span>
                          <span className="text-gray-200 text-[12px]">
                            {safeTime(e.time)}
                          </span>
                          <span className="ml-2">
                            <Chip>{e.tag}</Chip>
                          </span>
                          <span className="ml-1">
                            <Chip>{normKind(e.kind)}</Chip>
                          </span>
                        </div>
                        <p className="text-white font-semibold text-[14px] mt-2 break-words">
                          {e.title}
                        </p>
                        {e.meta ? (
                          <p className="text-gray-400 text-[12px] mt-1 break-words">
                            {e.meta}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex flex-col gap-2 shrink-0">
                        <Button
                          className="whitespace-nowrap"
                          onClick={() => onOpen(e)}
                          disabled={loading}
                        >
                          Open
                        </Button>

                        {e.source !== "holiday" ? (
                          <>
                            <Button
                              variant="primary"
                              className="whitespace-nowrap"
                              onClick={() => onCreateTask(e)}
                              disabled={loading}
                            >
                              Create task
                            </Button>
                            <Button
                              className="whitespace-nowrap"
                              onClick={() => onDeleteEvent(e)}
                              disabled={loading}
                            >
                              Delete
                            </Button>
                          </>
                        ) : (
                          <Button className="whitespace-nowrap" disabled>
                            Holiday
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-gray-500 mt-4">
                Sync creates ETD/ETA milestones + “Docs check” reminders 7 days
                before ETD. Create task creates a same-day action prompt. Set
                reminders creates 3-day reminders for milestones.
              </p>
            </Card>
          </div>

          <Card title="Quick actions" subtitle="Move like a pro">
            <div className="space-y-2">
              <Button
                variant="primary"
                className="w-full"
                onClick={onAddEvent}
                disabled={loading}
              >
                Add event
              </Button>
              <Button className="w-full" onClick={onSync} disabled={loading}>
                Sync from shipments
              </Button>
              <Button
                className="w-full"
                onClick={onExportIcal}
                disabled={loading}
              >
                Export iCal
              </Button>
              <Button
                className="w-full"
                onClick={onSetReminders}
                disabled={loading}
              >
                Set reminders (3 days)
              </Button>
            </div>

            <div className="mt-5 p-4 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-gray-100 text-[13px] font-semibold">Policy</p>
              <p className="text-gray-400 text-[12px] mt-1">
                Any event creation writes to{" "}
                <span className="text-[#FFA500]">All logs</span> for audit.
              </p>
            </div>
          </Card>
        </div>
      </PageShell>

      {/* Open event modal */}
      <Modal
        open={!!openEvent}
        title={openEvent?.title || "Event"}
        subtitle={
          openEvent
            ? `${openEvent.date} • ${safeTime(openEvent.time)} • ${
                openEvent.tag
              }`
            : ""
        }
        onClose={() => setOpenEvent(null)}
        footer={
          openEvent?.source !== "holiday" ? (
            <div className="flex gap-2 justify-between">
              <Button onClick={() => setOpenEvent(null)} disabled={loading}>
                Close
              </Button>

              <div className="flex gap-2">
                <Button
                  onClick={() => onDeleteEvent(openEvent)}
                  disabled={loading}
                >
                  Delete
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    const current = openEvent;
                    setOpenEvent(null);
                    onCreateTask(current);
                  }}
                  disabled={loading}
                >
                  Create task
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button onClick={() => setOpenEvent(null)} disabled={loading}>
                Close
              </Button>
            </div>
          )
        }
      >
        <div className="space-y-3">
          <div className="rounded-2xl bg-[#0B1118] border border-white/10 p-4">
            <p className="text-gray-300 text-[12px]">Kind</p>
            <p className="text-white text-[13px] font-semibold">
              {normKind(openEvent?.kind) || "event"}
            </p>
          </div>

          {openEvent?.meta ? (
            <div className="rounded-2xl bg-[#0B1118] border border-white/10 p-4">
              <p className="text-gray-300 text-[12px]">Notes</p>
              <p className="text-white text-[13px]">{openEvent.meta}</p>
            </div>
          ) : null}

          {openEvent?.shipmentId ? (
            <div className="rounded-2xl bg-[#0B1118] border border-white/10 p-4">
              <p className="text-gray-300 text-[12px]">Linked shipment</p>
              <p className="text-white text-[13px] font-semibold">
                {String(openEvent.shipmentId)}
              </p>
            </div>
          ) : null}

          <div className="rounded-2xl bg-[#0B1118] border border-white/10 p-4">
            <p className="text-gray-300 text-[12px]">Source</p>
            <p className="text-white text-[13px] font-semibold">
              {openEvent?.source || "manual"}
            </p>
          </div>
        </div>
      </Modal>

      {/* Create event modal */}
      <Modal
        open={createOpen}
        title="Add calendar event"
        subtitle="Create an operational event (stored in DB + logged)."
        onClose={() => setCreateOpen(false)}
        footer={
          <div className="flex gap-2 justify-end">
            <Button onClick={() => setCreateOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" onClick={submitCreate} disabled={loading}>
              Create
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <p className="text-gray-300 text-[12px] mb-1">Title</p>
            <input
              value={createForm.title}
              onChange={(e) =>
                setCreateForm((p) => ({ ...p, title: e.target.value }))
              }
              className="w-full rounded-2xl bg-[#0B1118] border border-white/10 px-4 py-3 text-white text-[13px] outline-none focus:border-[#FFA500]/40"
              placeholder="e.g., Docs deadline — ELX-LCL-..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <p className="text-gray-300 text-[12px] mb-1">Date</p>
              <input
                type="date"
                value={createForm.date}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, date: e.target.value }))
                }
                className="w-full rounded-2xl bg-[#0B1118] border border-white/10 px-4 py-3 text-white text-[13px] outline-none focus:border-[#FFA500]/40"
              />
            </div>

            <div>
              <p className="text-gray-300 text-[12px] mb-1">
                Time <span className="text-gray-500">(blank = all-day)</span>
              </p>
              <input
                type="time"
                value={createForm.time}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, time: e.target.value }))
                }
                disabled={normKind(createForm.kind) === "reminder"}
                className="w-full rounded-2xl bg-[#0B1118] border border-white/10 px-4 py-3 text-white text-[13px] outline-none focus:border-[#FFA500]/40 disabled:opacity-50"
              />
            </div>

            <div>
              <p className="text-gray-300 text-[12px] mb-1">Kind</p>
              <select
                value={createForm.kind}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, kind: e.target.value }))
                }
                className="w-full rounded-2xl bg-[#0B1118] border border-white/10 px-4 py-3 text-white text-[13px] outline-none focus:border-[#FFA500]/40"
              >
                <option value="event">event</option>
                <option value="milestone">milestone</option>
                <option value="reminder">reminder (all-day)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-gray-300 text-[12px] mb-1">Tag</p>
              <input
                value={createForm.tag}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, tag: e.target.value }))
                }
                className="w-full rounded-2xl bg-[#0B1118] border border-white/10 px-4 py-3 text-white text-[13px] outline-none focus:border-[#FFA500]/40"
                placeholder="Operations"
              />
            </div>

            <div>
              <p className="text-gray-300 text-[12px] mb-1">Notes</p>
              <input
                value={createForm.meta}
                onChange={(e) =>
                  setCreateForm((p) => ({ ...p, meta: e.target.value }))
                }
                className="w-full rounded-2xl bg-[#0B1118] border border-white/10 px-4 py-3 text-white text-[13px] outline-none focus:border-[#FFA500]/40"
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <p className="text-gray-100 text-[13px] font-semibold">
              Corporate standard
            </p>
            <p className="text-gray-400 text-[12px] mt-1">
              Reminders export as{" "}
              <span className="text-[#FFA500]">all-day</span> in iCal for clean
              operational visibility.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
