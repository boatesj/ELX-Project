// Admin/src/pages/Users.jsx
import { useEffect, useState, useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { FaTrash, FaEye, FaEdit } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";

const USERS_API =
  (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000") + "/users";

const getStatusClasses = (status) => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-700 border border-green-300";
    case "Pending":
      return "bg-yellow-100 text-yellow-700 border border-yellow-300";
    case "Suspended":
      return "bg-red-100 text-red-700 border border-red-300";
    default:
      return "bg-gray-100 text-gray-700 border border-gray-300";
  }
};

const Users = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const fallbackRows = useMemo(
    () => [
      {
        id: 1,
        name: "OceanGate Logistics Ltd",
        email: "ops@oceangate.co.uk",
        phone: "+44 20 8801 9900",
        type: "Shipper",
        country: "United Kingdom",
        city: "London",
        status: "Active",
        registered: "2024-01-08",
      },
      {
        id: 2,
        name: "Global Tech Supplies Inc.",
        email: "contact@globaltechsupplies.com",
        phone: "+1 415 227 9002",
        type: "Shipper",
        country: "United States",
        city: "San Francisco",
        status: "Active",
        registered: "2023-12-18",
      },
    ],
    []
  );

  const fetchUsers = async () => {
    setLoading(true);
    setLoadError("");
    setDeleteError("");

    try {
      const token = localStorage.getItem("token");

      // 🔐 No token → send to login with redirect back to this page
      if (!token) {
        setLoadError("Please log in to view users.");
        setLoading(false);
        navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
        return;
      }

      const res = await fetch(USERS_API, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        setLoadError("Your session has expired. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setLoading(false);
        navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to load users");
      }

      const data = await res.json();
      console.log("🔎 Raw users response:", data);

      const mapped = (Array.isArray(data) ? data : data.users || []).map(
        (user, index) => ({
          id: user._id || user.id || index + 1,
          name: user.fullname || user.name,
          email: user.email,
          phone: user.phone,
          type: user.role || "N/A",
          accountType: user.accountType || "",
          country: user.country,
          city: user.city || "",
          postcode: user.postcode || "",
          address: user.address || "",
          notes: user.notes || "",
          status: user.status || "Pending",
          registered: user.createdAt
            ? new Date(user.createdAt).toISOString().slice(0, 10)
            : "",
        })
      );

      setRows(mapped.length ? mapped : fallbackRows);
    } catch (err) {
      console.error(err);
      setLoadError(err.message || "Something went wrong loading users.");
      setRows(fallbackRows);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleView = (id) => {
    if (!id) return;
    navigate(`/users/${id}`);
  };

  const handleEdit = (id) => {
    if (!id) return;
    navigate(`/users/${id}/edit`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    setDeleteError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setDeleteError("Please log in to delete users.");
        navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
        return;
      }

      const res = await fetch(`${USERS_API}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        setDeleteError("Your session has expired. Please log in again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete user");
      }

      setRows((prev) => prev.filter((row) => row.id !== id));
    } catch (err) {
      console.error(err);
      setDeleteError(err.message || "Something went wrong deleting the user.");
    }
  };

  const columns = useMemo(
    () => [
      { field: "name", headerName: "Full Name / Company", width: 250 },
      { field: "email", headerName: "Email", width: 240 },
      { field: "phone", headerName: "Phone", width: 160 },
      { field: "type", headerName: "User Type", width: 130 },
      { field: "accountType", headerName: "Account Type", width: 140 },
      { field: "country", headerName: "Country", width: 150 },
      { field: "city", headerName: "City", width: 150 },
      { field: "postcode", headerName: "Postcode", width: 120 },
      {
        field: "notes",
        headerName: "Notes",
        width: 220,
        renderCell: (params) => (
          <span className="text-gray-600 text-xs">
            {params.value?.length > 40
              ? params.value.slice(0, 40) + "..."
              : params.value}
          </span>
        ),
      },
      {
        field: "status",
        headerName: "Status",
        width: 150,
        renderCell: (params) => (
          <div className="flex items-center h-full">
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold leading-tight ${getStatusClasses(
                params.value
              )}`}
            >
              {params.value}
            </span>
          </div>
        ),
      },
      { field: "registered", headerName: "Registered", width: 150 },
      {
        field: "actions",
        headerName: "Actions",
        width: 260,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          const userId = params.row.id;

          return (
            <div className="flex items-center h-full gap-2">
              <button
                onClick={() => handleView(userId)}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-[#1A2930] text-white hover:bg-[#243746] transition"
              >
                <FaEye className="text-white" />
                View
              </button>

              <button
                onClick={() => handleEdit(userId)}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-[#FFA500] text-[#1A2930] hover:bg-[#ffb733] transition"
              >
                <FaEdit />
                Edit
              </button>

              <button
                onClick={() => handleDelete(userId)}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-[#E53935] text-white hover:bg-[#c62828] transition"
              >
                <FaTrash className="text-white" />
                Delete
              </button>
            </div>
          );
        },
      },
    ],
    []
  );

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
        <div className="mb-3 px-4 py-2 rounded-md bg-red-100 text-red-800 text-sm border border-red-300">
          {loadError}
        </div>
      )}

      {deleteError && (
        <div className="mb-3 px-4 py-2 rounded-md bg-red-100 text-red-800 text-sm border border-red-300">
          {deleteError}
        </div>
      )}

      {/* MOBILE: Card list */}
      <div className="grid gap-3 lg:hidden">
        {rows.length === 0 ? (
          <div className="bg-white rounded-md p-4 shadow-md text-sm text-gray-600">
            No users found.
          </div>
        ) : (
          rows.map((row) => (
            <div
              key={row.id}
              className="bg-white rounded-md p-4 shadow-md border border-slate-100"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900 break-words">
                    {row.name || "—"}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 break-words">
                    {row.email || "—"}
                  </div>
                </div>

                <span
                  className={`shrink-0 px-2 py-1 rounded-full text-xs font-semibold leading-tight ${getStatusClasses(
                    row.status
                  )}`}
                >
                  {row.status}
                </span>
              </div>

              <div className="mt-3 grid gap-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500 text-xs">Phone</span>
                  <span className="text-slate-900 text-sm font-medium text-right break-words">
                    {row.phone || "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500 text-xs">Type</span>
                  <span className="text-slate-900 text-sm font-medium text-right break-words">
                    {row.type || "—"}{" "}
                    {row.accountType ? `(${row.accountType})` : ""}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500 text-xs">Location</span>
                  <span className="text-slate-900 text-sm font-medium text-right break-words">
                    {[row.city, row.country].filter(Boolean).join(", ") || "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500 text-xs">Registered</span>
                  <span className="text-slate-900 text-sm font-medium text-right">
                    {row.registered || "—"}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleView(row.id)}
                  className="flex items-center justify-center gap-1 px-2 py-2 rounded-md text-xs font-semibold bg-[#1A2930] text-white hover:bg-[#243746] transition"
                >
                  <FaEye className="text-white" />
                  View
                </button>

                <button
                  onClick={() => handleEdit(row.id)}
                  className="flex items-center justify-center gap-1 px-2 py-2 rounded-md text-xs font-semibold bg-[#FFA500] text-[#1A2930] hover:bg-[#ffb733] transition"
                >
                  <FaEdit />
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(row.id)}
                  className="flex items-center justify-center gap-1 px-2 py-2 rounded-md text-xs font-semibold bg-[#E53935] text-white hover:bg-[#c62828] transition"
                >
                  <FaTrash className="text-white" />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP: DataGrid */}
      <div className="hidden lg:block bg-white rounded-md p-4 shadow-md">
        <DataGrid
          rows={rows}
          columns={columns}
          checkboxSelection
          autoHeight
          loading={loading}
          pageSizeOptions={[5, 10]}
          initialState={{
            pagination: { paginationModel: { pageSize: 5, page: 0 } },
          }}
        />
      </div>
    </div>
  );
};

export default Users;
