import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaTrash, FaFileAlt } from "react-icons/fa";
import { authRequest } from "../requestMethods";
import AdminTable from "../components/AdminTable.jsx";

const REQUEST_STATUSES = new Set([
  "request_received",
  "under_review",
  "quoted",
  "customer_requested_changes",
  "customer_approved",
]);

const formatStatusLabel = (status) => {
  if (!status) return "";
  return String(status)
    .split("_")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
};

// ✅ Enterprise badge (high contrast on light + zebra + dark page background)
const StatusBadge = ({ status }) => {
  const s = String(status || "pending");

  const base =
    "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border shadow-sm";

  // Corporate-friendly palette (stronger contrast)
  switch (s) {
    case "request_received":
      return (
        <span
          className={`${base} bg-slate-100 text-slate-900 border-slate-300`}
        >
          Request Received
        </span>
      );
    case "under_review":
      return (
        <span className={`${base} bg-blue-100 text-blue-900 border-blue-300`}>
          Under Review
        </span>
      );
    case "quoted":
      return (
        <span
          className={`${base} bg-indigo-100 text-indigo-900 border-indigo-300`}
        >
          Quoted
        </span>
      );
    case "customer_requested_changes":
      return (
        <span
          className={`${base} bg-amber-100 text-amber-900 border-amber-300`}
        >
          Requested Changes
        </span>
      );
    case "customer_approved":
      return (
        <span
          className={`${base} bg-emerald-100 text-emerald-900 border-emerald-300`}
        >
          Customer Approved
        </span>
      );

    case "pending":
      return (
        <span
          className={`${base} bg-[#D9D9D9] text-[#1A2930] border-[#9A9EAB]/70`}
        >
          Pending
        </span>
      );
    case "booked":
      return (
        <span
          className={`${base} bg-[#FFA500]/25 text-[#1A2930] border-[#FFA500]/70`}
        >
          Booked
        </span>
      );
    case "at_origin_yard":
      return (
        <span className={`${base} bg-blue-100 text-blue-900 border-blue-300`}>
          At Origin Yard
        </span>
      );
    case "loaded":
      return (
        <span
          className={`${base} bg-indigo-100 text-indigo-900 border-indigo-300`}
        >
          Loaded
        </span>
      );
    case "sailed":
      return (
        <span
          className={`${base} bg-indigo-100 text-indigo-900 border-indigo-300`}
        >
          Sailed
        </span>
      );
    case "arrived":
      return (
        <span
          className={`${base} bg-emerald-100 text-emerald-900 border-emerald-300`}
        >
          Arrived
        </span>
      );
    case "cleared":
      return (
        <span
          className={`${base} bg-emerald-100 text-emerald-900 border-emerald-300`}
        >
          Cleared
        </span>
      );
    case "delivered":
      return (
        <span
          className={`${base} bg-green-100 text-green-900 border-green-300`}
        >
          Delivered
        </span>
      );
    case "cancelled":
      return (
        <span className={`${base} bg-red-100 text-red-900 border-red-300`}>
          Cancelled
        </span>
      );
    default:
      return (
        <span
          className={`${base} bg-slate-100 text-slate-900 border-slate-300`}
        >
          {formatStatusLabel(s)}
        </span>
      );
  }
};

const normalizeShipmentId = (s) => {
  const id = s?._id || s?.id;
  return typeof id === "string" ? id : id ? String(id) : "";
};

const toUkDate = (iso) => {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-GB");
  } catch {
    return "—";
  }
};

