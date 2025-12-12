import { useEffect, useMemo, useState } from "react";
import { authRequest } from "../requestMethods";
import { FaEdit, FaTrash } from "react-icons/fa";

const initialForm = {
  key: "",
  label: "",
  description: "",
  isHazardousPossible: false,
  isActive: true,
};

function CargoCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await authRequest.get("/config/cargo-categories");
      setCategories(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load cargo categories. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const sortedCategories = useMemo(() => {
    const list = Array.isArray(categories) ? categories : [];
    // Sort active first, then label
    return [...list].sort((a, b) => {
      const aActive = a?.isActive ? 1 : 0;
      const bActive = b?.isActive ? 1 : 0;
      if (aActive !== bActive) return bActive - aActive;
      const al = (a?.label || "").toLowerCase();
      const bl = (b?.label || "").toLowerCase();
      return al.localeCompare(bl);
    });
  }, [categories]);

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
        const res = await authRequest.put(
          `/config/cargo-categories/${editingId}`,
          form
        );
        const updated = res.data;
        setCategories((prev) =>
          prev.map((cat) => (cat._id === editingId ? updated : cat))
        );
        setSuccess("Cargo category updated successfully.");
      } else {
        const res = await authRequest.post("/config/cargo-categories", form);
        const created = res.data;
        setCategories((prev) => [...prev, created]);
        setSuccess("Cargo category added successfully.");
      }
      resetForm();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      setError(
        "Could not save cargo category. Please check details and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setForm({
      key: item.key || "",
      label: item.label || "",
      description: item.description || "",
      isHazardousPossible: item.isHazardousPossible ?? false,
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleActive = async (item) => {
    try {
      setError("");
      const updatedData = { ...item, isActive: !item.isActive };
      const res = await authRequest.put(
        `/config/cargo-categories/${item._id}`,
        updatedData
      );
      const updated = res.data;
      setCategories((prev) =>
        prev.map((cat) => (cat._id === item._id ? updated : cat))
      );
    } catch (err) {
      console.error(err);
      setError("Could not update category status.");
    }
  };

  const handleToggleHazardous = async (item) => {
    try {
      setError("");
      const updatedData = {
        ...item,
        isHazardousPossible: !item.isHazardousPossible,
      };
      const res = await authRequest.put(
        `/config/cargo-categories/${item._id}`,
        updatedData
      );
      const updated = res.data;
      setCategories((prev) =>
        prev.map((cat) => (cat._id === item._id ? updated : cat))
      );
    } catch (err) {
      console.error(err);
      setError("Could not update hazardous flag.");
    }
  };

  const handleDelete = async (item) => {
    const confirmDelete = window.confirm(
      `Delete cargo category "${item.label}"? This cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      setError("");
      await authRequest.delete(`/config/cargo-categories/${item._id}`);
      setCategories((prev) => prev.filter((cat) => cat._id !== item._id));
      setSuccess("Cargo category deleted.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      setError("Could not delete cargo category.");
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#1A2930]">
            Cargo categories
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Define cargo types used in bookings and shipment details.
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

      {/* FORM */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#1A2930]">
            {editingId ? "Edit cargo category" : "Add new cargo category"}
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
          className="grid gap-3 md:grid-cols-6 md:items-end"
        >
          <div className="flex flex-col gap-1 md:col-span-1">
            <label className="text-xs font-semibold text-gray-600">
              Key (internal)
            </label>
            <input
              name="key"
              value={form.key}
              onChange={handleChange}
              placeholder="vehicle"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FFA500] focus:outline-none"
              required
            />
            <p className="mt-1 text-[11px] text-gray-400">
              Lowercase, snake_case if compound.
            </p>
          </div>

          <div className="flex flex-col gap-1 md:col-span-1">
            <label className="text-xs font-semibold text-gray-600">
              Label (display name)
            </label>
            <input
              name="label"
              value={form.label}
              onChange={handleChange}
              placeholder="Vehicle"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FFA500] focus:outline-none"
              required
            />
          </div>

          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-xs font-semibold text-gray-600">
              Description
            </label>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Cars, vans, pickups and SUVs."
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FFA500] focus:outline-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:col-span-1 md:justify-end">
            <div className="flex flex-col gap-1">
              <label className="flex items-center gap-2 text-xs text-gray-600">
                <input
                  type="checkbox"
                  name="isHazardousPossible"
                  checked={form.isHazardousPossible}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-[#FFA500] focus:ring-[#FFA500]"
                />
                Hazmat possible
              </label>
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
            </div>

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

      {/* LIST */}
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#1A2930]">
            All cargo categories ({categories.length})
          </h2>

          {loading && (
            <span className="text-xs text-gray-500">
              Loading cargo categories...
            </span>
          )}
        </div>

        {/* MOBILE: cards */}
        <div className="md:hidden space-y-3">
          {!loading && sortedCategories.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-center text-xs text-gray-600">
              No cargo categories configured yet.
            </div>
          )}

          {sortedCategories.map((item) => (
            <div
              key={item._id || item.key}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">
                    {item.key}
                  </p>
                  <h3 className="text-base font-semibold text-[#1A2930] truncate">
                    {item.label}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {item.description || "—"}
                  </p>
                </div>

                <div className="flex flex-col gap-2 items-end">
                  <button
                    type="button"
                    onClick={() => handleToggleHazardous(item)}
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      item.isHazardousPossible
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-gray-100 text-gray-500 border border-gray-200"
                    }`}
                  >
                    {item.isHazardousPossible
                      ? "Hazmat: Allowed"
                      : "Hazmat: No"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleActive(item)}
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      item.isActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-gray-100 text-gray-500 border border-gray-200"
                    }`}
                  >
                    {item.isActive ? "Status: Active" : "Status: Inactive"}
                  </button>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => handleEdit(item)}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-[#1A2930] hover:border-[#FFA500]/50 hover:text-[#FFA500]"
                >
                  <FaEdit className="text-[12px]" />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(item)}
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
                <th className="px-3 py-2 text-left">Key</th>
                <th className="px-3 py-2 text-left">Label</th>
                <th className="px-3 py-2 text-left">Description</th>
                <th className="px-3 py-2 text-left">Hazmat</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedCategories.map((item) => (
                <tr
                  key={item._id || item.key}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-3 py-2 font-mono text-xs text-gray-800">
                    {item.key}
                  </td>
                  <td className="px-3 py-2 text-gray-800">{item.label}</td>
                  <td className="px-3 py-2 text-gray-600">
                    {item.description || "—"}
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => handleToggleHazardous(item)}
                      className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium ${
                        item.isHazardousPossible
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-gray-100 text-gray-500 border border-gray-200"
                      }`}
                    >
                      {item.isHazardousPossible ? "Allowed" : "Not allowed"}
                    </button>
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

              {!loading && sortedCategories.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-4 text-center text-xs text-gray-500"
                  >
                    No cargo categories configured yet.
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

export default CargoCategories;
