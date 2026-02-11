// Admin/src/pages/Users.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authRequest } from "../requestMethods";
import AdminTable from "../components/AdminTable.jsx";

const normalizeStatus = (status) => {
  const s = String(status || "pending")
    .trim()
    .toLowerCase();
  return s || "pending";
};

const toUkDateTime = (iso) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString("en-GB");
  } catch {
    return "";
  }
};

const Users = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await authRequest.get("/users");

        const payload = res?.data;

        const list = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.users)
            ? payload.users
            : Array.isArray(payload?.data)
              ? payload.data
              : Array.isArray(payload?.data?.users)
                ? payload.data.users
                : [];

        setRows(list);
      } catch (e) {
        setErr(
          e?.response?.data?.message || e?.message || "Failed to load users",
        );
        setRows([]); // ✅ ensure UI doesn't keep stale data
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [location.key]);

  const filteredRows = useMemo(() => {
    const q = String(query || "")
      .trim()
      .toLowerCase();
    if (!q) return rows;

    return rows.filter((u) => {
      const fullname = String(u?.fullname || "").toLowerCase();
      const email = String(u?.email || "").toLowerCase();
      const role = String(u?.role || "").toLowerCase();
      const status = String(u?.status || "").toLowerCase();
      return (
        fullname.includes(q) ||
        email.includes(q) ||
        role.includes(q) ||
        status.includes(q)
      );
    });
  }, [rows, query]);

  const handleRowClick = (row) => {
    const id = row?._id || row?.id;
    if (!id) return;
    navigate(`/users/${id}`);
  };

  return (
    <div className="min-h-screen bg-[#1A2930] p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <h1 className="text-[#EDECEC] text-2xl font-extrabold tracking-tight">
              Users
            </h1>
            <p className="text-[#9A9EAB] text-sm mt-1">
              Manage users and view account status.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, role, status…"
              className="
                w-full md:w-[320px]
                rounded-xl px-3 py-2
                bg-[#0b1220] text-[#EDECEC]
                border border-[#334155]
                placeholder:text-[#9A9EAB]
                focus:outline-none focus:ring-2 focus:ring-[#FFA500]/60
              "
            />

            <Link
              to="/users/new"
              className="
                inline-flex items-center justify-center
                rounded-xl px-4 py-2
                bg-[#FFA500] text-black font-bold
                hover:opacity-90 transition
              "
            >
              New
            </Link>
          </div>
        </div>

        {err ? (
          <div className="mb-4 p-3 rounded-xl border border-red-400/40 bg-red-500/10 text-red-200">
            {err}
          </div>
        ) : null}

        <div className="rounded-2xl border border-[#334155] bg-[#0b1220] p-4">
          {loading ? (
            <div className="text-[#9A9EAB]">Loading…</div>
          ) : (
            <AdminTable
              data={filteredRows}
              pageSize={10}
              onRowClick={handleRowClick}
              columns={[
                { header: "Name", accessorKey: "fullname" },
                { header: "Email", accessorKey: "email" },
                {
                  header: "Role",
                  cell: ({ row }) => String(row.original?.role || "").trim(),
                },
                {
                  header: "Status",
                  cell: ({ row }) => normalizeStatus(row.original?.status),
                },
                {
                  header: "Created",
                  cell: ({ row }) => toUkDateTime(row.original?.createdAt),
                },
              ]}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;
