import { DataGrid } from "@mui/x-data-grid";
import { FaTrash } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { authRequest } from "../requestMethods";

const formatStatusLabel = (status) => {
  if (!status) return "";
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const getStatusClasses = (status) => {
  switch (status) {
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

const Shipments = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // ✅ Controlled pagination (fixes “stuck” pagination issues)
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  });

  const redirectToLogin = (message) => {
    setLoadError(message || "Please log in to view shipments.");
    localStorage.removeItem("token");
    localStorage.removeItem("ellcworth_token");
    localStorage.removeItem("user");
    navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this shipment?"
    );
    if (!confirm) return;

    try {
      await authRequest.delete(`/api/v1/shipments/${id}`);
      setRows((prev) => prev.filter((row) => row._id !== id));
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401) {
        redirectToLogin("Your session has expired. Please log in again.");
        return;
      }
      console.error(
        "❌ Error deleting shipment:",
        error.response?.data || error
      );
      alert("Failed to delete shipment. Please try again.");
    }
  };

  const columns = useMemo(
    () => [
      { field: "referenceNo", headerName: "Reference", width: 190 },
      { field: "shipper", headerName: "Shipper", width: 220 },
      { field: "consignee", headerName: "Consignee", width: 220 },
      { field: "from", headerName: "From", width: 160 },
      { field: "destination", headerName: "Destination", width: 170 },
      { field: "mode", headerName: "Mode", width: 110 },
      { field: "weight", headerName: "Weight", width: 120 },
      {
        field: "status",
        headerName: "Status",
        width: 160,
        renderCell: (params) => (
          <div className="flex items-center h-full">
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold leading-tight ${getStatusClasses(
                params.value
              )}`}
            >
              {formatStatusLabel(params.value)}
            </span>
          </div>
        ),
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 200,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          const id = params.row._id;
          return (
            <div className="flex items-center h-full gap-3">
              <Link to={`/shipments/${id}`}>
                <button
                  type="button"
                  className="
                    px-3 py-1 rounded-md font-semibold text-xs
                    bg-[#FFA500] text-black
                    hover:bg-[#e69300] transition
                  "
                >
                  Edit
                </button>
              </Link>

              <button
                type="button"
                onClick={() => handleDelete(id)}
                className="
                  flex items-center gap-2
                  px-3 py-1 rounded-md font-semibold text-xs
                  bg-[#E53935] text-white
                  hover:bg-[#c62828] transition
                "
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

  useEffect(() => {
    const getShipments = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          redirectToLogin("Please log in to view shipments.");
          setLoading(false);
          return;
        }

        const res = await authRequest.get("/api/v1/shipments");

        let shipmentsArray = [];
        if (Array.isArray(res.data)) shipmentsArray = res.data;
        else if (Array.isArray(res.data.shipments))
          shipmentsArray = res.data.shipments;
        else if (Array.isArray(res.data.data)) shipmentsArray = res.data.data;

        const normalised = shipmentsArray.map((s) => ({
          _id: s._id,
          referenceNo: s.referenceNo,
          shipper: s.shipper?.name || "",
          consignee: s.consignee?.name || "",
          from: s.ports?.originPort || "",
          destination: s.ports?.destinationPort || "",
          mode: s.mode || "",
          weight: s.cargo?.weight || "",
          status: s.status || "pending",
          raw: s,
        }));

        setRows(normalised);
      } catch (error) {
        const status = error?.response?.status;
        if (status === 401) {
          redirectToLogin("Your session has expired. Please log in again.");
          return;
        }
        console.error(
          "❌ Error fetching shipments:",
          error.response?.data || error
        );
        setLoadError(
          error?.response?.data?.message || "Failed to load shipments."
        );
      } finally {
        setLoading(false);
      }
    };

    getShipments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-[#D9D9D9] rounded-md p-3 sm:p-5 lg:p-[20px]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h1 className="text-[18px] sm:text-[20px] font-semibold">
          All Shipments
        </h1>

        <Link to="/newshipment" className="w-full sm:w-auto">
          <button className="w-full sm:w-auto bg-[#1A2930] text-white px-4 py-2.5 rounded-md hover:bg-[#FFA500] hover:text-black transition font-semibold">
            New Shipment
          </button>
        </Link>
      </div>

      {loadError ? (
        <div className="mb-3 bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
          {loadError}
        </div>
      ) : null}

      {/* MOBILE: Card list */}
      <div className="grid gap-3 lg:hidden">
        {loading ? (
          <div className="bg-white rounded-md p-4 shadow-md text-sm text-gray-600">
            Loading shipments...
          </div>
        ) : rows.length === 0 ? (
          <div className="bg-white rounded-md p-4 shadow-md text-sm text-gray-600">
            No shipments found.
          </div>
        ) : (
          rows.map((row) => (
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
                  className={`shrink-0 px-2 py-1 rounded-full text-xs font-semibold leading-tight ${getStatusClasses(
                    row.status
                  )}`}
                >
                  {formatStatusLabel(row.status)}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500 text-xs">Shipper</span>
                  <span className="text-slate-900 text-sm font-medium text-right break-words">
                    {row.shipper || "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500 text-xs">Consignee</span>
                  <span className="text-slate-900 text-sm font-medium text-right break-words">
                    {row.consignee || "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500 text-xs">Route</span>
                  <span className="text-slate-900 text-sm font-medium text-right break-words">
                    {(row.from || "—") + " → " + (row.destination || "—")}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Link to={`/shipments/${row._id}`} className="flex-1">
                  <button className="w-full px-3 py-2 rounded-md font-semibold text-xs bg-[#FFA500] text-black hover:bg-[#e69300] transition">
                    Edit
                  </button>
                </Link>

                <button
                  onClick={() => handleDelete(row._id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md font-semibold text-xs bg-[#E53935] text-white hover:bg-[#c62828] transition"
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
          getRowId={(row) => row._id}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          pagination
          pageSizeOptions={[5, 10, 25]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          autoHeight
        />
      </div>
    </div>
  );
};

export default Shipments;
