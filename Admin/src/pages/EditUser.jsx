import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const USERS_API = `${API_BASE}/users`;

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

  const fetchUser = async () => {
    setLoading(true);
    setLoadError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoadError("Please log in to edit this customer.");
        navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
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
        navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to load user");
      }

      const data = await res.json();
      const u = data.user || data;

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
        navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
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
        navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update user");
      }

      setSaveSuccess("Customer details updated successfully.");
      // Optional: navigate back to details after a short delay
      setTimeout(() => {
        navigate(`/users/${id}`);
      }, 800);
    } catch (err) {
      console.error(err);
      setSaveError(err.message || "Something went wrong saving changes.");
    }
  };

  return (
    <div className="m-[30px] bg-[#D9D9D9] p-[20px] rounded-md">
      {/* Header – matches Shipments/Users */}
      <div className="flex items-center justify-between mb-[20px]">
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-xs font-semibold text-[#1A2930] hover:text-[#FFA500] underline-offset-2 hover:underline"
          >
            ← Back to customer profile
          </button>
          <h1 className="text-[20px] font-semibold">Edit Customer</h1>
          <p className="text-xs text-gray-700">
            Update CRM details used for quotes, bookings and documents.
          </p>
        </div>
      </div>

      {loadError && (
        <div className="mb-3 px-4 py-2 rounded-md bg-red-100 text-red-800 text-sm border border-red-300">
          {loadError}
        </div>
      )}

      {saveError && (
        <div className="mb-3 px-4 py-2 rounded-md bg-red-100 text-red-800 text-sm border border-red-300">
          {saveError}
        </div>
      )}

      {saveSuccess && (
        <div className="mb-3 px-4 py-2 rounded-md bg-green-100 text-green-800 text-sm border border-green-300">
          {saveSuccess}
        </div>
      )}

      {/* Main card – like Shipments grid wrapper */}
      <div className="bg-white rounded-md p-4 shadow-md">
        {loading ? (
          <p className="text-sm text-gray-600">Loading customer details…</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account section */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name / Company
                </label>
                <input
                  type="text"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Account Type
                </label>
                <select
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  User Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
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
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Postcode
                </label>
                <input
                  type="text"
                  name="postcode"
                  value={formData.postcode}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
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
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Internal Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(`/users/${id}`)}
                className="px-4 py-2 rounded-md text-xs font-semibold border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-md text-xs font-semibold bg-[#1A2930] text-white hover:bg-[#FFA500] hover:text-black transition"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditUser;
