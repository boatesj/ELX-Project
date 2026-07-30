
import { useEffect, useState } from "react";
import { authRequest } from "../requestMethods";
import { FaEdit, FaTrash } from "react-icons/fa";

const DESTINATIONS = [
  { value: "ghana", label: "Ghana" },
  { value: "nigeria", label: "Nigeria" },
  { value: "kenya", label: "Kenya" },
  { value: "sierra-leone", label: "Sierra Leone" },
  { value: "cote-divoire", label: "Côte d'Ivoire" },
];

const SERVICES = [
  { value: "roro", label: "RoRo" },
  { value: "fcl20", label: "FCL — 20ft" },
  { value: "fcl40", label: "FCL — 40ft" },
  { value: "lcl", label: "LCL" },
  { value: "air", label: "Air freight" },
];

const initialForm = {
  destination: "ghana",
  service: "roro",
  label: "",
  priceFrom: "",
  currency: "GBP",
  unit: "",
  isActive: true,
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

function Rates() {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchRates = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await authRequest.get("/rates");
      setRates(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load rates. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      ...form,
      priceFrom: Number(form.priceFrom),
    };

    try {
      if (editingId) {
        const res = await authRequest.put(`/rates/${editingId}`, payload);
        const updated = res.data;
        setRates((prev) =>
          prev.map((r) => (r._id === editingId ? updated : r))
        );
        setSuccess("Rate updated successfully.");
      } else {
        const res = await authRequest.post("/rates", payload);
        const created = res.data;
        setRates((prev) => [...prev, created]);
        setSuccess("Rate added successfully.");
      }
      resetForm();
    } catch (err) {
      console.error(err);
      const message =
        err?.response?.data?.message ||
        "Could not save rate. Check that this destination/service combination doesn't already exist.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setForm({
      destination: item.destination || "ghana",
      service: item.service || "roro",
      label: item.label || "",
      priceFrom: item.priceFrom ?? "",
      currency: item.currency || "GBP",
      unit: item.unit || "",
      isActive: item.isActive ?? true,
    });
    setEditingId(item._id);
    setSuccess("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    resetForm();
    setSuccess("");
    setError("");
  };

  const handleToggleActive = async (item) => {
    try {
      const res = await authRequest.put(`/rates/${item._id}`, {
        ...item,
        isActive: !item.isActive,
      });
      const updated = res.data;
      setRates((prev) => prev.map((r) => (r._id === item._id ? updated : r)));
    } catch (err) {
      console.error(err);
      setError("Could not update rate status.");
    }
  };

  const handleDelete = async (item) => {
    const confirmDelete = window.confirm(
      `Delete the ${item.service.toUpperCase()} rate for ${item.destination}? This cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      await authRequest.delete(`/rates/${item._id}`);
      setRates((prev) => prev.filter((r) => r._id !== item._id));
      setSuccess("Rate deleted.");
    } catch (err) {
      console.error(err);
      setError("Could not delete rate.");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A2930]">
            Instant quote rates
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            These prices power the "Get an instant estimate" widget on the
            public destination pages. Updating a rate here goes live
            immediately — no code change or deploy needed.
          </p>
        </div>
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
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#1A2930]">
            {editingId ? "Edit rate" : "Add new rate"}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Cancel edit
            </button>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-3 md:grid-cols-6 md:items-end"
        >
          <div className="flex flex-col gap-1 md:col-span-1">
            <label className="text-xs font-semibold text-gray-600">
              Destination
            </label>
            <select
              name="destination"
              value={form.destination}
              onChange={handleChange}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FFA500] focus:outline-none"
            >
              {DESTINATIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 md:col-span-1">
            <label className="text-xs font-semibold text-gray-600">
              Service
            </label>
            <select
              name="service"
              value={form.service}
              onChange={handleChange}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FFA500] focus:outline-none"
            >
              {SERVICES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 md:col-span-1">
            <label className="text-xs font-semibold text-gray-600">
              Label (shown in dropdown)
            </label>
            <input
              name="label"
              value={form.label}
              onChange={handleChange}
              placeholder="RoRo — per vehicle"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FFA500] focus:outline-none"
              required
            />
          </div>

          <div className="flex flex-col gap-1 md:col-span-1">
            <label className="text-xs font-semibold text-gray-600">
              Price from (£)
            </label>
            <input
              name="priceFrom"
              type="number"
              min="0"
              step="1"
              value={form.priceFrom}
              onChange={handleChange}
              placeholder="750"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FFA500] focus:outline-none"
              required
            />
          </div>

          <div className="flex flex-col gap-1 md:col-span-1">
            <label className="text-xs font-semibold text-gray-600">
              Unit
            </label>
            <input
              name="unit"
              value={form.unit}
              onChange={handleChange}
              placeholder="per vehicle / unit"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FFA500] focus:outline-none"
              required
            />
          </div>

          <div className="flex items-center gap-3 md:col-span-1 md:justify-end">
            <label className="flex items-center gap-2 text-xs text-gray-600">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-[#FFA500] focus:ring-[#FFA500]"
              />
              Active
            </label>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#FFA500] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#1A2930] hover:bg-[#ffb732] disabled:opacity-60"
            >
              {saving
                ? editingId
                  ? "Updating..."
                  : "Saving..."
                : editingId
                ? "Update"
                : "Add"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#1A2930]">
            All rates ({rates.length})
          </h2>
          {loading && (
            <span className="text-xs text-gray-500">Loading rates...</span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#1A2930] text-white text-[11px] uppercase tracking-[0.14em]">
                <th className="px-3 py-2 text-left">Destination</th>
                <th className="px-3 py-2 text-left">Service</th>
                <th className="px-3 py-2 text-left">Label</th>
                <th className="px-3 py-2 text-right">Price from</th>
                <th className="px-3 py-2 text-left">Unit</th>
                <th className="px-3 py-2 text-left">Last reviewed</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((item) => (
                <tr
                  key={item._id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-3 py-2 text-gray-800 capitalize">
                    {item.destination}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-gray-800 uppercase">
                    {item.service}
                  </td>
                  <td className="px-3 py-2 text-gray-800">{item.label}</td>
                  <td className="px-3 py-2 text-right font-semibold text-gray-800">
                    {item.currency === "GBP" ? "£" : item.currency + " "}
                    {Number(item.priceFrom).toLocaleString("en-GB")}
                  </td>
                  <td className="px-3 py-2 text-gray-600">{item.unit}</td>
                  <td className="px-3 py-2 text-gray-500 text-xs">
                    {formatDate(item.updatedAt)}
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(item)}
                      className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium ${
                        item.isActive
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-gray-100 text-gray-500 border border-gray-200"
                      }`}
                    >
                      {item.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-3 py-2 text-right text-xs">
                    <div className="inline-flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="inline-flex items-center gap-1 text-[#1A2930] hover:text-[#FFA500]"
                      >
                        <FaEdit className="text-[12px]" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="inline-flex items-center gap-1 text-red-500 hover:text-red-600"
                      >
                        <FaTrash className="text-[12px]" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && rates.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-4 text-center text-xs text-gray-500"
                  >
                    No rates configured yet.
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

export default Rates;

