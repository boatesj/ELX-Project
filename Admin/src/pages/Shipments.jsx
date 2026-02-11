import { FaTrash, FaFileAlt } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useMemo, useCallback } from "react";
import { authRequest } from "../requestMethods";
import AdminTable from "../components/AdminTable";

const formatStatusLabel = (status) => {
  if (!status) return "";
  return String(status)
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const getStatusClasses = (status) => {
  switch (status) {
    case "request_received":
      return "bg-[#1A2930]/10 text-[#1A2930] border border-[#1A2930]/25";
    case "under_review":
      return "bg-blue-100 text-blue-800 border border-blue-200";
    case "quoted":
      return "bg-indigo-100 text-indigo-800 border border-indigo-200";
    case "customer_requested_changes":
      return "bg-amber-100 text-amber-800 border border-amber-200";
    case "customer_approved":
      return "bg-emerald-100 text-emerald-800 border border-emerald-200";
    case "pending":
      return "bg-gray-100 text-gray-700 border border-gray-300";
    case "booked":
      return "bg-[#FFA500]/10 text-[#FFA500] border border-[#FFA500]/40";
    case "at_origin_yard":
      return "bg-blue-100 text-blue-700 border border-blue-300";
    case "loaded":
    case "sailed":
      return "bg-indigo-100 text-indigo-700 border border-indigo-300";
    case "arrived":
    case "cleared":
      return "bg-emerald-100 text-emerald-700 border border-emerald-300";
    case "delivered":
      return "bg-green-100 text-green-700 border border-green-300";
    case "cancelled":
      return "bg-red-100 text-red-700 border border-red-300";
    default:
      return "bg-gray-100 text-gray-700 border border-gray-300";
  }
};

const REQUEST_STATUSES = new Set([
  "request_received",
  "under_review",
  "quoted",
  "customer_requested_changes",
  "customer_approved",
]);

const normalizeShipmentId = (s) => {
  const id = s?._id || s?.id;
  return typeof id === "string" ? id : id ? String(id) : "";
};

const Shipments = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [viewMode, setViewMode] = useState("all");

  const redirectToLogin = useCallback(
    (message) => {
      setLoadError(message || "Please log in to view shipments.");
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
    },
    [location.pathname, navigate],
  );

  const fetchShipments = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    try {
      const res = await authRequest.get("/shipments");

      let shipmentsArray = [];
      if (Array.isArray(res.data)) shipmentsArray = res.data;
      else if (Array.isArray(res.data.shipments))
        shipmentsArray = res.data.shipments;
      else if (Array.isArray(res.data.data)) shipmentsArray = res.data.data;

      const normalised = shipmentsArray
        .map((s) => {
          const _id = normalizeShipmentId(s);
          return {
            _id,
            referenceNo: s.referenceNo,
            shipper: s.shipper?.name || "",
            consignee: s.consignee?.name || "",
            from: s.ports?.originPort || "",
            destination: s.ports?.destinationPort || "",
            mode: s.mode || "",
            weight: s.cargo?.weight || "",
            status: s.status || "pending",
            docsCount: Array.isArray(s.documents) ? s.documents.length : 0,
          };
        })
        .filter((r) => Boolean(r._id));

      setRows(normalised);
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        redirectToLogin("Your session has expired.");
        return;
      }
      setLoadError("Failed to load shipments.");
    } finally {
      setLoading(false);
    }
  }, [redirectToLogin]);

  const handleDelete = useCallback(
    async (id) => {
      if (!window.confirm("Are you sure you want to delete this shipment?"))
        return;

      try {
        setRows((prev) => prev.filter((row) => row._id !== id));
        await authRequest.delete(`/shipments/${id}`);
        await fetchShipments();
      } catch {
        alert("Failed to delete shipment.");
        await fetchShipments();
      }
    },
    [fetchShipments],
  );

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  const filteredRows = useMemo(() => {
    if (viewMode === "requests") {
      return rows.filter((r) => REQUEST_STATUSES.has(r.status));
    }
    if (viewMode === "operational") {
      return rows.filter((r) => !REQUEST_STATUSES.has(r.status));
    }
    return rows;
  }, [rows, viewMode]);

  return (
    <div className="bg-[#D9D9D9] rounded-md p-3 sm:p-5 lg:p-[20px]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-[18px] sm:text-[20px] font-semibold">
            All Shipments
          </h1>

          <div className="inline-flex w-fit rounded-full bg-white border border-slate-200 p-1">
            {[
              { id: "all", label: "All" },
              { id: "requests", label: "Requests" },
              { id: "operational", label: "Operational" },
            ].map((t) => {
              const active = viewMode === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setViewMode(t.id)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition ${
                    active
                      ? "bg-[#FFA500] text-black"
                      : "bg-transparent text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <Link to={`../newshipment`} className="w-full sm:w-auto">
          <button className="w-full sm:w-auto bg-[#1A2930] text-white px-4 py-2.5 rounded-md hover:bg-[#FFA500] hover:text-black transition font-semibold">
            New Shipment
          </button>
        </Link>
      </div>

      {loadError && (
        <div className="mb-3 bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
          {loadError}
        </div>
      )}

      {/* MOBILE preserved exactly */}
      <div className="grid gap-3 lg:hidden">
        {loading ? (
          <div className="bg-white rounded-md p-4 shadow-md text-sm text-gray-600">
            Loading shipments...
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="bg-white rounded-md p-4 shadow-md text-sm text-gray-600">
            No shipments found.
          </div>
        ) : (
          filteredRows.map((row) => {
            const isRequestRow = REQUEST_STATUSES.has(row.status);

            return (
              <div
                key={row._id}
                className="bg-white rounded-md p-4 shadow-md border border-slate-100"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 break-words">
                      {row.referenceNo || "—"}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {row.mode ? row.mode.toUpperCase() : "—"}{" "}
                      {row.weight ? `• ${row.weight}` : ""}
                    </div>
                  </div>

                  <span
                    className={`shrink-0 px-2 py-1 rounded-full text-xs font-semibold ${getStatusClasses(
                      row.status,
                    )}`}
                  >
                    {formatStatusLabel(row.status)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP TanStack */}
      <div className="hidden lg:block w-full min-w-0 bg-white rounded-md p-4 shadow-md">
        <AdminTable
          data={filteredRows}
          pageSize={10}
          columns={[
            { header: "Reference", accessorKey: "referenceNo" },
            { header: "Shipper", accessorKey: "shipper" },
            { header: "Consignee", accessorKey: "consignee" },
            { header: "From", accessorKey: "from" },
            { header: "Destination", accessorKey: "destination" },
            { header: "Mode", accessorKey: "mode" },
            { header: "Weight", accessorKey: "weight" },
            {
              header: "Docs",
              cell: ({ row }) => {
                const n = Number(row.original.docsCount || 0);
                const has = n > 0;
                return (
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                      has
                        ? "bg-[#1A2930]/10 text-[#1A2930] border-[#1A2930]/20"
                        : "bg-gray-100 text-gray-600 border-gray-200"
                    }`}
                  >
                    {n}
                  </span>
                );
              },
            },
            {
              header: "Status",
              cell: ({ row }) => (
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusClasses(
                    row.original.status,
                  )}`}
                >
                  {formatStatusLabel(row.original.status)}
                </span>
              ),
            },
            {
              header: "Actions",
              cell: ({ row }) => {
                const id = row.original._id;
                const isRequestRow = REQUEST_STATUSES.has(row.original.status);

                return (
                  <div className="flex items-center gap-2">
                    <Link to={`${id}`}>
                      <button className="px-3 py-1 rounded-md font-semibold text-xs bg-[#FFA500] text-black hover:bg-[#e69300] transition">
                        Edit
                      </button>
                    </Link>

                    {isRequestRow && (
                      <Link to={`${id}#quote`}>
                        <button className="px-3 py-1 rounded-md font-semibold text-xs bg-indigo-600 text-white hover:bg-indigo-700 transition">
                          Quote
                        </button>
                      </Link>
                    )}

                    <Link to={`${id}#documents`}>
                      <button className="flex items-center gap-2 px-3 py-1 rounded-md font-semibold text-xs bg-[#1A2930] text-white hover:bg-[#0f1a1f] transition">
                        <FaFileAlt />
                        Docs
                      </button>
                    </Link>

                    <button
                      onClick={() => handleDelete(id)}
                      className="flex items-center gap-2 px-3 py-1 rounded-md font-semibold text-xs bg-[#E53935] text-white hover:bg-[#c62828] transition"
                    >
                      <FaTrash />
                      Delete
                    </button>
                  </div>
                );
              },
            },
          ]}
        />
      </div>
    </div>
  );
};

export default Shipments;
