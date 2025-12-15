import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const SHIPMENTS_API = `${API_BASE_URL}/shipments`;

// Status chip styling
const getStatusChipClass = (status) => {
  switch (status) {
    case "delivered":
      return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/60";
    case "pending":
      return "bg-amber-500/15 text-amber-300 border border-amber-500/60";
    case "booked":
    case "loaded":
    case "sailed":
      return "bg-sky-500/15 text-sky-300 border border-sky-500/60";
    case "cancelled":
      return "bg-red-500/15 text-red-300 border border-red-500/60";
    default:
      return "bg-slate-500/15 text-slate-300 border border-slate-500/60";
  }
};

// Payment chip styling
const getPaymentChipClass = (paymentStatus) => {
  switch (paymentStatus) {
    case "paid":
      return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/60";
    case "part_paid":
      return "bg-amber-500/15 text-amber-300 border border-amber-500/60";
    case "on_account":
      return "bg-sky-500/15 text-sky-300 border border-sky-500/60";
    case "unpaid":
    default:
      return "bg-slate-500/15 text-slate-300 border border-slate-500/60";
  }
};

const Orders = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [shipments, setShipments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState(""); // 🔍 NEW
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  // Fetch shipments from backend
  const fetchShipments = async () => {
    setLoading(true);
    setLoadError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoadError("Please log in to view orders.");
        navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
        return;
      }

      const res = await fetch(SHIPMENTS_API, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        setLoadError("Your session has expired. Please log in again.");
        localStorage.removeItem("token");
        navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
        return;
      }

      const data = await res.json();
      console.log("Shipments API raw response:", data);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to load shipments");
      }

      // Normalise different payload shapes:
      let list = [];

      if (Array.isArray(data)) {
        // e.g. backend returns just an array
        list = data;
      } else if (Array.isArray(data.data)) {
        // e.g. { data: [...] }
        list = data.data;
      } else if (Array.isArray(data.shipments)) {
        // e.g. { shipments: [...] }
        list = data.shipments;
      } else {
        console.warn("Unexpected shipments response shape:", data);
        list = [];
      }

      setShipments(list);
    } catch (err) {
      console.error("Orders load error:", err);
      setLoadError(err.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Client-side filters + mapping into rows
  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return shipments
      .filter((s) =>
        statusFilter === "all"
          ? true
          : (s.status || "").toLowerCase() === statusFilter
      )
      .filter((s) =>
        modeFilter === "all"
          ? true
          : (s.mode || "").toLowerCase() === modeFilter
      )
      .filter((s) =>
        paymentFilter === "all"
          ? true
          : (s.paymentStatus || "").toLowerCase() === paymentFilter
      )
      .filter((s) => {
        if (!term) return true;

        const customerName =
          s.customer?.fullname ||
          s.customer?.name ||
          s.shipper?.name ||
          s.customerName ||
          "";
        const origin = s.ports?.originPort || s.origin || "";
        const destination = s.ports?.destinationPort || s.destination || "";
        const ref = s.referenceNo || "";
        const consigneeName = s.consignee?.name || "";

        const haystack = [customerName, origin, destination, ref, consigneeName]
          .join(" ")
          .toLowerCase();

        return haystack.includes(term);
      })
      .map((s, index) => ({
        id: s._id || index,
        referenceNo: s.referenceNo,
        customer:
          s.customer?.fullname ||
          s.customer?.name ||
          s.shipper?.name ||
          s.customerName ||
          "—",
        origin: s.ports?.originPort || s.origin || "—",
        destination: s.ports?.destinationPort || s.destination || "—",
        mode: s.mode || "—",
        paymentStatus: s.paymentStatus || "unpaid",
        status: s.status || "pending",
        createdAt: s.createdAt
          ? new Date(s.createdAt).toISOString().slice(0, 10)
          : "—",
      }));
  }, [shipments, statusFilter, modeFilter, paymentFilter, searchTerm]);

  const columns = [
    {
      field: "referenceNo",
      headerName: "Order Ref",
      width: 190,
      renderCell: (params) => (
        <span className="text-[#FFA500] font-semibold">
          {params.value || "—"}
        </span>
      ),
    },
    {
      field: "customer",
      headerName: "Customer",
      width: 220,
      renderCell: (params) => (
        <span className="font-medium text-gray-100">{params.value || "—"}</span>
      ),
    },
    { field: "origin", headerName: "Origin", width: 150 },
    { field: "destination", headerName: "Destination", width: 150 },
    {
      field: "mode",
      headerName: "Mode",
      width: 120,
      renderCell: (params) => (
        <span className="capitalize text-gray-100">{params.value || "—"}</span>
      ),
    },
    {
      field: "paymentStatus",
      headerName: "Payment",
      width: 150,
      renderCell: (params) => {
        const value = (params.value || "unpaid").toLowerCase();
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${getPaymentChipClass(
              value
            )}`}
          >
            {value.replace("_", " ")}
          </span>
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: (params) => {
        const value = (params.value || "pending").toLowerCase();
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getStatusChipClass(
              value
            )}`}
          >
            {value}
          </span>
        );
      },
    },
    { field: "createdAt", headerName: "Created", width: 130 },
  ];

  const handleRowClick = (params) => {
    const id = params.id;
    if (!id) return;
    navigate(`/shipments/${id}`);
  };

  // Mobile card click uses the same navigation behaviour
  const handleCardClick = (id) => {
    if (!id) return;
    navigate(`/shipments/${id}`);
  };

  // Quick stats
  const totalOrders = shipments.length;
  const deliveredCount = shipments.filter(
    (s) => (s.status || "").toLowerCase() === "delivered"
  ).length;
  const unpaidCount = shipments.filter(
    (s) => (s.paymentStatus || "").toLowerCase() === "unpaid"
  ).length;

  // Export CSV for current filtered rows
  const handleExportCsv = () => {
    if (!filteredRows.length) return;

    const headers = [
      "Order Ref",
      "Customer",
      "Origin",
      "Destination",
      "Mode",
      "Payment Status",
      "Status",
      "Created",
    ];

    const lines = filteredRows.map((row) => [
      row.referenceNo || "",
      row.customer || "",
      row.origin || "",
      row.destination || "",
      row.mode || "",
      row.paymentStatus || "",
      row.status || "",
      row.createdAt || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...lines.map((line) =>
        line
          .map((field) => {
            const value = String(field ?? "");
            if (value.includes(",") || value.includes('"')) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    const timestamp = new Date().toISOString().slice(0, 10);
    link.download = `ellcworth-orders-${timestamp}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-3 sm:p-6 lg:p-8 bg-[#0F0F0F] min-h-screen text-white">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">Orders</h1>
          <p className="text-sm text-gray-400 mt-1">
            Commercial view of all shipments and their payment status.
          </p>
        </div>

        {/* Summary badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs w-full lg:w-auto">
          <div className="px-3 py-2 rounded-lg bg-[#020617] border border-[#1f2937]">
            <span className="block text-gray-400 uppercase tracking-wide">
              Total Orders
            </span>
            <span className="text-xl font-semibold">{totalOrders}</span>
          </div>

          <div className="px-3 py-2 rounded-lg bg-[#020617] border border-[#1f2937]">
            <span className="block text-gray-400 uppercase tracking-wide">
              Delivered
            </span>
            <span className="text-xl font-semibold text-emerald-300">
              {deliveredCount}
            </span>
          </div>

          <div className="px-3 py-2 rounded-lg bg-[#020617] border border-[#1f2937]">
            <span className="block text-gray-400 uppercase tracking-wide">
              Unpaid
            </span>
            <span className="text-xl font-semibold text-amber-300">
              {unpaidCount}
            </span>
          </div>
        </div>
      </div>

      {loadError && (
        <div className="mb-4 px-4 py-2 rounded-md bg-red-100 text-red-800 text-sm border border-red-300">
          {loadError}
        </div>
      )}

      {/* Filters + Search + Export */}
      <div className="mb-4 grid grid-cols-1 lg:flex lg:flex-wrap gap-3 lg:gap-4 lg:items-center lg:justify-between">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {/* Search */}
          <div className="flex flex-col gap-1">
            <span className="text-sm text-gray-300">Search</span>
            <input
              type="text"
              className="bg-[#020617] border border-[#1f2937] text-sm rounded px-3 py-2 outline-none w-full"
              placeholder="Ref, customer, shipper, route..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status filter */}
          <div className="flex flex-col gap-1">
            <span className="text-sm text-gray-300">Status</span>
            <select
              className="bg-[#020617] border border-[#1f2937] text-sm rounded px-3 py-2 outline-none w-full"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="booked">Booked</option>
              <option value="loaded">Loaded</option>
              <option value="sailed">Sailed</option>
              <option value="arrived">Arrived</option>
              <option value="cleared">Cleared</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Mode filter */}
          <div className="flex flex-col gap-1">
            <span className="text-sm text-gray-300">Mode</span>
            <select
              className="bg-[#020617] border border-[#1f2937] text-sm rounded px-3 py-2 outline-none w-full"
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="roro">RoRo</option>
              <option value="container">Container</option>
              <option value="air">Air</option>
              <option value="lcl">LCL</option>
              <option value="documents">Documents</option>
              <option value="pallets">Pallets</option>
              <option value="parcels">Parcels</option>
            </select>
          </div>

          {/* Payment filter */}
          <div className="flex flex-col gap-1">
            <span className="text-sm text-gray-300">Payment</span>
            <select
              className="bg-[#020617] border border-[#1f2937] text-sm rounded px-3 py-2 outline-none w-full"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="unpaid">Unpaid</option>
              <option value="part_paid">Part paid</option>
              <option value="paid">Paid</option>
              <option value="on_account">On account</option>
            </select>
          </div>
        </div>

        {/* Export button */}
        <div className="flex items-end justify-end">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={!filteredRows.length}
            className="w-full sm:w-auto text-xs px-3 py-2 rounded-md border border-[#374151] bg-[#020617] text-gray-200 hover:bg-[#111827] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export CSV ({filteredRows.length || 0})
          </button>
        </div>
      </div>

      {/* MOBILE: Card view */}
      <div className="grid gap-3 lg:hidden">
        {loading ? (
          <div className="bg-[#020617] rounded-2xl p-4 border border-[#1f2937] text-sm text-gray-400">
            Loading orders…
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="bg-[#020617] rounded-2xl p-4 border border-[#1f2937] text-sm text-gray-400">
            No orders found for the current filters.
          </div>
        ) : (
          filteredRows.map((row) => {
            const payment = (row.paymentStatus || "unpaid").toLowerCase();
            const status = (row.status || "pending").toLowerCase();

            return (
              <button
                key={row.id}
                type="button"
                onClick={() => handleCardClick(row.id)}
                className="text-left bg-[#020617] rounded-2xl p-4 shadow-2xl border border-[#1f2937] hover:bg-[#111827] transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[#FFA500] break-words">
                      {row.referenceNo || "—"}
                    </div>
                    <div className="text-xs text-gray-300 mt-1 break-words">
                      {row.customer || "—"}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getStatusChipClass(
                        status
                      )}`}
                    >
                      {status}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${getPaymentChipClass(
                        payment
                      )}`}
                    >
                      {payment.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <div className="mt-3 grid gap-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-gray-400">Route</span>
                    <span className="text-sm text-gray-100 font-medium text-right break-words">
                      {(row.origin || "—") + " → " + (row.destination || "—")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-gray-400">Mode</span>
                    <span className="text-sm text-gray-100 font-medium capitalize">
                      {row.mode || "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-gray-400">Created</span>
                    <span className="text-sm text-gray-100 font-medium">
                      {row.createdAt || "—"}
                    </span>
                  </div>
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  Tap to view full shipment details
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* DESKTOP: Table */}
      <div className="hidden lg:block bg-[#020617] rounded-2xl p-4 shadow-2xl border border-[#1f2937]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold tracking-[0.16em] uppercase text-gray-300">
            Orders Table
          </h2>
          <span className="text-xs text-gray-500">
            Click a row to view full shipment details
          </span>
        </div>

        <DataGrid
          rows={filteredRows}
          columns={columns}
          autoHeight
          loading={loading}
          pageSizeOptions={[5, 10, 20]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10, page: 0 } },
          }}
          disableRowSelectionOnClick
          onRowClick={handleRowClick}
          sx={{
            border: "1px solid #1f2937",
            borderRadius: "0.75rem",
            backgroundColor: "#020617",
            color: "#E5E5E5",
            fontSize: "0.85rem",

            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#0D121C",
              borderBottom: "1px solid #1F2937",
            },
            "& .MuiDataGrid-columnHeader": {
              backgroundColor: "#0D121C",
              color: "#FFFFFF",
              fontSize: "0.8rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              color: "#FFFFFF",
              fontWeight: 700,
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid #1f2937",
            },
            "& .MuiDataGrid-row:nth-of-type(2n)": {
              backgroundColor: "#020617",
            },
            "& .MuiDataGrid-row:nth-of-type(2n+1)": {
              backgroundColor: "#020617cc",
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "#111827",
              cursor: "pointer",
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "1px solid #1f2937",
              backgroundColor: "#020617",
            },
            "& .MuiTablePagination-root": {
              color: "#9ca3af",
            },
          }}
        />
      </div>
    </div>
  );
};

export default Orders;
