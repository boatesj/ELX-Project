import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { authRequest } from "../requestMethods";
import AdminTable from "../components/AdminTable";

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

function pickShipmentsList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.shipments)) return data.shipments;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

const Orders = () => {
  const navigate = useNavigate();

  const [shipments, setShipments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const fetchShipments = async () => {
    setLoading(true);
    setLoadError("");

    try {
      const res = await authRequest.get("/shipments");
      const list = pickShipmentsList(res?.data);
      setShipments(list);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        navigate(`/login?redirect=${encodeURIComponent("/orders")}`);
        return;
      }
      setLoadError("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return shipments
      .filter((s) =>
        statusFilter === "all"
          ? true
          : String(s.status || "").toLowerCase() === statusFilter,
      )
      .filter((s) =>
        modeFilter === "all"
          ? true
          : String(s.mode || "").toLowerCase() === modeFilter,
      )
      .filter((s) =>
        paymentFilter === "all"
          ? true
          : String(s.paymentStatus || "").toLowerCase() === paymentFilter,
      )
      .filter((s) => {
        if (!term) return true;
        const haystack = [
          s.referenceNo,
          s.shipper?.name,
          s.consignee?.name,
          s.ports?.originPort,
          s.ports?.destinationPort,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(term);
      })
      .map((s, index) => ({
        id: s._id || s.id || index,
        referenceNo: s.referenceNo || "—",
        customer: s.shipper?.name || s.customer?.fullname || "—",
        origin: s.ports?.originPort || "—",
        destination: s.ports?.destinationPort || "—",
        mode: s.mode || "—",
        paymentStatus: s.paymentStatus || "unpaid",
        status: s.status || "pending",
        createdAt: s.createdAt
          ? new Date(s.createdAt).toISOString().slice(0, 10)
          : "—",
      }));
  }, [shipments, statusFilter, modeFilter, paymentFilter, searchTerm]);

  const handleRowClick = (row) => {
    navigate(`/shipments/${row.id}`);
  };

  const totalOrders = shipments.length;
  const deliveredCount = shipments.filter(
    (s) => String(s.status || "").toLowerCase() === "delivered",
  ).length;
  const unpaidCount = shipments.filter(
    (s) => String(s.paymentStatus || "").toLowerCase() === "unpaid",
  ).length;

  return (
    <div className="p-3 sm:p-6 lg:p-8 bg-[#0F0F0F] min-h-screen text-white">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold">Orders</h1>
        <p className="text-sm text-gray-400 mt-1">
          Commercial view of all shipments.
        </p>
      </div>

      {loadError && (
        <div className="mb-4 bg-red-100 text-red-800 p-3 text-sm">
          {loadError}
        </div>
      )}

      {/* Filters */}
      <div className="grid gap-3 mb-6">
        <input
          type="text"
          placeholder="Search..."
          className="bg-[#020617] border border-[#1f2937] px-3 py-2 rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Desktop Table */}
      <div className="bg-[#020617] rounded-2xl p-4 border border-[#1f2937]">
        <AdminTable
          data={filteredRows}
          pageSize={10}
          onRowClick={handleRowClick}
          columns={[
            {
              header: "Order Ref",
              accessorKey: "referenceNo",
            },
            {
              header: "Customer",
              accessorKey: "customer",
            },
            {
              header: "Origin",
              accessorKey: "origin",
            },
            {
              header: "Destination",
              accessorKey: "destination",
            },
            {
              header: "Mode",
              accessorKey: "mode",
            },
            {
              header: "Payment",
              cell: ({ row }) => {
                const value = row.original.paymentStatus;
                return (
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getPaymentChipClass(
                      value,
                    )}`}
                  >
                    {value.replace("_", " ")}
                  </span>
                );
              },
            },
            {
              header: "Status",
              cell: ({ row }) => {
                const value = row.original.status;
                return (
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getStatusChipClass(
                      value,
                    )}`}
                  >
                    {value}
                  </span>
                );
              },
            },
            {
              header: "Created",
              accessorKey: "createdAt",
            },
          ]}
        />
      </div>
    </div>
  );
};

export default Orders;
