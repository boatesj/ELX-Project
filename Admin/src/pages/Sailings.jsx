
import { useEffect, useState } from "react";
import { authRequest } from "../requestMethods";
import { FaEdit, FaTrash } from "react-icons/fa";

const MODES = [
  { value: "sea",  label: "Sea freight (FCL/LCL)" },
  { value: "roro", label: "RoRo vehicle shipping" },
  { value: "air",  label: "Air freight" },
];

const DESTINATIONS = [
  { value: "ghana",        label: "Ghana" },
  { value: "nigeria",      label: "Nigeria" },
  { value: "kenya",        label: "Kenya" },
  { value: "sierra-leone", label: "Sierra Leone" },
  { value: "cote-divoire", label: "Côte d'Ivoire" },
  { value: "benin",        label: "Benin" },
  { value: "multiple",     label: "Multiple destinations" },
];

const SPACES = ["Available", "Limited", "Full", "On request"];

const empty = {
  mode: "sea",
  vesselOrRoute: "",
  departurePort: "",
  destinationPort: "",
  destination: "ghana",
  closingDate: "",
  departureDate: "",
  eta: "",
  spacesLabel: "Available",
  notes: "",
  isActive: true,
};

function fmt(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const field = "w-full bg-[#0a0f14] border border-[#1f2937] rounded-xl px-3 py-2.5 text-sm text-gray-200 outline-none focus:border-[#FFA500]/50 placeholder:text-gray-600";

export default function Sailings() {
  const [sailings, setSailings] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await authRequest.get("/api/v1/sailings/all");
      setSailings(res.data);
    } catch { setError("Failed to load sailings."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const setCheck = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.checked }));

  const startEdit = (s) => {
    setEditingId(s._id);
    setForm({
      mode: s.mode,
      vesselOrRoute: s.vesselOrRoute,
      departurePort: s.departurePort,
      destinationPort: s.destinationPort,
      destination: s.destination,
      closingDate: s.closingDate ? s.closingDate.slice(0, 10) : "",
      departureDate: s.departureDate ? s.departureDate.slice(0, 10) : "",
      eta: s.eta ? s.eta.slice(0, 10) : "",
      spacesLabel: s.spacesLabel || "Available",
      notes: s.notes || "",
      isActive: s.isActive,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const reset = () => { setEditingId(null); setForm(empty); setError(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.vesselOrRoute.trim() || !form.departureDate || !form.closingDate) {
      setError("Vessel/route, closing date, and departure date are required.");
      return;
    }
    setSaving(true); setError("");
    try {
      if (editingId) {
        await authRequest.put(`/api/v1/sailings/${editingId}`, form);
      } else {
        await authRequest.post("/api/v1/sailings", form);
      }
      reset();
      load();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not save sailing.");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, label) => {
    if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return;
    try {
      await authRequest.delete(`/api/v1/sailings/${id}`);
      load();
    } catch { setError("Failed to delete sailing."); }
  };

  const modeChip = (mode) => {
    const map = { sea: "bg-sky-500/15 text-sky-300 border-sky-500/40", roro: "bg-violet-500/15 text-violet-300 border-violet-500/40", air: "bg-amber-500/15 text-amber-300 border-amber-500/40" };
    const labels = { sea: "Sea", roro: "RoRo", air: "Air" };
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${map[mode] || ""}`}>{labels[mode] || mode}</span>;
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-white mb-1">{editingId ? "Edit sailing" : "Add sailing"}</h2>
        <p className="text-xs text-gray-500">Sailings appear on the homepage when departure date is in the future and isActive is on.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#020617] border border-[#1f2937] rounded-2xl p-5 mb-8 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-widest mb-1 block">Mode</label>
            <select value={form.mode} onChange={set("mode")} className={field}>
              {MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-widest mb-1 block">Destination country</label>
            <select value={form.destination} onChange={set("destination")} className={field}>
              {DESTINATIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 uppercase tracking-widest mb-1 block">Vessel name / Route label</label>
          <input value={form.vesselOrRoute} onChange={set("vesselOrRoute")} placeholder="e.g. Grande Gabon 0526 or LHR → ACC" className={field} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-widest mb-1 block">Departure port</label>
            <input value={form.departurePort} onChange={set("departurePort")} placeholder="e.g. Tilbury" className={field} />
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-widest mb-1 block">Destination port</label>
            <input value={form.destinationPort} onChange={set("destinationPort")} placeholder="e.g. Tema Port" className={field} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-widest mb-1 block">Booking closes</label>
            <input type="date" value={form.closingDate} onChange={set("closingDate")} className={field} />
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-widest mb-1 block">Departure date</label>
            <input type="date" value={form.departureDate} onChange={set("departureDate")} className={field} />
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-widest mb-1 block">ETA (optional)</label>
            <input type="date" value={form.eta} onChange={set("eta")} className={field} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-widest mb-1 block">Spaces</label>
            <select value={form.spacesLabel} onChange={set("spacesLabel")} className={field}>
              {SPACES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-widest mb-1 block">Notes (optional)</label>
            <input value={form.notes} onChange={set("notes")} placeholder="e.g. Containers only" className={field} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="isActive" checked={form.isActive} onChange={setCheck("isActive")} className="accent-[#FFA500]" />
          <label htmlFor="isActive" className="text-sm text-gray-300">Active (show on website)</label>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 rounded-full bg-[#FFA500] text-black text-xs font-bold uppercase tracking-widest hover:brightness-110 transition disabled:opacity-40">
            {saving ? "Saving…" : editingId ? "Update sailing" : "Add sailing"}
          </button>
          {editingId && (
            <button type="button" onClick={reset}
              className="px-6 py-2.5 rounded-full border border-[#1f2937] text-gray-400 text-xs font-semibold uppercase tracking-widest hover:text-white transition">
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading sailings…</p>
      ) : sailings.length === 0 ? (
        <p className="text-gray-500 text-sm">No sailings yet. Add your first one above.</p>
      ) : (
        <div className="space-y-3">
          {sailings.map((s) => (
            <div key={s._id} className="bg-[#020617] border border-[#1f2937] rounded-2xl px-5 py-4 flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  {modeChip(s.mode)}
                  {!s.isActive && <span className="text-xs text-gray-600 border border-gray-700 rounded-full px-2 py-0.5">Inactive</span>}
                  {new Date(s.departureDate) < new Date() && <span className="text-xs text-red-400 border border-red-900 rounded-full px-2 py-0.5">Past</span>}
                </div>
                <p className="text-sm font-semibold text-white">{s.vesselOrRoute}</p>
                <p className="text-xs text-gray-400">{s.departurePort} → {s.destinationPort}</p>
                <div className="flex gap-4 text-xs text-gray-500 mt-1">
                  <span>Closes: <span className="text-gray-300">{fmt(s.closingDate)}</span></span>
                  <span>Departs: <span className="text-gray-300">{fmt(s.departureDate)}</span></span>
                  {s.eta && <span>ETA: <span className="text-gray-300">{fmt(s.eta)}</span></span>}
                  <span className="text-[#FFA500]">{s.spacesLabel}</span>
                </div>
                {s.notes && <p className="text-xs text-gray-600 mt-0.5">{s.notes}</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => startEdit(s)} className="p-2 rounded-lg border border-[#1f2937] text-gray-400 hover:text-[#FFA500] hover:border-[#FFA500]/40 transition"><FaEdit size={13} /></button>
                <button onClick={() => handleDelete(s._id, s.vesselOrRoute)} className="p-2 rounded-lg border border-[#1f2937] text-gray-400 hover:text-red-400 hover:border-red-900/60 transition"><FaTrash size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
