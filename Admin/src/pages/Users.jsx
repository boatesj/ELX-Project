import { useEffect, useState, useMemo, useCallback } from "react";
import { FaTrash, FaEye, FaEdit } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authRequest } from "../requestMethods";
import AdminTable from "../components/AdminTable";

const normalizeStatus = (status) => {
  const s = String(status || "pending")
    .trim()
    .toLowerCase();
  if (s === "active") return "active";
  if (s === "suspended") return "suspended";
  return "pending";
};

const statusLabel = (status) =>
  normalizeStatus(status).replace(/^\w/, (c) => c.toUpperCase());

const getStatusClasses = (status) => {
  const s = normalizeStatus(status);
  switch (s) {
    case "active":
      return "bg-green-100 text-green-700 border border-green-300";
    case "pending":
      return "bg-yellow-100 text-yellow-700 border border-yellow-300";
    case "suspended":
      return "bg-red-100 text-red-700 border border-red-300";
    default:
      return "bg-gray-100 text-gray-700 border border-gray-300";
  }
};

const pickUsersArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.users)) return payload.users;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

const STATUS_OPTIONS = ["pending", "active", "suspended"];
const isMongoId = (value) => /^[a-fA-F0-9]{24}$/.test(String(value || ""));

const Users = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [statusError, setStatusError] = useState("");

  const redirectToLogin = useCallback(() => {
    navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
  }, [navigate, location.pathname]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    setDeleteError("");
    setStatusError("");

    try {
      const res = await authRequest.get("/users");
      const list = pickUsersArray(res?.data ?? {});

      const mapped = list.map((user, index) => {
        const realId = String(user._id || user.id || "");
        return {
          id: realId || `tmp-${index + 1}`,
          realId,
          name: user.fullname || user.name || "—",
          email: user.email || "—",
          phone: user.phone || "—",
          type: user.role || "N/A",
          accountType: user.accountType || "",
          country: user.country || "",
          city: user.city || "",
          postcode: user.postcode || "",
          address: user.address || "",
          notes: user.notes || "",
          status: normalizeStatus(user.status),
          registered: user.createdAt
            ? new Date(user.createdAt).toISOString().slice(0, 10)
            : "",
        };
      });

      setRows(mapped);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        setLoadError("Session expired.");
        redirectToLogin();
        return;
      }

      setLoadError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [redirectToLogin]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleView = (realId) => {
    if (!realId) return;
    navigate(`/users/${realId}`);
  };

  const handleEdit = (realId) => {
    if (!realId) return;
    navigate(`/users/${realId}/edit`);
  };

  const handleDelete = async (realId) => {
    if (!isMongoId(realId)) {
      setDeleteError("Invalid user id.");
      return;
    }

    if (!window.confirm("Delete this user?")) return;

    try {
      setRows((prev) => prev.filter((r) => r.realId !== realId));
      await authRequest.delete(`/users/${realId}`);
      await fetchUsers();
    } catch {
      setDeleteError("Delete failed.");
      await fetchUsers();
    }
  };

  const handleStatusChange = async (realId, nextStatus) => {
    if (!isMongoId(realId)) {
      setStatusError("Invalid user id.");
      return;
    }

    const safeNext = normalizeStatus(nextStatus);
    setRows((prev) =>
      prev.map((r) => (r.realId === realId ? { ...r, status: safeNext } : r)),
    );

    try {
      await authRequest.put(`/users/${realId}`, { status: safeNext });
    } catch {
      setStatusError("Status update failed.");
      await fetchUsers();
    }
  };

  return (
    <div className="bg-[#D9D9D9] rounded-md p-3 sm:p-5 lg:p-[20px]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h1 className="text-[18px] sm:text-[20px] font-semibold">All Users</h1>

        <Link to="/newuser" className="w-full sm:w-auto">
          <button className="w-full sm:w-auto bg-[#1A2930] text-white px-4 py-2.5 rounded-md hover:bg-[#FFA500] hover:text-black transition font-semibold">
            New User
          </button>
        </Link>
      </div>

      {loadError && (
        <div className="mb-3 bg-red-100 p-3 text-sm">{loadError}</div>
      )}

      {deleteError && (
        <div className="mb-3 bg-red-100 p-3 text-sm">{deleteError}</div>
      )}

      {statusError && (
        <div className="mb-3 bg-red-100 p-3 text-sm">{statusError}</div>
      )}

      {/* MOBILE preserved */}
      <div className="grid gap-3 lg:hidden">
        {rows.map((row) => (
          <div key={row.id} className="bg-white rounded-md p-4 shadow-md">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">{row.name}</div>
                <div className="text-xs text-gray-500">{row.email}</div>
              </div>

              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusClasses(
                  row.status,
                )}`}
              >
                {statusLabel(row.status)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP TanStack */}
      <div className="hidden lg:block bg-white rounded-md p-4 shadow-md">
        <AdminTable
          data={rows}
          pageSize={10}
          columns={[
            { header: "Name", accessorKey: "name" },
            { header: "Email", accessorKey: "email" },
            { header: "Phone", accessorKey: "phone" },
            { header: "Type", accessorKey: "type" },
            { header: "Country", accessorKey: "country" },
            {
              header: "Status",
              cell: ({ row }) => (
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusClasses(
                      row.original.status,
                    )}`}
                  >
                    {statusLabel(row.original.status)}
                  </span>

                  <select
                    value={row.original.status}
                    onChange={(e) =>
                      handleStatusChange(row.original.realId, e.target.value)
                    }
                    className="text-xs px-2 py-1 rounded-md border border-slate-300 bg-white"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {statusLabel(s)}
                      </option>
                    ))}
                  </select>
                </div>
              ),
            },
            {
              header: "Actions",
              cell: ({ row }) => (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleView(row.original.realId)}
                    className="px-2 py-1 bg-[#1A2930] text-white rounded text-xs"
                  >
                    <FaEye />
                  </button>

                  <button
                    onClick={() => handleEdit(row.original.realId)}
                    className="px-2 py-1 bg-[#FFA500] text-black rounded text-xs"
                  >
                    <FaEdit />
                  </button>

                  <button
                    onClick={() => handleDelete(row.original.realId)}
                    className="px-2 py-1 bg-red-600 text-white rounded text-xs"
                  >
                    <FaTrash />
                  </button>
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
};

export default Users;
