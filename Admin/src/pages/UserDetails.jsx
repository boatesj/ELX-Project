import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const USERS_API = `${API_BASE}/users`;

const getUserStatusClasses = (status) => {
  const s = (status || "").toLowerCase();
  switch (s) {
    case "active":
      return "bg-green-100 text-green-700 border border-green-300";
    case "suspended":
      return "bg-red-100 text-red-700 border border-red-300";
    case "pending":
    default:
      return "bg-gray-100 text-gray-700 border border-gray-300";
  }
};

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(false);

  const displayDate = (iso) =>
    iso ? new Date(iso).toISOString().slice(0, 10) : "—";

  const fetchUser = async () => {
    setLoading(true);
    setLoadError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoadError("Please log in to view this customer profile.");
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
        throw new Error(errorData.message || "Failed to load user details");
      }

      const data = await res.json();
      setUser(data.user || data);
    } catch (err) {
      console.error(err);
      setLoadError(err.message || "Something went wrong loading this profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div className="m-[30px] bg-[#D9D9D9] p-[20px] rounded-md">
      {/* Header bar – consistent with Shipments.jsx */}
      <div className="flex items-center justify-between mb-[20px]">
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-xs font-semibold text-[#1A2930] hover:text-[#FFA500] underline-offset-2 hover:underline"
          >
            ← Back to previous view
          </button>
          <h1 className="text-[20px] font-semibold">
            {user?.fullname || user?.name || "Customer Profile"}
          </h1>
          <p className="text-xs text-gray-700">
            CRM record used for bookings, invoicing and shipment visibility.
          </p>
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold leading-tight ${getUserStatusClasses(
                user.status || "pending"
              )}`}
            >
              {(user.status || "pending").charAt(0).toUpperCase() +
                (user.status || "pending").slice(1)}
            </span>
            <Link to={`/users/${user._id || id}/edit`}>
              <button className="bg-[#1A2930] text-white px-[16px] py-[10px] rounded-md hover:bg-[#FFA500] hover:text-black transition text-xs font-semibold">
                Edit Customer
              </button>
            </Link>
          </div>
        )}
      </div>

      {loadError && (
        <div className="mb-3 px-4 py-2 rounded-md bg-red-100 text-red-800 text-sm border border-red-300">
          {loadError}
        </div>
      )}

      {/* Main card – same style as Shipments.jsx DataGrid wrapper */}
      <div className="bg-white rounded-md p-4 shadow-md">
        {loading && (
          <p className="text-sm text-gray-600">Loading customer profile…</p>
        )}

        {!loading && !user && !loadError && (
          <p className="text-sm text-gray-600">No customer found.</p>
        )}

        {!loading && user && (
          <div className="space-y-6">
            {/* Top summary row */}
            <div className="grid gap-4 md:grid-cols-2 border-b border-gray-200 pb-4">
              <div>
                <h2 className="text-base font-semibold text-[#1A2930]">
                  {user.fullname || user.name || "—"}
                </h2>
                <p className="text-xs text-gray-600 mt-1">
                  {user.accountType || "Account type not set"} ·{" "}
                  {user.role || "Role not set"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs text-gray-700">
                <div>
                  <p className="uppercase tracking-[0.16em] text-gray-400 mb-1">
                    Registered
                  </p>
                  <p>{displayDate(user.createdAt)}</p>
                </div>
                <div>
                  <p className="uppercase tracking-[0.16em] text-gray-400 mb-1">
                    Last updated
                  </p>
                  <p>{displayDate(user.updatedAt)}</p>
                </div>
              </div>
            </div>

            {/* Details grid – simple cards inside main white panel */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Account & role */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 mb-2">
                  Account & Role
                </h3>
                <div className="rounded-md border border-gray-200 p-3 text-sm text-gray-800 bg-slate-50">
                  <div className="flex justify-between gap-4 mb-1">
                    <span className="text-gray-500">Account type</span>
                    <span className="font-medium">
                      {user.accountType || "Business"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4 mb-1">
                    <span className="text-gray-500">User role</span>
                    <span className="font-medium">
                      {user.role || "Shipper"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4 mb-1">
                    <span className="text-gray-500">Status</span>
                    <span className="font-medium">
                      {user.status || "pending"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Ellcworth ID</span>
                    <span className="font-medium text-xs break-all">
                      {user._id || "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 mb-2">
                  Primary Contact
                </h3>
                <div className="rounded-md border border-gray-200 p-3 text-sm text-gray-800 bg-slate-50">
                  <div className="flex justify-between gap-4 mb-1">
                    <span className="text-gray-500">Email</span>
                    <span className="font-medium break-all">
                      {user.email || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4 mb-1">
                    <span className="text-gray-500">Phone</span>
                    <span className="font-medium">{user.phone || "—"}</span>
                  </div>
                  <div className="flex justify-between gap-4 mb-1">
                    <span className="text-gray-500">Country</span>
                    <span className="font-medium">{user.country || "—"}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">City / Postcode</span>
                    <span className="font-medium">
                      {(user.city || "—") +
                        (user.postcode ? ` · ${user.postcode}` : "")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 mb-2">
                  Billing / Collection Address
                </h3>
                <div className="rounded-md border border-gray-200 p-3 text-sm text-gray-800 bg-slate-50">
                  {user.address || "No address stored yet."}
                </div>
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 mb-2">
                  Internal Notes
                </h3>
                <div className="rounded-md border border-gray-200 p-3 text-sm text-gray-800 bg-slate-50 whitespace-pre-line">
                  {user.notes || "No notes recorded for this customer."}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetails;
