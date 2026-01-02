// Admin/src/pages/shipment/shipmentConstants.js

export const STATUS_OPTIONS = [
  "request_received",
  "under_review",
  "quoted",
  "customer_requested_changes",
  "customer_approved",
  "pending",
  "booked",
  "at_origin_yard",
  "loaded",
  "sailed",
  "arrived",
  "cleared",
  "delivered",
  "cancelled",
];

export const CARGO_TYPE_OPTIONS = ["vehicle", "container", "lcl"];

export const SERVICE_TYPE_OPTIONS = [
  { value: "sea_freight", label: "Sea freight" },
  { value: "air_freight", label: "Air freight" },
];

export const PAYMENT_STATUS_OPTIONS = [
  { value: "unpaid", label: "Unpaid" },
  { value: "part_paid", label: "Part paid" },
  { value: "paid", label: "Paid" },
  { value: "on_account", label: "On account" },
];

export const MODE_OPTIONS = {
  sea_freight: [
    { value: "roro", label: "RoRo – vehicle shipment" },
    { value: "fcl", label: "FCL – full container" },
    { value: "lcl", label: "LCL – shared container" },
  ],
  air_freight: [
    { value: "air_general", label: "Air freight – general cargo" },
    { value: "air_docs", label: "Air freight – secure documents" },
  ],
};

// ---------- MODE MAPPERS (backend <-> UI) ----------
export const backendModeToUiMode = (serviceType, backendMode) => {
  const mode = (backendMode || "").toLowerCase();

  if (serviceType === "air_freight") {
    return mode.includes("doc") ? "air_docs" : "air_general";
  }

  if (mode === "roro") return "roro";
  if (mode === "container") return "fcl";
  if (mode === "lcl") return "lcl";
  return "roro";
};

export const uiModeToBackendMode = (serviceType, uiMode) => {
  if (serviceType === "sea_freight") {
    if (uiMode === "roro") return "RoRo";
    if (uiMode === "lcl") return "LCL";
    return "Container";
  }

  if (serviceType === "air_freight") {
    if (uiMode === "air_docs") return "Documents";
    return "Air";
  }

  return "Container";
};

export const formatStatusLabel = (status) => {
  if (!status) return "";
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export const getStatusClasses = (status) => {
  switch (status) {
    // Request / Quote pipeline
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

    // Operational
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

export const formatServiceLabelShort = (serviceType) => {
  switch (serviceType) {
    case "sea_freight":
      return "Sea Freight";
    case "air_freight":
      return "Air Freight";
    default:
      return "";
  }
};

export const formatModeBadge = (mode) => {
  switch (mode) {
    case "roro":
      return "RoRo · Vehicles";
    case "fcl":
      return "FCL · Full container";
    case "lcl":
      return "LCL · Shared container";
    case "air_general":
      return "Air · General cargo";
    case "air_docs":
      return "Air · Secure documents";
    default:
      return "";
  }
};

export const REQUEST_STATUSES = new Set([
  "request_received",
  "under_review",
  "quoted",
  "customer_requested_changes",
  "customer_approved",
]);