const Shipments = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [viewMode, setViewMode] = useState("all"); // all | requests | operational

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

      // ✅ Handles BOTH shapes:
      // - array
      // - { shipments: [...] }
      // - { data: [...] }
      const shipmentsArray = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.shipments)
          ? res.data.shipments
          : Array.isArray(res.data?.data)
            ? res.data.data
            : [];

      const mapped = shipmentsArray
        .map((s) => {
          const _id = normalizeShipmentId(s);
          return {
            _id,
            referenceNo: s.referenceNo || "—",
            shipper: s.shipper?.name || "—",
            consignee: s.consignee?.name || "—",
            origin: s.ports?.originPort || "—",
            destination: s.ports?.destinationPort || "—",
            mode: s.mode || "—",
            shipDate: s.shippingDate || null,
            status: s.status || "pending",
            paymentStatus: s.paymentStatus || "unpaid",
            docsCount: Array.isArray(s.documents) ? s.documents.length : 0,
            raw: s,
          };
        })
        .filter((r) => Boolean(r._id));

      setRows(mapped);
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        redirectToLogin("Your session has expired. Please log in again.");
        return;
      }
      console.error(
        "❌ Error fetching shipments:",
        error?.response?.data || error,
      );
      setLoadError(
        error?.response?.data?.message || "Failed to load shipments.",
      );
    } finally {
      setLoading(false);
    }
  }, [redirectToLogin]);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  const handleDelete = useCallback(
    async (id) => {
      const ok = window.confirm(
        "Are you sure you want to delete this shipment?",
      );
      if (!ok) return;

      try {
        // Optimistic remove
        setRows((prev) => prev.filter((r) => r._id !== id));

        await authRequest.delete(`/shipments/${id}`);

        // Truth refresh
        await fetchShipments();
      } catch (error) {
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          redirectToLogin("Your session has expired. Please log in again.");
          return;
        }
        console.error(
          "❌ Error deleting shipment:",
          error?.response?.data || error,
        );
        alert("Failed to delete shipment. Please try again.");
        await fetchShipments();
      }
    },
    [fetchShipments, redirectToLogin],
  );

  const filteredRows = useMemo(() => {
    if (viewMode === "requests")
      return rows.filter((r) => REQUEST_STATUSES.has(r.status));
    if (viewMode === "operational")
      return rows.filter((r) => !REQUEST_STATUSES.has(r.status));
    return rows;
  }, [rows, viewMode]);

  const columns = useMemo(
    () => [
      {
        header: "Reference",
        accessorKey: "referenceNo",
        cell: (info) => (
          <span className="font-semibold text-[#1A2930]">
            {info.getValue()}
          </span>
        ),
      },
      { header: "Shipper", accessorKey: "shipper" },
      { header: "Consignee", accessorKey: "consignee" },
      { header: "Origin", accessorKey: "origin" },
      { header: "Destination", accessorKey: "destination" },
      {
        header: "Mode",
        accessorKey: "mode",
        cell: (info) => (
          <span className="text-[12px] font-bold text-slate-700">
            {String(info.getValue() || "—").toUpperCase()}
          </span>
        ),
      },
      {
        header: "Ship Date",
        accessorKey: "shipDate",
        cell: (info) => (
          <span className="font-medium">{toUkDate(info.getValue())}</span>
        ),
      },
      {
        header: "Docs",
        accessorKey: "docsCount",
        cell: (info) => {
          const n = Number(info.getValue() || 0);
          const has = n > 0;
          return (
            <span
              className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                has
                  ? "bg-[#1A2930]/10 text-[#1A2930] border-[#1A2930]/25"
                  : "bg-slate-100 text-slate-700 border-slate-300"
              }`}
              title={has ? `${n} document(s)` : "No documents"}
            >
              <FaFileAlt className="opacity-80" />
              {n}
            </span>
          );
        },
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: (info) => <StatusBadge status={info.getValue()} />,
      },
      {
        header: "Actions",
        id: "actions",
        cell: ({ row }) => {
          const id = row.original._id;
          const isRequest = REQUEST_STATUSES.has(row.original.status);

          return (
            <div className="flex items-center gap-2 whitespace-nowrap">
              <Link to={`${id}`}>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-md text-xs font-bold bg-[#FFA500] text-black hover:bg-[#e69300] transition"
                >
                  Edit
                </button>
              </Link>

              {isRequest ? (
                <Link to={`${id}#quote`}>
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-md text-xs font-bold bg-indigo-700 text-white hover:bg-indigo-800 transition"
                  >
                    Quote
                  </button>
                </Link>
              ) : null}

              <Link to={`${id}#documents`}>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-md text-xs font-bold bg-[#1A2930] text-white hover:bg-[#0f1a1f] transition"
                >
                  Docs
                </button>
              </Link>

              <button
                type="button"
                onClick={() => handleDelete(id)}
                className="px-3 py-1.5 rounded-md text-xs font-bold bg-red-700 text-white hover:bg-red-800 transition inline-flex items-center gap-2"
              >
                <FaTrash />
                Delete
              </button>
            </div>
          );
        },
      },
    ],
    [handleDelete],
  );
  return (
    <div className="min-h-screen bg-[#1A2930] p-4 sm:p-6">
      <div className="max-w-[1400px] mx-auto">
        {/* Header row */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[20px] sm:text-[22px] font-extrabold text-[#EDECEC]">
              Shipments
            </h1>
            <div className="text-[12px] text-[#EDECEC]/75 mt-1">
              Enterprise view · strong contrast · corporate zebra
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-full bg-white border border-slate-200 p-1">
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
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition ${
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

            <Link to={`../newshipment`}>
              <button className="bg-[#FFA500] text-black px-4 py-2 rounded-md font-bold hover:bg-[#e69300] transition">
                New Shipment
              </button>
            </Link>
          </div>
        </div>

        {loadError ? (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
            {loadError}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-xl border border-[#9A9EAB]/30 bg-white p-4 text-sm text-slate-600">
            Loading shipments…
          </div>
        ) : (
          <AdminTable
            data={filteredRows}
            columns={columns}
            onRowClick={(row) => handleRowClick(row)}
          />
        )}
      </div>
    </div>
  );
};

export default Shipments;
