// Admin/src/pages/UserDetails.jsx
import { useEffect, useMemo, useState } from "react";
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

const getStatusLabel = (status) => {
  const s = (status || "pending").toString().trim().toLowerCase();
  return s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
};

const displayDate = (iso) =>
  iso ? new Date(iso).toISOString().slice(0, 10) : "—";

const FieldRow = ({ label, value, mono = false }) => (
  <div className="flex items-start justify-between gap-4 py-1">
    <span className="text-gray-500 text-xs">{label}</span>
    <span
      className={`text-gray-900 text-sm font-medium text-right break-all ${
        mono ? "font-mono text-xs" : ""
      }`}
    >
      {value || "—"}
    </span>
  </div>
);

const SectionCard = ({ title, subtitle, children }) => (
  <section className="rounded-xl border border-gray-200 bg-slate-50 p-3 sm:p-4">
    <div className="mb-2">
      <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
        {title}
      </h3>
      {subtitle ? (
        <p className="mt-1 text-[11px] text-gray-500">{subtitle}</p>
      ) : null}
    </div>
    {children}
  </section>
);

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(false);

  const statusLabel = useMemo(
    () => getStatusLabel(user?.status),
    [user?.status]
  );

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
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const title = user?.fullname || user?.name || "Customer Profile";
  const userId = user?._id || id;

  return (
    <div className="m-4 sm:m-[30px] bg-[#D9D9D9] p-4 sm:p-[20px] rounded-md">
      {/* Header bar — mobile-first */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-[20px]">
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="self-start text-xs font-semibold text-[#1A2930] hover:text-[#FFA500] underline-offset-2 hover:underline"
          >
            ← Back to previous view
          </button>

          <h1 className="text-[20px] sm:text-[22px] font-semibold text-[#1A2930]">
            {title}
          </h1>

          <p className="text-xs text-gray-700 max-w-2xl">
            CRM record used for bookings, invoicing and shipment visibility.
          </p>
        </div>

        {/* Status + primary action */}
        {user && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold leading-tight ${getUserStatusClasses(
                user.status || "pending"
              )}`}
            >
              {statusLabel}
            </span>

            <Link to={`/users/${userId}/edit`}>
              <button className="bg-[#1A2930] text-white px-4 py-2 rounded-md hover:bg-[#FFA500] hover:text-black transition text-xs font-semibold w-full sm:w-auto">
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

      {/* Main card */}
      <div className="bg-white rounded-md p-4 shadow-md">
        {loading && (
          <p className="text-sm text-gray-600">Loading customer profile…</p>
        )}

        {!loading && !user && !loadError && (
          <p className="text-sm text-gray-600">No customer found.</p>
        )}

        {!loading && user && (
          <div className="space-y-5">
            {/* Summary */}
            <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-[#1A2930]">
                    {user.fullname || user.name || "—"}
                  </h2>
                  <p className="text-xs text-gray-600 mt-1">
                    {(user.accountType || "Account type not set") +
                      " · " +
                      (user.role || "Role not set")}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-gray-700 w-full md:w-auto">
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
            </div>

            {/* Details grid */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Account & role */}
              <SectionCard
                title="Account & Role"
                subtitle="Internal classification for permissions and workflows."
              >
                <div className="divide-y divide-gray-200">
                  <FieldRow
                    label="Account type"
                    value={user.accountType || "Business"}
                  />
                  <FieldRow label="User role" value={user.role || "Shipper"} />
                  <FieldRow
                    label="Status"
                    value={getStatusLabel(user.status || "pending")}
                  />
                  <FieldRow label="Ellcworth ID" value={userId} mono />
                </div>
              </SectionCard>

              {/* Contact */}
              <SectionCard
                title="Primary Contact"
                subtitle="Used for notifications, booking updates and invoicing."
              >
                <div className="divide-y divide-gray-200">
                  <FieldRow label="Email" value={user.email} />
                  <FieldRow label="Phone" value={user.phone} />
                  <FieldRow label="Country" value={user.country} />
                  <FieldRow
                    label="City / Postcode"
                    value={`${user.city || "—"}${
                      user.postcode ? ` · ${user.postcode}` : ""
                    }`}
                  />
                </div>
              </SectionCard>

              {/* Address */}
              <div className="md:col-span-2">
                <SectionCard
                  title="Billing / Collection Address"
                  subtitle="Used for collections, billing, and primary customer record."
                >
                  <div className="text-sm text-gray-800 whitespace-pre-line">
                    {user.address || "No address stored yet."}
                  </div>
                </SectionCard>
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <SectionCard
                  title="Internal Notes"
                  subtitle="Free-text notes visible only to the admin team."
                >
                  <div className="text-sm text-gray-800 whitespace-pre-line">
                    {user.notes || "No notes recorded for this customer."}
                  </div>
                </SectionCard>
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end pt-2">
              <button
                type="button"
                onClick={() => navigate("/users")}
                className="w-full sm:w-auto px-4 py-2 rounded-md text-xs font-semibold border border-gray-300 bg-white hover:bg-gray-50 transition"
              >
                Back to Users
              </button>

              <Link to={`/users/${userId}/edit`} className="w-full sm:w-auto">
                <button
                  type="button"
                  className="w-full sm:w-auto bg-[#1A2930] text-white px-4 py-2 rounded-md hover:bg-[#FFA500] hover:text-black transition text-xs font-semibold"
                >
                  Edit Customer
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetails;
