import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import PageShell from "../components/PageShell";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const USERS_API = `${API_BASE_URL}/api/v1/users`;

const STATUS_OPTIONS = ["pending", "active", "suspended"];
const ROLE_OPTIONS = ["Shipper", "Consignee", "Both", "Admin"];
const ACCOUNT_TYPES = ["Business", "Individual"];

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    accountType: "Business",
    fullname: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    postcode: "",
    address: "",
    role: "Shipper",
    notes: "",
    status: "pending",
  });

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  const redirectToLogin = () => {
    const redirect = encodeURIComponent(location.pathname + location.search);
    navigate(`/login?redirect=${redirect}`, { replace: true });
  };

  const fetchUser = async () => {
    setLoading(true);
    setLoadError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoadError("Please log in to edit this customer.");
        redirectToLogin();
        setLoading(false);
        return;
      }

      const res = await fetch(`${USERS_API}/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        setLoadError("Your session has expired. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        redirectToLogin();
        setLoading(false);
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to load user");
      }

      const data = await res.json();
      const u = data.user || data.data || data;

      setFormData({
        accountType: u.accountType || "Business",
        fullname: u.fullname || u.name || "",
        email: u.email || "",
        phone: u.phone || "",
        country: u.country || "",
        city: u.city || "",
        postcode: u.postcode || "",
        address: u.address || "",
        role: u.role || "Shipper",
        notes: u.notes || "",
        status: u.status || "pending",
      });
    } catch (err) {
      console.error(err);
      setLoadError(err.message || "Something went wrong loading this user.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError("");
    setSaveSuccess("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setSaveError("Please log in to save changes.");
        redirectToLogin();
        return;
      }

      const res = await fetch(`${USERS_API}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.status === 401) {
        setSaveError("Your session has expired. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        redirectToLogin();
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update user");
      }

      setSaveSuccess("Customer details updated successfully.");
      setTimeout(() => {
        navigate(`/users/${id}`);
      }, 700);
    } catch (err) {
      console.error(err);
      setSaveError(err.message || "Something went wrong saving changes.");
    }
  };

  return (
    <PageShell
      title="Edit customer"
      subtitle="Update CRM details used for quotes, bookings and documents."
      right={
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="
            rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em]
            border border-white/10 text-white/85 hover:text-white hover:bg-white/10 transition
          "
        >
          Back
        </button>
      }
    >
      {loadError ? (
        <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {loadError}
        </div>
      ) : null}

      {saveError ? (
        <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {saveError}
        </div>
      ) : null}

      {saveSuccess ? (
        <div className="mb-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {saveSuccess}
        </div>
      ) : null}

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl">
        {loading ? (
          <p className="text-sm text-white/70">Loading customer details…</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Full Name / Company
                </label>
                <input
                  type="text"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                  className="
                    w-full rounded-xl bg-[#0B1118] border border-white/10
                    px-3 py-2 text-sm text-white outline-none
                    focus:ring-2 focus:ring-[#FFA500]/40
                  "
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Account Type
                </label>
                <select
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleChange}
                  className="
                    w-full rounded-xl bg-[#0B1118] border border-white/10
                    px-3 py-2 text-sm text-white outline-none
                    focus:ring-2 focus:ring-[#FFA500]/40
                  "
                >
                  {ACCOUNT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contact + role */}
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="
                    w-full rounded-xl bg-[#0B1118] border border-white/10
                    px-3 py-2 text-sm text-white outline-none
                    focus:ring-2 focus:ring-[#FFA500]/40
                  "
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="
                    w-full rounded-xl bg-[#0B1118] border border-white/10
                    px-3 py-2 text-sm text-white outline-none
                    focus:ring-2 focus:ring-[#FFA500]/40
                  "
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  User Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="
                    w-full rounded-xl bg-[#0B1118] border border-white/10
                    px-3 py-2 text-sm text-white outline-none
                    focus:ring-2 focus:ring-[#FFA500]/40
                  "
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Address */}
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="
                    w-full rounded-xl bg-[#0B1118] border border-white/10
                    px-3 py-2 text-sm text-white outline-none
                    focus:ring-2 focus:ring-[#FFA500]/40
                  "
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="
                    w-full rounded-xl bg-[#0B1118] border border-white/10
                    px-3 py-2 text-sm text-white outline-none
                    focus:ring-2 focus:ring-[#FFA500]/40
                  "
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Postcode
                </label>
                <input
                  type="text"
                  name="postcode"
                  value={formData.postcode}
                  onChange={handleChange}
                  className="
                    w-full rounded-xl bg-[#0B1118] border border-white/10
                    px-3 py-2 text-sm text-white outline-none
                    focus:ring-2 focus:ring-[#FFA500]/40
                  "
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="
                    w-full rounded-xl bg-[#0B1118] border border-white/10
                    px-3 py-2 text-sm text-white outline-none
                    focus:ring-2 focus:ring-[#FFA500]/40
                  "
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="
                  w-full rounded-xl bg-[#0B1118] border border-white/10
                  px-3 py-2 text-sm text-white outline-none
                  focus:ring-2 focus:ring-[#FFA500]/40
                "
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">
                Internal Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="
                  w-full rounded-xl bg-[#0B1118] border border-white/10
                  px-3 py-2 text-sm text-white outline-none
                  focus:ring-2 focus:ring-[#FFA500]/40
                "
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(`/users/${id}`)}
                className="
                  rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em]
                  border border-white/10 text-white/85 hover:text-white hover:bg-white/10 transition
                "
              >
                Cancel
              </button>
              <button
                type="submit"
                className="
                  rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em]
                  bg-[#FFA500] text-[#071013] hover:brightness-105 active:brightness-95 transition
                "
              >
                Save changes
              </button>
            </div>
          </form>
        )}
      </div>
    </PageShell>
  );
};

export default EditUser;
