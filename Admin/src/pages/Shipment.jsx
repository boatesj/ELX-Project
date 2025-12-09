import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authRequest } from "../requestMethods";

const STATUS_OPTIONS = [
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

const CARGO_TYPE_OPTIONS = ["vehicle", "container", "lcl"];

const SERVICE_TYPE_OPTIONS = [
  { value: "sea_freight", label: "Sea freight" },
  { value: "air_freight", label: "Air freight" },
];

const MODE_OPTIONS = {
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

// Backend stores e.g. "RoRo" / "Container" (and we infer air vs sea via serviceType).
const backendModeToUiMode = (serviceType, backendMode) => {
  const mode = (backendMode || "").toLowerCase();

  if (serviceType === "air_freight") {
    // For air we currently store "Container" in backend – treat as generic air.
    return "air_general";
  }

  // Sea freight
  if (mode === "roro") return "roro";
  if (mode === "container") return "fcl"; // default to FCL for containers
  return "roro";
};

const uiModeToBackendMode = (serviceType, uiMode) => {
  if (serviceType === "sea_freight") {
    return uiMode === "roro" ? "RoRo" : "Container";
  }
  if (serviceType === "air_freight") {
    // Backend doesn’t have an "Air" enum yet – keep using "Container"
    // and distinguish air vs sea via serviceType + UI mode.
    return "Container";
  }
  return "Container";
};

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

const formatServiceLabelShort = (serviceType) => {
  switch (serviceType) {
    case "sea_freight":
      return "Sea Freight";
    case "air_freight":
      return "Air Freight";
    default:
      return "";
  }
};

const formatModeBadge = (mode) => {
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

const Shipment = () => {
  const { shipmentId } = useParams();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    // Core identifiers
    referenceNo: "",
    cargoType: "",
    serviceType: "sea_freight", // sea_freight | air_freight
    mode: "roro", // UI mode: roro | fcl | lcl | air_general | air_docs

    // Route & schedule
    originPort: "",
    destinationPort: "",
    status: "pending",
    shippingDate: "",
    eta: "",

    // Shipper
    shipperName: "",
    shipperAddress: "",
    shipperEmail: "",
    shipperPhone: "",

    // Consignee
    consigneeName: "",
    consigneeAddress: "",
    consigneeEmail: "",
    consigneePhone: "",

    // Notify party
    notifyName: "",
    notifyAddress: "",
    notifyEmail: "",
    notifyPhone: "",

    // Vessel / Flight
    vesselName: "",
    vesselVoyage: "",

    // Cargo – generic
    cargoDescription: "",
    cargoWeight: "",

    // Vehicle (RoRo)
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    vehicleVin: "",

    // Container
    containerNo: "",
    containerSize: "",
    containerSealNo: "",

    // Repacking / value-added services
    repackingRequired: false,
    repackingNotes: "",
  });

  const handleBack = () => {
    navigate("/shipments");
  };

  const handleChange = (field) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;

    setForm((prev) => {
      // If switching service type, reset incompatible mode sensibly
      if (field === "serviceType") {
        const newServiceType = value;
        const firstMode = MODE_OPTIONS[newServiceType]?.[0]?.value || "";
        return {
          ...prev,
          serviceType: newServiceType,
          mode: firstMode,
        };
      }
      return { ...prev, [field]: value };
    });
  };

  // ---------------- FETCH EXISTING SHIPMENT (EDIT MODE) ----------------
  useEffect(() => {
    const fetchShipment = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        const res = await authRequest.get(`/api/v1/shipments/${shipmentId}`);
        const s = res.data?.shipment || res.data?.data || res.data;

        setShipment(s);

        const inferredServiceType =
          s.serviceType ||
          (s.mode && s.mode.toLowerCase().startsWith("air")
            ? "air_freight"
            : "sea_freight");

        const uiMode = backendModeToUiMode(inferredServiceType, s.mode);

        setForm({
          referenceNo: s.referenceNo || "",
          cargoType: s.cargoType || "",

          serviceType: inferredServiceType,
          mode: uiMode,

          originPort: s.ports?.originPort || "",
          destinationPort: s.ports?.destinationPort || "",
          status: s.status || "pending",
          shippingDate: s.shippingDate
            ? new Date(s.shippingDate).toISOString().slice(0, 10)
            : "",
          eta: s.eta ? new Date(s.eta).toISOString().slice(0, 10) : "",

          shipperName: s.shipper?.name || "",
          shipperAddress: s.shipper?.address || "",
          shipperEmail: s.shipper?.email || "",
          shipperPhone: s.shipper?.phone || "",

          consigneeName: s.consignee?.name || "",
          consigneeAddress: s.consignee?.address || "",
          consigneeEmail: s.consignee?.email || "",
          consigneePhone: s.consignee?.phone || "",

          notifyName: s.notify?.name || "",
          notifyAddress: s.notify?.address || "",
          notifyEmail: s.notify?.email || "",
          notifyPhone: s.notify?.phone || "",

          vesselName: s.vessel?.name || "",
          vesselVoyage: s.vessel?.voyage || "",

          cargoDescription: s.cargo?.description || "",
          cargoWeight: s.cargo?.weight || "",

          vehicleMake: s.cargo?.vehicle?.make || "",
          vehicleModel: s.cargo?.vehicle?.model || "",
          vehicleYear: s.cargo?.vehicle?.year || "",
          vehicleVin: s.cargo?.vehicle?.vin || "",

          containerNo: s.cargo?.container?.containerNo || "",
          containerSize: s.cargo?.container?.size || "",
          containerSealNo: s.cargo?.container?.sealNo || "",

          repackingRequired: s.services?.repacking?.required ?? false,
          repackingNotes: s.services?.repacking?.notes || "",
        });
      } catch (error) {
        console.error(
          "❌ Error fetching shipment:",
          error.response?.data || error
        );
        setErrorMsg(
          error.response?.data?.message || "Could not load shipment details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (shipmentId) {
      fetchShipment();
    }
  }, [shipmentId]);

  // ---------------- SAVE / UPDATE BOOKING ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shipmentId) return;

    try {
      setSaving(true);
      setErrorMsg("");

      const backendMode = uiModeToBackendMode(form.serviceType, form.mode);

      const payload = {
        referenceNo: form.referenceNo || shipment.referenceNo,
        serviceType: form.serviceType,
        mode: backendMode,
        status: form.status,

        ports: {
          originPort: form.originPort,
          destinationPort: form.destinationPort,
        },

        shipper: {
          name: form.shipperName,
          address: form.shipperAddress,
          email: form.shipperEmail,
          phone: form.shipperPhone,
        },
        consignee: {
          name: form.consigneeName,
          address: form.consigneeAddress,
          email: form.consigneeEmail,
          phone: form.consigneePhone,
        },
        notify: {
          name: form.notifyName,
          address: form.notifyAddress,
          email: form.notifyEmail,
          phone: form.notifyPhone,
        },
        vessel: {
          // Sea: vessel name/voyage, Air: airline/flight no.
          name: form.vesselName,
          voyage: form.vesselVoyage,
        },
        shippingDate: form.shippingDate
          ? new Date(form.shippingDate)
          : shipment.shippingDate,
        eta: form.eta ? new Date(form.eta) : shipment.eta,
        cargo: {
          description: form.cargoDescription,
          // keep as string for validators / schema that expect String
          weight: form.cargoWeight,
          vehicle: {
            make: form.vehicleMake,
            model: form.vehicleModel,
            year: form.vehicleYear,
            vin: form.vehicleVin,
          },
          container: {
            containerNo: form.containerNo,
            size: form.containerSize,
            sealNo: form.containerSealNo,
          },
        },
        services: {
          repacking: {
            required: form.repackingRequired,
            notes: form.repackingNotes,
          },
        },
      };

      if (form.cargoType) {
        payload.cargoType = form.cargoType; // vehicle | container | lcl (for internal reporting)
      }

      const res = await authRequest.put(
        `/api/v1/shipments/${shipmentId}`,
        payload
      );
      const updated = res.data?.shipment || res.data?.data || res.data;
      setShipment(updated);

      alert("Shipment updated successfully.");
    } catch (error) {
      console.error(
        "❌ Error updating shipment:",
        error.response?.data || error
      );
      setErrorMsg(
        error.response?.data?.message || "Failed to update this shipment."
      );
    } finally {
      setSaving(false);
    }
  };

  const isSea = form.serviceType === "sea_freight";
  const isAir = form.serviceType === "air_freight";
  const isRoRo = form.mode === "roro" || form.cargoType === "vehicle";
  const isContainerMode =
    form.mode === "fcl" ||
    form.mode === "lcl" ||
    form.cargoType === "container" ||
    form.cargoType === "lcl";
  const isDocs = form.mode === "air_docs";

  // ---------------- RENDER ----------------

  if (loading) {
    return (
      <div className="m-[30px] bg-[#D9D9D9] p-[20px] rounded-md">
        <button
          onClick={handleBack}
          className="mb-4 inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md bg-[#1A2930] text-white hover:bg-[#FFA500] transition"
        >
          ← Back to all shipments
        </button>
        <p className="text-sm text-gray-700">Loading shipment details...</p>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="m-[30px] bg-[#D9D9D9] p-[20px] rounded-md">
        <button
          onClick={handleBack}
          className="mb-4 inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md bg-[#1A2930] text-white hover:bg-[#FFA500] transition"
        >
          ← Back to all shipments
        </button>
        <p className="text-sm text-red-600">
          {errorMsg || "Shipment not found."}
        </p>
      </div>
    );
  }

  const currentModeOptions = MODE_OPTIONS[form.serviceType] || [];

  return (
    <div className="m-[30px] bg-[#D9D9D9] p-[20px] rounded-md space-y-4 font-montserrat">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md bg-[#1A2930] text-white hover:bg-[#FFA500] transition"
          >
            ← Back to all shipments
          </button>
          <div>
            <h1 className="text-[20px] font-semibold text-[#1A2930]">
              Admin booking – Shipment
            </h1>
            <p className="text-xs text-gray-600 mt-1 font-mono">
              {form.referenceNo}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px]">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#1A2930] text-white">
                {formatServiceLabelShort(form.serviceType)}
              </span>
              {form.mode && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#FFA500]/15 text-[#1A2930] border border-[#FFA500]/40">
                  {formatModeBadge(form.mode)}
                </span>
              )}
              {form.repackingRequired && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Repacking requested
                </span>
              )}
              {isDocs && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Secure documents
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClasses(
              form.status
            )}`}
          >
            {formatStatusLabel(form.status)}
          </span>
          <div className="text-right text-[11px] text-gray-500">
            {shipment.createdAt && (
              <p>
                Created: {new Date(shipment.createdAt).toLocaleString("en-GB")}
              </p>
            )}
            {shipment.updatedAt && (
              <p>
                Updated: {new Date(shipment.updatedAt).toLocaleString("en-GB")}
              </p>
            )}
          </div>
        </div>
      </div>

      {errorMsg && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-md">
          {errorMsg}
        </p>
      )}

      {/* BOOKING FORM */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 xl:grid-cols-[1.1fr_1.1fr] gap-6 items-start"
      >
        {/* LEFT – Route, Status, Service, Vessel/Flight */}
        <div className="space-y-4">
          <div className="bg-white rounded-md p-4 shadow-sm space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
              Service, route & status
            </h2>

            {/* Service & product selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-700">
                  Service type
                </label>
                <select
                  value={form.serviceType}
                  onChange={handleChange("serviceType")}
                  className="border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                >
                  {SERVICE_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-700">
                  Product / mode
                </label>
                <select
                  value={form.mode}
                  onChange={handleChange("mode")}
                  className="border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                >
                  {currentModeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-700">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={handleChange("status")}
                  className="border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {formatStatusLabel(st)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cargo type (still useful for validation / views) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-700">
                  Cargo type (internal)
                </label>
                <select
                  value={form.cargoType}
                  onChange={handleChange("cargoType")}
                  className="border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                >
                  <option value="">Select…</option>
                  {CARGO_TYPE_OPTIONS.map((ct) => (
                    <option key={ct} value={ct}>
                      {ct.charAt(0).toUpperCase() + ct.slice(1)}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  Vehicle / container / LCL – used for internal reporting.
                </p>
              </div>
            </div>

            {/* Route fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-700">
                  {isSea ? "Origin port" : "Origin airport / location"}
                </label>
                <input
                  type="text"
                  value={form.originPort}
                  onChange={handleChange("originPort")}
                  className="border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder={isSea ? "Southampton" : "Heathrow (LHR)"}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-700">
                  {isSea ? "Destination port" : "Destination airport / city"}
                </label>
                <input
                  type="text"
                  value={form.destinationPort}
                  onChange={handleChange("destinationPort")}
                  className="border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder={isSea ? "Tema" : "Accra (ACC)"}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-700">
                  ETD ({isSea ? "sailing date" : "departure date"})
                </label>
                <input
                  type="date"
                  value={form.shippingDate}
                  onChange={handleChange("shippingDate")}
                  className="border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-700">
                  ETA (arrival)
                </label>
                <input
                  type="date"
                  value={form.eta}
                  onChange={handleChange("eta")}
                  className="border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Vessel / Flight */}
          <div className="bg-white rounded-md p-4 shadow-sm space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
              {isSea ? "Vessel (optional)" : "Airline / flight (optional)"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-700">
                  {isSea ? "Vessel name" : "Airline / carrier"}
                </label>
                <input
                  type="text"
                  value={form.vesselName}
                  onChange={handleChange("vesselName")}
                  className="border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder={isSea ? "MV Great Africa" : "British Airways"}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-700">
                  {isSea ? "Voyage / rotation" : "Flight no. / MAWB"}
                </label>
                <input
                  type="text"
                  value={form.vesselVoyage}
                  onChange={handleChange("vesselVoyage")}
                  className="border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder={isSea ? "GA123W" : "BA081 / 125-1234 5678"}
                />
              </div>
            </div>
          </div>

          {/* Repacking / value-added services */}
          <div className="bg-white rounded-md p-4 shadow-sm space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
              Value-added services
            </h2>
            <div className="flex items-start gap-2 mt-1">
              <input
                id="repackingRequired"
                type="checkbox"
                checked={form.repackingRequired}
                onChange={handleChange("repackingRequired")}
                className="mt-1 h-4 w-4 border-gray-300 rounded"
              />
              <div className="flex-1">
                <label
                  htmlFor="repackingRequired"
                  className="text-xs font-medium text-gray-700"
                >
                  Repacking / consolidation required
                </label>
                <p className="text-[10px] text-gray-500">
                  For loose items, pallets or secure documents that need
                  re-boxing, tamper-proof packaging or consolidation before
                  export.
                </p>
              </div>
            </div>
            {form.repackingRequired && (
              <div className="mt-2">
                <textarea
                  value={form.repackingNotes}
                  onChange={handleChange("repackingNotes")}
                  className="border border-gray-300 rounded px-3 py-2 text-sm w-full h-[70px]"
                  placeholder="E.g. Repack certificates into tamper-proof envelopes; add bubble wrap; label as 'Secure documents – handle with care'."
                />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT – Parties & Cargo */}
        <div className="space-y-4">
          {/* Shipper / Consignee / Notify */}
          <div className="bg-white rounded-md p-4 shadow-sm space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
              Parties
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {/* Shipper */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-700">Shipper</p>
                <input
                  type="text"
                  value={form.shipperName}
                  onChange={handleChange("shipperName")}
                  className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                  placeholder="Shipper name"
                />
                <input
                  type="text"
                  value={form.shipperAddress}
                  onChange={handleChange("shipperAddress")}
                  className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                  placeholder="Address"
                />
                <input
                  type="email"
                  value={form.shipperEmail}
                  onChange={handleChange("shipperEmail")}
                  className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                  placeholder="Email"
                />
                <input
                  type="text"
                  value={form.shipperPhone}
                  onChange={handleChange("shipperPhone")}
                  className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                  placeholder="Phone"
                />
              </div>

              {/* Consignee */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-700">Consignee</p>
                <input
                  type="text"
                  value={form.consigneeName}
                  onChange={handleChange("consigneeName")}
                  className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                  placeholder="Consignee name"
                />
                <input
                  type="text"
                  value={form.consigneeAddress}
                  onChange={handleChange("consigneeAddress")}
                  className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                  placeholder="Address"
                />
                <input
                  type="email"
                  value={form.consigneeEmail}
                  onChange={handleChange("consigneeEmail")}
                  className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                  placeholder="Email"
                />
                <input
                  type="text"
                  value={form.consigneePhone}
                  onChange={handleChange("consigneePhone")}
                  className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                  placeholder="Phone"
                />
              </div>
            </div>

            {/* Notify party */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-700">
                Notify party (optional)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <input
                    type="text"
                    value={form.notifyName}
                    onChange={handleChange("notifyName")}
                    className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                    placeholder="Notify name"
                  />
                  <input
                    type="text"
                    value={form.notifyAddress}
                    onChange={handleChange("notifyAddress")}
                    className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                    placeholder="Address"
                  />
                </div>
                <div className="space-y-2">
                  <input
                    type="email"
                    value={form.notifyEmail}
                    onChange={handleChange("notifyEmail")}
                    className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                    placeholder="Email"
                  />
                  <input
                    type="text"
                    value={form.notifyPhone}
                    onChange={handleChange("notifyPhone")}
                    className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                    placeholder="Phone"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Cargo */}
          <div className="bg-white rounded-md p-4 shadow-sm space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
              Cargo details
            </h2>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={form.cargoDescription}
                onChange={handleChange("cargoDescription")}
                className="border border-gray-300 rounded px-3 py-2 text-sm w-full h-[70px]"
                placeholder={
                  isDocs
                    ? "Secure academic certificates and transcripts; tamper-proof envelopes."
                    : "Used Nissan Qashqai 1.6 petrol, 5-door, metallic grey…"
                }
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-700">
                {isDocs ? "Chargeable weight" : "Weight"}
              </label>
              <input
                type="text"
                value={form.cargoWeight}
                onChange={handleChange("cargoWeight")}
                className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                placeholder={isDocs ? "e.g. 5 kg (chargeable)" : "1450 kg"}
              />
            </div>

            {/* Vehicle – RoRo */}
            {isRoRo && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-700">
                    Vehicle (RoRo)
                  </p>
                  <input
                    type="text"
                    value={form.vehicleMake}
                    onChange={handleChange("vehicleMake")}
                    className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                    placeholder="Make"
                  />
                  <input
                    type="text"
                    value={form.vehicleModel}
                    onChange={handleChange("vehicleModel")}
                    className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                    placeholder="Model"
                  />
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={form.vehicleYear}
                    onChange={handleChange("vehicleYear")}
                    className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                    placeholder="Year"
                  />
                  <input
                    type="text"
                    value={form.vehicleVin}
                    onChange={handleChange("vehicleVin")}
                    className="border border-gray-300 rounded px-3 py-2 text-sm w-full font-mono"
                    placeholder="VIN / chassis no."
                  />
                </div>
              </div>
            )}

            {/* Container – FCL / LCL */}
            {isContainerMode && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-700">
                    Container
                  </p>
                  <input
                    type="text"
                    value={form.containerNo}
                    onChange={handleChange("containerNo")}
                    className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                    placeholder={
                      form.mode === "lcl"
                        ? "Groupage container ref (if known)"
                        : "Container no."
                    }
                  />
                  <input
                    type="text"
                    value={form.containerSize}
                    onChange={handleChange("containerSize")}
                    className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                    placeholder={
                      form.mode === "lcl"
                        ? "CBM / pallet count"
                        : "Size (20ft / 40ft / 40HC)"
                    }
                  />
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={form.containerSealNo}
                    onChange={handleChange("containerSealNo")}
                    className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                    placeholder={
                      form.mode === "lcl" ? "Internal ref / seal" : "Seal no."
                    }
                  />
                </div>
              </div>
            )}
          </div>

          {/* Save button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="
                bg-[#1A2930] text-white 
                px-6 py-2.5 rounded-md 
                hover:bg-[#FFA500] hover:text-black 
                font-semibold text-sm transition
                disabled:opacity-60 disabled:cursor-not-allowed
              "
            >
              {saving ? "Saving changes..." : "Update shipment"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Shipment;
