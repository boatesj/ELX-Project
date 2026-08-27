import { useEffect, useState } from "react";
import { authRequest } from "../requestMethods";
import { FaTrash, FaPaperPlane } from "react-icons/fa";

const SERVICE_TYPES = ["Air Freight", "RoRo", "FCL/LCL", "Document", "Other"];

const initialForm = {
  name: "",
  organisation: "",
  contactEmail: "",
  contactPhone: "",
  serviceType: "Air Freight",
  notes: "",
};

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function QuickLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sendingId, setSendingId] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await authRequest.get("/quicklog");
      setLogs(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load logged customers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await authRequest.post("/quicklog", form);
      setLogs((prev) => [res.data, ...prev]);
      setForm(initialForm);
      setSuccess("Customer logged.");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Could not log this customer.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (log) => {
    const confirmDelete = window.confirm(`Remove ${log.name} from the log? This cannot be undone.`);
    if (!confirmDelete) return;

    try {
      await authRequest.delete(`/quicklog/${log._id}`);
      setLogs((prev) => prev.filter((l) => l._id !== log._id));
      setSuccess("Log entry removed.");
    } catch (err) {
      console.error(err);
      setError("Could not remove this log entry.");
    }
  };

  const handleSendFeedback = async (log) => {
    if (!log.contactEmail) {
      setError(`${log.name} has no email on file — add one before requesting feedback.`);
      return;
    }

    setSendingId(log._id);
    setError("");
    setSuccess("");

    try {
      await authRequest.post("/feedback/request", {
        source: "quicklog",
        quickLogId: log._id,
        clientName: log.name,
        organisation: log.organisation || log.name,
        email: log.contactEmail,
        context: [log.serviceType, log.notes].filter(Boolean).join(" — "),
      });
      setLogs((prev) =>
        prev.map((l) => (l._id === log._id ? { ...l, feedbackRequested: true } : l))
      );
      setSuccess(`Feedback request emailed to ${log.contactEmail}.`);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Could not send feedback request.");
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-[#1A2930]">Customer log</h1>
        <p className="mt-1 text-sm text-gray-500">
          For pre-existing customers you're still serving outside the website — log them here so
          you can request feedback from them the same way as any other shipment.
        </p>
      </header>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-[#1A2930] mb-3">Log a customer</h2>
        <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-6 md:items-end">
          <div className="flex flex-col gap-1 md:col-span-1">
            <label className="text-xs font-semibold text-gray-600">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Dr. Kwame Asante"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FFA500] focus:outline-none"
              required
            />
          </div>

          <div className="flex flex-col gap-1 md:col-span-1">
            <label className="text-xs font-semibold text-gray-600">Organisation</label>
            <input
              name="organisation"
              value={form.organisation}
              onChange={handleChange}
              placeholder="University of Ghana"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FFA500] focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1 md:col-span-1">
            <label className="text-xs font-semibold text-gray-600">Email</label>
            <input
              name="contactEmail"
              type="email"
              value={form.contactEmail}
              onChange={handleChange}
              placeholder="director@ug.edu.gh"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FFA500] focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1 md:col-span-1">
            <label className="text-xs font-semibold text-gray-600">Phone</label>
            <input
              name="contactPhone"
              value={form.contactPhone}
              onChange={handleChange}
              placeholder="+233 20 000 0000"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FFA500] focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1 md:col-span-1">
            <label className="text-xs font-semibold text-gray-600">Service</label>
            <select
              name="serviceType"
              value={form.serviceType}
              onChange={handleChange}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FFA500] focus:outline-none"
            >
              {SERVICE_TYPES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center md:col-span-1 md:justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#FFA500] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#1A2930] hover:bg-[#ffb732] disabled:opacity-60"
            >
              {saving ? "Saving..." : "Log customer"}
            </button>
          </div>

          <div className="flex flex-col gap-1 md:col-span-6">
            <label className="text-xs font-semibold text-gray-600">Notes (optional)</label>
            <input
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Route, cargo, or anything worth remembering"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FFA500] focus:outline-none"
            />
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#1A2930]">
            Logged customers ({logs.length})
          </h2>
          {loading && <span className="text-xs text-gray-500">Loading...</span>}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#1A2930] text-white text-[11px] uppercase tracking-[0.14em]">
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Organisation</th>
                <th className="px-3 py-2 text-left">Service</th>
                <th className="px-3 py-2 text-left">Logged</th>
                <th className="px-3 py-2 text-left">Feedback</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-800">
                    {log.name}
                    {log.contactEmail && (
                      <div className="text-[11px] text-gray-400">{log.contactEmail}</div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-gray-600">{log.organisation || "—"}</td>
                  <td className="px-3 py-2 text-gray-600">{log.serviceType}</td>
                  <td className="px-3 py-2 text-gray-500 text-xs">{formatDate(log.loggedAt)}</td>
                  <td className="px-3 py-2">
                    {log.feedbackRequested ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 text-[11px] font-medium">
                        Requested
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-500 border border-gray-200 px-2 py-1 text-[11px] font-medium">
                        Not sent
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right text-xs">
                    <div className="inline-flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleSendFeedback(log)}
                        disabled={sendingId === log._id}
                        className="inline-flex items-center gap-1 text-[#1A2930] hover:text-[#FFA500] disabled:opacity-50"
                      >
                        <FaPaperPlane className="text-[12px]" />
                        <span>{sendingId === log._id ? "Sending..." : "Request feedback"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(log)}
                        className="inline-flex items-center gap-1 text-red-500 hover:text-red-600"
                      >
                        <FaTrash className="text-[12px]" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-4 text-center text-xs text-gray-500">
                    No customers logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default QuickLog;
