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

// payment status options
const PAYMENT_STATUS_OPTIONS = [
  { value: "unpaid", label: "Unpaid" },
  { value: "part_paid", label: "Part paid" },
  { value: "paid", label: "Paid" },
  { value: "on_account", label: "On account" },
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
const backendModeToUiMode = (serviceType, backendMode) => {
  const mode = (backendMode || "").toLowerCase();

  if (serviceType === "air_freight") {
    return mode.includes("doc") ? "air_docs" : "air_general";
  }

  if (mode === "roro") return "roro";
  if (mode === "container") return "fcl";
  if (mode === "lcl") return "lcl";
  return "roro";
};

const uiModeToBackendMode = (serviceType, uiMode) => {
  if (serviceType === "sea_freight") {
    if (uiMode === "roro") return "RoRo";
    if (uiMode === "lcl") return "LCL";
    return "Container";
  }
  if (serviceType === "air_freight") {
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

// ---------- Small UI helpers (mobile-first) ----------
const Card = ({ title, children, right }) => (
  <div className="bg-white rounded-md p-4 shadow-sm space-y-3">
    <div className="flex items-start justify-between gap-4">
      <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
        {title}
      </h2>
      {right ? <div>{right}</div> : null}
    </div>
    {children}
  </div>
);

const Section = ({ title, subtitle, open, onToggle, children }) => (
  <div className="bg-white rounded-md shadow-sm">
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-start justify-between gap-4 px-4 py-3 text-left border-b border-slate-100"
    >
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
          {title}
        </h3>
        {subtitle ? (
          <p className="text-[11px] text-gray-500 mt-1">{subtitle}</p>
        ) : null}
      </div>
      <span className="text-xs font-semibold text-[#1A2930]">
        {open ? "Hide" : "Show"}
      </span>
    </button>

    {open ? <div className="px-4 pb-4 pt-3">{children}</div> : null}
  </div>
);

const Field = ({ label, children, hint }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-medium text-gray-700">{label}</label>
    {children}
    {hint ? <p className="text-[10px] text-gray-500 mt-0.5">{hint}</p> : null}
  </div>
);

const Input = (props) => (
  <input
    {...props}
    className={`border border-gray-300 rounded px-3 py-2 text-sm w-full bg-white ${
      props.className || ""
    }`}
  />
);

const Select = (props) => (
  <select
    {...props}
    className={`border border-gray-300 rounded px-3 py-2 text-sm w-full bg-white ${
      props.className || ""
    }`}
  />
);

const Textarea = (props) => (
  <textarea
    {...props}
    className={`border border-gray-300 rounded px-3 py-2 text-sm w-full bg-white ${
      props.className || ""
    }`}
  />
);

const Shipment = () => {
  const { shipmentId } = useParams();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Document section state
  const [newDocName, setNewDocName] = useState("");
  const [newDocUrl, setNewDocUrl] = useState("");
  const [docSaving, setDocSaving] = useState(false);
  const [docError, setDocError] = useState("");

  // Mobile section toggles
  const [openService, setOpenService] = useState(true);
  const [openVessel, setOpenVessel] = useState(false);
  const [openParties, setOpenParties] = useState(false);
  const [openCargo, setOpenCargo] = useState(false);
  const [openDocs, setOpenDocs] = useState(false);
  const [openServices, setOpenServices] = useState(false);

  const [form, setForm] = useState({
    // Core identifiers
    referenceNo: "",
    cargoType: "",
    serviceType: "sea_freight",
    mode: "roro",

    // Route & schedule
    originPort: "",
    destinationPort: "",
    status: "pending",
    paymentStatus: "unpaid", // ✅ NEW: persist payment status
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

  const handleBack = () => navigate("/shipments");

  const handleChange = (field) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;

    setForm((prev) => {
      if (field === "serviceType") {
        const newServiceType = value;
        const firstMode = MODE_OPTIONS[newServiceType]?.[0]?.value || "";
        return { ...prev, serviceType: newServiceType, mode: firstMode };
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

        if (!s) {
          setShipment(null);
          setErrorMsg("Shipment not found.");
          return;
        }

        const inferredServiceType =
          s.serviceType ||
          (s.mode && s.mode.toLowerCase().startsWith("air")
            ? "air_freight"
            : "sea_freight");

        const uiMode = backendModeToUiMode(inferredServiceType, s.mode);

        setShipment({ ...s, documents: s.documents || [] });

        setForm({
          referenceNo: s.referenceNo || "",
          cargoType: s.cargoType || "",
          serviceType: inferredServiceType,
          mode: uiMode,

          originPort: s.ports?.originPort || "",
          destinationPort: s.ports?.destinationPort || "",
          status: s.status || "pending",
          paymentStatus: s.paymentStatus || "unpaid", // ✅ NEW: load payment status
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

    if (shipmentId) fetchShipment();
  }, [shipmentId]);

  // ---------------- SAVE / UPDATE BOOKING ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shipmentId || !shipment) return;

    try {
      setSaving(true);
      setErrorMsg("");

      const backendMode = uiModeToBackendMode(form.serviceType, form.mode);

      const payload = {
        referenceNo: form.referenceNo || shipment.referenceNo,
        serviceType: form.serviceType,
        mode: backendMode,
        status: form.status,
        paymentStatus: form.paymentStatus || "unpaid", // ✅ NEW: persist payment status

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
          name: form.vesselName,
          voyage: form.vesselVoyage,
        },
        shippingDate: form.shippingDate
          ? new Date(form.shippingDate)
          : shipment.shippingDate,
        eta: form.eta ? new Date(form.eta) : shipment.eta,

        cargo: {
          description: form.cargoDescription,
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

      if (form.cargoType) payload.cargoType = form.cargoType;

      const res = await authRequest.put(
        `/api/v1/shipments/${shipmentId}`,
        payload
      );
      const updated = res.data?.shipment || res.data?.data || res.data;

      setShipment((prev) => ({ ...(prev || {}), ...(updated || {}) }));

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

  // ---------------- DOCUMENTS: ADD / MANAGE ----------------
  const handleAddDocument = async () => {
    if (!shipmentId) return;

    if (!newDocName.trim() || !newDocUrl.trim()) {
      setDocError("Please provide both a document name and a file URL.");
      return;
    }

    try {
      setDocSaving(true);
      setDocError("");

      const res = await authRequest.post(
        `/api/v1/shipments/${shipmentId}/documents`,
        {
          name: newDocName.trim(),
          fileUrl: newDocUrl.trim(),
        }
      );

      const docs = res.data?.data || [];

      setShipment((prev) => ({ ...(prev || {}), documents: docs }));
      setNewDocName("");
      setNewDocUrl("");
    } catch (error) {
      console.error("❌ Error adding document:", error.response?.data || error);
      setDocError(
        error.response?.data?.message ||
          "Failed to add document to this shipment."
      );
    } finally {
      setDocSaving(false);
    }
  };

  const isSea = form.serviceType === "sea_freight";
  const isDocs = form.mode === "air_docs";
  const isRoRo = form.mode === "roro" || form.cargoType === "vehicle";
  const isContainerMode =
    form.mode === "fcl" ||
    form.mode === "lcl" ||
    form.cargoType === "container" ||
    form.cargoType === "lcl";

  if (loading) {
    return (
      <div className="bg-[#D9D9D9] p-3 sm:p-5 lg:m-[30px] lg:p-[20px] rounded-md">
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
      <div className="bg-[#D9D9D9] p-3 sm:p-5 lg:m-[30px] lg:p-[20px] rounded-md">
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
    <div className="bg-[#D9D9D9] rounded-md p-3 sm:p-5 lg:m-[30px] lg:p-[20px] space-y-4 font-montserrat">
      {/* Top bar (mobile-first stack) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <button
            onClick={handleBack}
            className="shrink-0 inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md bg-[#1A2930] text-white hover:bg-[#FFA500] transition"
          >
            ← Back
          </button>

          <div>
            <h1 className="text-[18px] sm:text-[20px] font-semibold text-[#1A2930]">
              Admin booking – Shipment
            </h1>
            <p className="text-xs text-gray-600 mt-1 font-mono">
              {form.referenceNo}
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px]">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#1A2930] text-white">
                {formatServiceLabelShort(form.serviceType)}
              </span>

              {form.mode ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#FFA500]/15 text-[#1A2930] border border-[#FFA500]/40">
                  {formatModeBadge(form.mode)}
                </span>
              ) : null}

              {form.repackingRequired ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Repacking requested
                </span>
              ) : null}

              {isDocs ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Secure documents
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:items-end gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold w-fit ${getStatusClasses(
              form.status
            )}`}
          >
            {formatStatusLabel(form.status)}
          </span>

          <div className="text-[11px] text-gray-500 sm:text-right">
            {shipment.createdAt ? (
              <p>
                Created: {new Date(shipment.createdAt).toLocaleString("en-GB")}
              </p>
            ) : null}
            {shipment.updatedAt ? (
              <p>
                Updated: {new Date(shipment.updatedAt).toLocaleString("en-GB")}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {errorMsg ? (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-md">
          {errorMsg}
        </p>
      ) : null}

      {/* Desktop layout: 2 columns | Mobile: accordions */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 xl:grid-cols-[1.1fr_1.1fr] gap-4 xl:gap-6 items-start"
      >
        {/* LEFT column */}
        <div className="space-y-4">
          {/* Mobile accordion: Service/Route/Status */}
          <div className="xl:hidden">
            <Section
              title="Service, route & status"
              subtitle="Service type, mode, status, payment, ports and dates."
              open={openService}
              onToggle={() => setOpenService((v) => !v)}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="Service type">
                  <Select
                    value={form.serviceType}
                    onChange={handleChange("serviceType")}
                  >
                    {SERVICE_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Product / mode">
                  <Select value={form.mode} onChange={handleChange("mode")}>
                    {currentModeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Status">
                  <Select value={form.status} onChange={handleChange("status")}>
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {formatStatusLabel(st)}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <Field
                  label="Payment status"
                  hint="Controls how this order appears in the Orders view."
                >
                  <Select
                    value={form.paymentStatus}
                    onChange={handleChange("paymentStatus")}
                  >
                    {PAYMENT_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field
                  label="Cargo type (internal)"
                  hint="Vehicle / container / LCL – used for internal reporting."
                >
                  <Select
                    value={form.cargoType}
                    onChange={handleChange("cargoType")}
                  >
                    <option value="">Select…</option>
                    {CARGO_TYPE_OPTIONS.map((ct) => (
                      <option key={ct} value={ct}>
                        {ct.charAt(0).toUpperCase() + ct.slice(1)}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <Field
                  label={isSea ? "Origin port" : "Origin airport / location"}
                >
                  <Input
                    type="text"
                    value={form.originPort}
                    onChange={handleChange("originPort")}
                    placeholder={isSea ? "Southampton" : "Heathrow (LHR)"}
                  />
                </Field>
                <Field
                  label={
                    isSea ? "Destination port" : "Destination airport / city"
                  }
                >
                  <Input
                    type="text"
                    value={form.destinationPort}
                    onChange={handleChange("destinationPort")}
                    placeholder={isSea ? "Tema" : "Accra (ACC)"}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <Field
                  label={`ETD (${isSea ? "sailing date" : "departure date"})`}
                >
                  <Input
                    type="date"
                    value={form.shippingDate}
                    onChange={handleChange("shippingDate")}
                  />
                </Field>
                <Field label="ETA (arrival)">
                  <Input
                    type="date"
                    value={form.eta}
                    onChange={handleChange("eta")}
                  />
                </Field>
              </div>
            </Section>
          </div>

          {/* Desktop cards (left) */}
          <div className="hidden xl:block space-y-4">
            <Card title="Service, route & status">
              <div className="grid grid-cols-3 gap-4">
                <Field label="Service type">
                  <Select
                    value={form.serviceType}
                    onChange={handleChange("serviceType")}
                  >
                    {SERVICE_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Product / mode">
                  <Select value={form.mode} onChange={handleChange("mode")}>
                    {currentModeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Status">
                  <Select value={form.status} onChange={handleChange("status")}>
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {formatStatusLabel(st)}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-2">
                <Field label="Payment status" hint="Controls Orders view.">
                  <Select
                    value={form.paymentStatus}
                    onChange={handleChange("paymentStatus")}
                  >
                    {PAYMENT_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Cargo type (internal)" hint="Reporting helper.">
                  <Select
                    value={form.cargoType}
                    onChange={handleChange("cargoType")}
                  >
                    <option value="">Select…</option>
                    {CARGO_TYPE_OPTIONS.map((ct) => (
                      <option key={ct} value={ct}>
                        {ct.charAt(0).toUpperCase() + ct.slice(1)}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-3">
                <Field
                  label={isSea ? "Origin port" : "Origin airport / location"}
                >
                  <Input
                    value={form.originPort}
                    onChange={handleChange("originPort")}
                    placeholder={isSea ? "Southampton" : "Heathrow (LHR)"}
                  />
                </Field>
                <Field
                  label={
                    isSea ? "Destination port" : "Destination airport / city"
                  }
                >
                  <Input
                    value={form.destinationPort}
                    onChange={handleChange("destinationPort")}
                    placeholder={isSea ? "Tema" : "Accra (ACC)"}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <Field
                  label={`ETD (${isSea ? "sailing date" : "departure date"})`}
                >
                  <Input
                    type="date"
                    value={form.shippingDate}
                    onChange={handleChange("shippingDate")}
                  />
                </Field>
                <Field label="ETA (arrival)">
                  <Input
                    type="date"
                    value={form.eta}
                    onChange={handleChange("eta")}
                  />
                </Field>
              </div>
            </Card>
          </div>

          {/* Vessel / Flight */}
          <div className="xl:hidden">
            <Section
              title={
                isSea ? "Vessel (optional)" : "Airline / flight (optional)"
              }
              subtitle="Carrier and reference numbers."
              open={openVessel}
              onToggle={() => setOpenVessel((v) => !v)}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label={isSea ? "Vessel name" : "Airline / carrier"}>
                  <Input
                    value={form.vesselName}
                    onChange={handleChange("vesselName")}
                    placeholder={isSea ? "MV Great Africa" : "British Airways"}
                  />
                </Field>
                <Field
                  label={isSea ? "Voyage / rotation" : "Flight no. / MAWB"}
                >
                  <Input
                    value={form.vesselVoyage}
                    onChange={handleChange("vesselVoyage")}
                    placeholder={isSea ? "GA123W" : "BA081 / 125-1234 5678"}
                  />
                </Field>
              </div>
            </Section>
          </div>

          <div className="hidden xl:block">
            <Card
              title={
                isSea ? "Vessel (optional)" : "Airline / flight (optional)"
              }
            >
              <div className="grid grid-cols-2 gap-4">
                <Field label={isSea ? "Vessel name" : "Airline / carrier"}>
                  <Input
                    value={form.vesselName}
                    onChange={handleChange("vesselName")}
                    placeholder={isSea ? "MV Great Africa" : "British Airways"}
                  />
                </Field>
                <Field
                  label={isSea ? "Voyage / rotation" : "Flight no. / MAWB"}
                >
                  <Input
                    value={form.vesselVoyage}
                    onChange={handleChange("vesselVoyage")}
                    placeholder={isSea ? "GA123W" : "BA081 / 125-1234 5678"}
                  />
                </Field>
              </div>
            </Card>
          </div>

          {/* Value-added services */}
          <div className="xl:hidden">
            <Section
              title="Value-added services"
              subtitle="Repacking and consolidation needs."
              open={openServices}
              onToggle={() => setOpenServices((v) => !v)}
            >
              <div className="flex items-start gap-2">
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
                    For loose items, pallets or secure documents needing
                    re-boxing, tamper-proof packaging or consolidation.
                  </p>
                </div>
              </div>

              {form.repackingRequired ? (
                <div className="mt-3">
                  <Textarea
                    value={form.repackingNotes}
                    onChange={handleChange("repackingNotes")}
                    className="h-[90px]"
                    placeholder="E.g. Repack certificates into tamper-proof envelopes; add bubble wrap; label as 'Secure documents – handle with care'."
                  />
                </div>
              ) : null}
            </Section>
          </div>

          <div className="hidden xl:block">
            <Card title="Value-added services">
              <div className="flex items-start gap-2">
                <input
                  id="repackingRequiredDesk"
                  type="checkbox"
                  checked={form.repackingRequired}
                  onChange={handleChange("repackingRequired")}
                  className="mt-1 h-4 w-4 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <label
                    htmlFor="repackingRequiredDesk"
                    className="text-xs font-medium text-gray-700"
                  >
                    Repacking / consolidation required
                  </label>
                  <p className="text-[10px] text-gray-500">
                    For loose items, pallets or secure documents needing
                    re-boxing, tamper-proof packaging or consolidation.
                  </p>
                </div>
              </div>

              {form.repackingRequired ? (
                <div className="mt-3">
                  <Textarea
                    value={form.repackingNotes}
                    onChange={handleChange("repackingNotes")}
                    className="h-[80px]"
                    placeholder="E.g. Repack certificates into tamper-proof envelopes; add bubble wrap; label as 'Secure documents – handle with care'."
                  />
                </div>
              ) : null}
            </Card>
          </div>
        </div>

        {/* RIGHT column */}
        <div className="space-y-4">
          {/* Parties (mobile accordion) */}
          <div className="xl:hidden">
            <Section
              title="Parties"
              subtitle="Shipper, consignee and optional notify party."
              open={openParties}
              onToggle={() => setOpenParties((v) => !v)}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-700">Shipper</p>
                  <Input
                    value={form.shipperName}
                    onChange={handleChange("shipperName")}
                    placeholder="Shipper name"
                  />
                  <Input
                    value={form.shipperAddress}
                    onChange={handleChange("shipperAddress")}
                    placeholder="Address"
                  />
                  <Input
                    type="email"
                    value={form.shipperEmail}
                    onChange={handleChange("shipperEmail")}
                    placeholder="Email"
                  />
                  <Input
                    value={form.shipperPhone}
                    onChange={handleChange("shipperPhone")}
                    placeholder="Phone"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-700">
                    Consignee
                  </p>
                  <Input
                    value={form.consigneeName}
                    onChange={handleChange("consigneeName")}
                    placeholder="Consignee name"
                  />
                  <Input
                    value={form.consigneeAddress}
                    onChange={handleChange("consigneeAddress")}
                    placeholder="Address"
                  />
                  <Input
                    type="email"
                    value={form.consigneeEmail}
                    onChange={handleChange("consigneeEmail")}
                    placeholder="Email"
                  />
                  <Input
                    value={form.consigneePhone}
                    onChange={handleChange("consigneePhone")}
                    placeholder="Phone"
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold text-gray-700">
                  Notify party (optional)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Input
                      value={form.notifyName}
                      onChange={handleChange("notifyName")}
                      placeholder="Notify name"
                    />
                    <Input
                      value={form.notifyAddress}
                      onChange={handleChange("notifyAddress")}
                      placeholder="Address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="email"
                      value={form.notifyEmail}
                      onChange={handleChange("notifyEmail")}
                      placeholder="Email"
                    />
                    <Input
                      value={form.notifyPhone}
                      onChange={handleChange("notifyPhone")}
                      placeholder="Phone"
                    />
                  </div>
                </div>
              </div>
            </Section>
          </div>

          {/* Parties (desktop card) */}
          <div className="hidden xl:block">
            <Card title="Parties">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-700">Shipper</p>
                  <Input
                    value={form.shipperName}
                    onChange={handleChange("shipperName")}
                    placeholder="Shipper name"
                  />
                  <Input
                    value={form.shipperAddress}
                    onChange={handleChange("shipperAddress")}
                    placeholder="Address"
                  />
                  <Input
                    type="email"
                    value={form.shipperEmail}
                    onChange={handleChange("shipperEmail")}
                    placeholder="Email"
                  />
                  <Input
                    value={form.shipperPhone}
                    onChange={handleChange("shipperPhone")}
                    placeholder="Phone"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-700">
                    Consignee
                  </p>
                  <Input
                    value={form.consigneeName}
                    onChange={handleChange("consigneeName")}
                    placeholder="Consignee name"
                  />
                  <Input
                    value={form.consigneeAddress}
                    onChange={handleChange("consigneeAddress")}
                    placeholder="Address"
                  />
                  <Input
                    type="email"
                    value={form.consigneeEmail}
                    onChange={handleChange("consigneeEmail")}
                    placeholder="Email"
                  />
                  <Input
                    value={form.consigneePhone}
                    onChange={handleChange("consigneePhone")}
                    placeholder="Phone"
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold text-gray-700">
                  Notify party (optional)
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Input
                      value={form.notifyName}
                      onChange={handleChange("notifyName")}
                      placeholder="Notify name"
                    />
                    <Input
                      value={form.notifyAddress}
                      onChange={handleChange("notifyAddress")}
                      placeholder="Address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="email"
                      value={form.notifyEmail}
                      onChange={handleChange("notifyEmail")}
                      placeholder="Email"
                    />
                    <Input
                      value={form.notifyPhone}
                      onChange={handleChange("notifyPhone")}
                      placeholder="Phone"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Cargo (mobile accordion) */}
          <div className="xl:hidden">
            <Section
              title="Cargo details"
              subtitle="Description, weight and mode-specific details."
              open={openCargo}
              onToggle={() => setOpenCargo((v) => !v)}
            >
              <Field label="Description">
                <Textarea
                  value={form.cargoDescription}
                  onChange={handleChange("cargoDescription")}
                  className="h-[90px]"
                  placeholder={
                    isDocs
                      ? "Secure academic certificates and transcripts; tamper-proof envelopes."
                      : "Used Nissan Qashqai 1.6 petrol, 5-door, metallic grey…"
                  }
                />
              </Field>

              <div className="mt-3">
                <Field label={isDocs ? "Chargeable weight" : "Weight"}>
                  <Input
                    type="text"
                    value={form.cargoWeight}
                    onChange={handleChange("cargoWeight")}
                    placeholder={isDocs ? "e.g. 5 kg (chargeable)" : "1450 kg"}
                  />
                </Field>
              </div>

              {isRoRo ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-700">
                      Vehicle (RoRo)
                    </p>
                    <Input
                      value={form.vehicleMake}
                      onChange={handleChange("vehicleMake")}
                      placeholder="Make"
                    />
                    <Input
                      value={form.vehicleModel}
                      onChange={handleChange("vehicleModel")}
                      placeholder="Model"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      value={form.vehicleYear}
                      onChange={handleChange("vehicleYear")}
                      placeholder="Year"
                    />
                    <Input
                      value={form.vehicleVin}
                      onChange={handleChange("vehicleVin")}
                      placeholder="VIN / chassis no."
                      className="font-mono"
                    />
                  </div>
                </div>
              ) : null}

              {isContainerMode ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-700">
                      Container
                    </p>
                    <Input
                      value={form.containerNo}
                      onChange={handleChange("containerNo")}
                      placeholder={
                        form.mode === "lcl"
                          ? "Groupage container ref (if known)"
                          : "Container no."
                      }
                    />
                    <Input
                      value={form.containerSize}
                      onChange={handleChange("containerSize")}
                      placeholder={
                        form.mode === "lcl"
                          ? "CBM / pallet count"
                          : "Size (20ft / 40ft / 40HC)"
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      value={form.containerSealNo}
                      onChange={handleChange("containerSealNo")}
                      placeholder={
                        form.mode === "lcl" ? "Internal ref / seal" : "Seal no."
                      }
                    />
                  </div>
                </div>
              ) : null}
            </Section>
          </div>

          {/* Cargo (desktop card) */}
          <div className="hidden xl:block">
            <Card title="Cargo details">
              <Field label="Description">
                <Textarea
                  value={form.cargoDescription}
                  onChange={handleChange("cargoDescription")}
                  className="h-[80px]"
                  placeholder={
                    isDocs
                      ? "Secure academic certificates and transcripts; tamper-proof envelopes."
                      : "Used Nissan Qashqai 1.6 petrol, 5-door, metallic grey…"
                  }
                />
              </Field>

              <div className="mt-3">
                <Field label={isDocs ? "Chargeable weight" : "Weight"}>
                  <Input
                    type="text"
                    value={form.cargoWeight}
                    onChange={handleChange("cargoWeight")}
                    placeholder={isDocs ? "e.g. 5 kg (chargeable)" : "1450 kg"}
                  />
                </Field>
              </div>

              {isRoRo ? (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-700">
                      Vehicle (RoRo)
                    </p>
                    <Input
                      value={form.vehicleMake}
                      onChange={handleChange("vehicleMake")}
                      placeholder="Make"
                    />
                    <Input
                      value={form.vehicleModel}
                      onChange={handleChange("vehicleModel")}
                      placeholder="Model"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      value={form.vehicleYear}
                      onChange={handleChange("vehicleYear")}
                      placeholder="Year"
                    />
                    <Input
                      value={form.vehicleVin}
                      onChange={handleChange("vehicleVin")}
                      placeholder="VIN / chassis no."
                      className="font-mono"
                    />
                  </div>
                </div>
              ) : null}

              {isContainerMode ? (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-700">
                      Container
                    </p>
                    <Input
                      value={form.containerNo}
                      onChange={handleChange("containerNo")}
                      placeholder={
                        form.mode === "lcl"
                          ? "Groupage container ref (if known)"
                          : "Container no."
                      }
                    />
                    <Input
                      value={form.containerSize}
                      onChange={handleChange("containerSize")}
                      placeholder={
                        form.mode === "lcl"
                          ? "CBM / pallet count"
                          : "Size (20ft / 40ft / 40HC)"
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      value={form.containerSealNo}
                      onChange={handleChange("containerSealNo")}
                      placeholder={
                        form.mode === "lcl" ? "Internal ref / seal" : "Seal no."
                      }
                    />
                  </div>
                </div>
              ) : null}
            </Card>
          </div>

          {/* Documents (mobile accordion) */}
          <div className="xl:hidden">
            <Section
              title="Documents"
              subtitle="View and attach shipment documents."
              open={openDocs}
              onToggle={() => setOpenDocs((v) => !v)}
            >
              {docError ? (
                <p className="text-[11px] text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-md">
                  {docError}
                </p>
              ) : null}

              <div className="space-y-2">
                {(shipment.documents || []).length === 0 ? (
                  <p className="text-xs text-gray-500">
                    No documents uploaded yet for this shipment.
                  </p>
                ) : (
                  <ul className="space-y-1 text-xs">
                    {(shipment.documents || []).map((doc, idx) => (
                      <li
                        key={doc.fileUrl || idx}
                        className="flex items-center justify-between border border-gray-100 rounded-md px-3 py-2"
                      >
                        <div className="flex flex-col">
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[13px] font-medium text-[#1A2930] hover:text-[#FFA500]"
                          >
                            {doc.name}
                          </a>
                          <span className="text-[10px] text-gray-500">
                            Uploaded{" "}
                            {doc.uploadedAt
                              ? new Date(doc.uploadedAt).toLocaleDateString(
                                  "en-GB"
                                )
                              : ""}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-3 border-t border-gray-100 pt-3 space-y-2">
                <p className="text-[11px] font-semibold text-gray-700">
                  Attach new document
                </p>
                <Input
                  type="text"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="text-xs py-1.5"
                  placeholder="Document name (e.g. Invoice, Draft BL, Packing list)"
                />
                <Input
                  type="url"
                  value={newDocUrl}
                  onChange={(e) => setNewDocUrl(e.target.value)}
                  className="text-xs py-1.5"
                  placeholder="Public file URL (e.g. S3, Cloudinary, SharePoint link)"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddDocument}
                    disabled={docSaving}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md bg-[#1A2930] text-white hover:bg-[#FFA500] hover:text-black transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {docSaving ? "Saving…" : "Add document"}
                  </button>
                </div>
              </div>
            </Section>
          </div>

          {/* Documents (desktop card) */}
          <div className="hidden xl:block">
            <Card title="Documents">
              {docError ? (
                <p className="text-[11px] text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-md">
                  {docError}
                </p>
              ) : null}

              <div className="space-y-2">
                {(shipment.documents || []).length === 0 ? (
                  <p className="text-xs text-gray-500">
                    No documents uploaded yet for this shipment.
                  </p>
                ) : (
                  <ul className="space-y-1 text-xs">
                    {(shipment.documents || []).map((doc, idx) => (
                      <li
                        key={doc.fileUrl || idx}
                        className="flex items-center justify-between border border-gray-100 rounded-md px-3 py-2"
                      >
                        <div className="flex flex-col">
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[13px] font-medium text-[#1A2930] hover:text-[#FFA500]"
                          >
                            {doc.name}
                          </a>
                          <span className="text-[10px] text-gray-500">
                            Uploaded{" "}
                            {doc.uploadedAt
                              ? new Date(doc.uploadedAt).toLocaleDateString(
                                  "en-GB"
                                )
                              : ""}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-3 border-t border-gray-100 pt-3 space-y-2">
                <p className="text-[11px] font-semibold text-gray-700">
                  Attach new document
                </p>
                <Input
                  type="text"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  className="text-xs py-1.5"
                  placeholder="Document name (e.g. Invoice, Draft BL, Packing list)"
                />
                <Input
                  type="url"
                  value={newDocUrl}
                  onChange={(e) => setNewDocUrl(e.target.value)}
                  className="text-xs py-1.5"
                  placeholder="Public file URL (e.g. S3, Cloudinary, SharePoint link)"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddDocument}
                    disabled={docSaving}
                    className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md bg-[#1A2930] text-white hover:bg-[#FFA500] hover:text-black transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {docSaving ? "Saving…" : "Add document"}
                  </button>
                </div>
              </div>
            </Card>
          </div>

          {/* Desktop save button */}
          <div className="hidden xl:flex justify-end">
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

        {/* Mobile sticky CTA */}
        <div className="xl:hidden sticky bottom-0 left-0 right-0 pb-3 mt-2">
          <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-md p-3 shadow-lg flex items-center justify-between gap-3">
            <div className="text-[11px] text-gray-600">
              <p className="font-semibold text-[#1A2930]">Ready to save?</p>
              <p>Updates status, payment, route, parties, cargo & docs.</p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="
                shrink-0
                bg-[#1A2930] text-white
                px-4 py-2 rounded-md
                hover:bg-[#FFA500] hover:text-black
                font-semibold text-sm transition
                disabled:opacity-60 disabled:cursor-not-allowed
              "
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Shipment;
