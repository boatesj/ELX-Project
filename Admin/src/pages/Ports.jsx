import { useEffect, useMemo, useState } from "react";
import { authRequest } from "../requestMethods";
import { FaEdit, FaTrash } from "react-icons/fa";

const initialForm = {
  code: "",
  name: "",
  country: "",
  type: "both", // origin / destination / both
  isActive: true,
};

function Ports() {
  const [ports, setPorts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchPorts = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await authRequest.get("/config/ports");
      setPorts(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load ports. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPorts();
  }, []);

  const sortedPorts = useMemo(() => {
    const list = Array.isArray(ports) ? ports : [];
    // Sort active first, then country, then name
    return [...list].sort((a, b) => {
      const aActive = a?.isActive ? 1 : 0;
      const bActive = b?.isActive ? 1 : 0;
      if (aActive !== bActive) return bActive - aActive;

      const ac = (a?.country || "").toLowerCase();
      const bc = (b?.country || "").toLowerCase();
      if (ac !== bc) return ac.localeCompare(bc);

      const an = (a?.name || "").toLowerCase();
      const bn = (b?.name || "").toLowerCase();
      return an.localeCompare(bn);
    });
  }, [ports]);

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

    try {
      if (editingId) {
        // UPDATE
        const res = await authRequest.put(`/config/ports/${editingId}`, form);
        const updated = res.data;
        setPorts((prev) =>
          prev.map((p) => (p._id === editingId ? updated : p))
        );
        setSuccess("Port updated successfully.");
      } else {
        // CREATE
        const res = await authRequest.post("/config/ports", form);
        const created = res.data;
        setPorts((prev) => [...prev, created]);
        setSuccess("Port added successfully.");
      }
      resetForm();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      setError("Could not save port. Please check details and try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (port) => {
    setForm({
      code: port.code || "",
      name: port.name || "",
      country: port.country || "",
      type: port.type || "both",
      isActive: port.isActive ?? true,
    });
    setEditingId(port._id);
    setSuccess("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    resetForm();
    setSuccess("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleActive = async (port) => {
    try {
      setError("");
      const updated = { ...port, isActive: !port.isActive };
      const res = await authRequest.put(`/config/ports/${port._id}`, updated);
      const saved = res.data;
      setPorts((prev) => prev.map((p) => (p._id === port._id ? saved : p)));
    } catch (err) {
      console.error(err);
      setError("Could not update port status.");
    }
  };

  const handleDelete = async (port) => {
    const confirmDelete = window.confirm(
      `Delete port "${port.code} – ${port.name}"? This cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      setError("");
      await authRequest.delete(`/config/ports/${port._id}`);
      setPorts((prev) => prev.filter((p) => p._id !== port._id));
      setSuccess("Port deleted.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      setError("Could not delete port.");
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#1A2930]">
            Ports
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage the list of ports available when creating shipments.
          </p>
        </div>
      </header>

      {/* Alerts */}
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

      {/* Add / Edit port form */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#1A2930]">
            {editingId ? "Edit port" : "Add new port"}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-xs text-gray-500 hover:text-gray-700 self-start sm:self-auto"
            >
              Cancel edit
            </button>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-3 md:grid-cols-5 md:items-end"
        >
          <div className="flex flex-col gap-1 md:col-span-1">
            <label className="text-xs font-semibold text-gray-600">
              Port code
            </label>
            <input
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder="TEMA"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FFA500] focus:outline-none"
              required
            />
          </div>

          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-xs font-semibold text-gray-600">
              Port name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Tema Port"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FFA500] focus:outline-none"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">
              Country
            </label>
            <input
              name="country"
              value={form.country}
              onChange={handleChange}
              placeholder="Ghana"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FFA500] focus:outline-none"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600">Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FFA500] focus:outline-none"
            >
              <option value="origin">Origin</option>
              <option value="destination">Destination</option>
              <option value="both">Both</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:justify-end">
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
                ? "Update port"
                : "Add port"}
            </button>
          </div>
        </form>
      </section>

      {/* Ports list */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#1A2930]">
            All ports ({ports.length})
          </h2>
          {loading && (
            <span className="text-xs text-gray-500">Loading ports...</span>
          )}
        </div>

        {/* MOBILE: cards */}
        <div className="md:hidden space-y-3">
          {!loading && sortedPorts.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-center text-xs text-gray-600">
              No ports added yet.
            </div>
          )}

          {sortedPorts.map((port) => (
            <div
              key={port._id || port.code}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500 font-mono">
                    {port.code}
                  </p>
                  <h3 className="text-base font-semibold text-[#1A2930] truncate">
                    {port.name}
                  </h3>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center rounded-full px-2 py-1 border border-gray-200 bg-gray-50 text-gray-700">
                      {port.country}
                    </span>
                    <span className="inline-flex items-center rounded-full px-2 py-1 border border-gray-200 bg-gray-50 text-gray-700 capitalize">
                      {port.type}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleActive(port)}
                      className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium ${
                        port.isActive
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-gray-100 text-gray-500 border border-gray-200"
                      }`}
                    >
                      {port.isActive ? "Active" : "Inactive"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => handleEdit(port)}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-[#1A2930] hover:border-[#FFA500]/50 hover:text-[#FFA500]"
                >
                  <FaEdit className="text-[12px]" />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(port)}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                >
                  <FaTrash className="text-[12px]" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* DESKTOP: table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#1A2930] text-white text-[11px] uppercase tracking-[0.14em]">
                <th className="px-3 py-2 text-left">Code</th>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Country</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedPorts.map((port) => (
                <tr
                  key={port._id || port.code}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-3 py-2 font-mono text-xs text-gray-800">
                    {port.code}
                  </td>
                  <td className="px-3 py-2 text-gray-800">{port.name}</td>
                  <td className="px-3 py-2 text-gray-600">{port.country}</td>
                  <td className="px-3 py-2 text-gray-600 capitalize">
                    {port.type}
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(port)}
                      className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium ${
                        port.isActive
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-gray-100 text-gray-500 border border-gray-200"
                      }`}
                    >
                      {port.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-3 py-2 text-right text-xs">
                    <div className="inline-flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(port)}
                        className="inline-flex items-center gap-1 text-[#1A2930] hover:text-[#FFA500]"
                      >
                        <FaEdit className="text-[12px]" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(port)}
                        className="inline-flex items-center gap-1 text-red-500 hover:text-red-600"
                      >
                        <FaTrash className="text-[12px]" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && sortedPorts.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-4 text-center text-xs text-gray-500"
                  >
                    No ports added yet.
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

export default Ports;
