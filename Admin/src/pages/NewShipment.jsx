import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authRequest } from "../requestMethods";

const SERVICE_TYPE_OPTIONS = [
  { value: "sea_freight", label: "Sea freight" },
  { value: "air_freight", label: "Air freight" },
];

const MODE_OPTIONS = {
  sea_freight: [
    { value: "roro", label: "RoRo – vehicle" },
    { value: "fcl", label: "FCL – full container" },
    { value: "lcl", label: "LCL – shared / LCL" },
  ],
  air_freight: [
    { value: "air_general", label: "Air – general cargo" },
    { value: "air_docs", label: "Air – secure documents" },
  ],
};

// Use a real customer ObjectId from Mongo (Jake Boateng in this case)
const HOUSE_CUSTOMER_ID = "68caa1eb3f0ac9795dc43238";

const NewShipment = () => {
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    // What are we creating?
    recordType: "quote", // "quote" | "shipment" (frontend concept only)

    // Service / product
    serviceType: "sea_freight",
    mode: "roro",

    // Route
    origin: "",
    destination: "",

    // Parties
    shipperName: "",
    shipperEmail: "",
    shipperAddress: "",
    consigneeName: "",
    consigneeEmail: "",
    consigneeAddress: "",

    // Cargo / commercial
    weight: "",
    estimatedCost: "",
    readyDate: "",
    notes: "",
  });

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => {
      // If service type changes, default to first mode of that service
      if (field === "serviceType") {
        const firstMode = MODE_OPTIONS[value]?.[0]?.value || "";
        return { ...prev, serviceType: value, mode: firstMode };
      }
      return { ...prev, [field]: value };
    });
  };

  const currentModeOptions = MODE_OPTIONS[form.serviceType] || [];

  // Map UI mode → backend Shipment.mode enum
  const mapModeToBackend = () => {
    switch (form.mode) {
      case "roro":
        return "RoRo"; // ✅ matches Shipment.mode enum
      case "fcl":
        return "Container";
      case "lcl":
        return "LCL";
      case "air_general":
        return "Air";
      case "air_docs":
        return "Documents";
      default:
        return "Container";
    }
  };

  // Generate Ellcworth reference
  const generateReferenceNo = () => {
    const ts = Date.now().toString().slice(-6);
    const refPrefix = form.serviceType === "sea_freight" ? "SEA" : "AIR";
    return `ELL-${refPrefix}-${ts}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      setSaving(true);
      const isQuote = form.recordType === "quote";

      const referenceNo = generateReferenceNo();
      const backendMode = mapModeToBackend();

      // Ensure weight is sent as a string to satisfy validator
      const weightStr =
        form.weight !== "" && form.weight !== null
          ? String(form.weight)
          : undefined;

      // Convert estimated cost to number for cargoValue.amount if provided
      const estimatedCostNum = form.estimatedCost
        ? parseFloat(form.estimatedCost)
        : undefined;

      // shippingDate: send as ISO-ish string (YYYY-MM-DD)
      const shippingDateValue = form.readyDate || undefined;

      const payload = {
        // Core identity
        customer: HOUSE_CUSTOMER_ID,
        referenceNo, // backend will normalise prefix

        // New model fields – defaults for now
        shipmentType: "export", // "export" | "import" | "cross_trade"
        serviceLevel: "port_to_port", // "door_to_port" | "port_to_port" | ...

        mode: backendMode,
        status: isQuote ? "pending" : "booked",

        // Parties
        shipper: {
          name: form.shipperName,
          email: form.shipperEmail,
          address: form.shipperAddress?.trim() || "Address to be confirmed",
          phone: "", // can extend later
        },
        consignee: {
          name: form.consigneeName,
          email: form.consigneeEmail,
          address: form.consigneeAddress?.trim() || "Address to be confirmed",
          phone: "",
        },

        // Route (ports)
        ports: {
          originPort: form.origin,
          destinationPort: form.destination,
        },

        // Cargo
        cargo: {
          description: form.notes || "", // for now, reuse notes
          weight: weightStr,
        },

        // Commercials – align with cargoValue in model
        ...(estimatedCostNum && estimatedCostNum > 0
          ? {
              cargoValue: {
                amount: estimatedCostNum,
                currency: "GBP",
              },
            }
          : {}),

        // Notes
        internalNotes: form.notes || "",

        // Dates
        shippingDate: shippingDateValue, // "YYYY-MM-DD" from input is valid ISO8601
      };

      const res = await authRequest.post("/api/v1/shipments", payload);
      const created = res.data?.data || res.data?.shipment || res.data;

      // To avoid "No routes matched /shipments/:id" until details route is ready
      if (created && created._id) {
        // If you later add <Route path="/shipments/:id" ... />,
        // you can switch this back:
        // navigate(`/shipments/${created._id}`);
        navigate("/shipments");
      } else {
        navigate("/shipments");
      }
    } catch (error) {
      console.error(
        "❌ Error creating shipment:",
        error.response?.data || error
      );

      if (error.response?.status === 422) {
        // Validation error from handleValidation
        const details = error.response.data?.errors || [];
        const first = details[0];
        const msg =
          first?.message ||
          error.response.data?.message ||
          "Please check the form and try again.";
        setErrorMsg(msg);
      } else {
        setErrorMsg(
          error.response?.data?.message ||
            "We couldn’t create this shipment. Please try again."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="m-[30px] bg-white p-[30px] rounded-md shadow-md font-montserrat">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-[24px]">
        <div>
          <h2 className="text-[22px] font-semibold text-[#1A2930]">
            New Shipment / Quote
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Capture the enquiry, choose Quote or Shipment, and complete details
            on the next screen.
          </p>
        </div>

        {/* Record type toggle */}
        <div className="inline-flex rounded-full bg-[#F3F4F6] p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, recordType: "quote" }))}
            className={`px-4 py-1.5 rounded-full transition ${
              form.recordType === "quote"
                ? "bg-[#FFA500] text-[#1A2930]"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Quote
          </button>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, recordType: "shipment" }))}
            className={`px-4 py-1.5 rounded-full transition ${
              form.recordType === "shipment"
                ? "bg-[#1A2930] text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Shipment
          </button>
        </div>
      </div>

      {errorMsg && (
        <p className="mb-4 text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-md">
          {errorMsg}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-[32px] lg:flex-row lg:items-start"
      >
        {/* LEFT COLUMN – Service & Route */}
        <div className="flex-1 space-y-5">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 mb-3">
              Service & route
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  Ready date
                </label>
                <input
                  type="date"
                  value={form.readyDate}
                  onChange={handleChange("readyDate")}
                  className="border border-gray-300 rounded px-3 py-2 text-sm bg-white"
                />
                <p className="text-[10px] text-gray-500 mt-0.5">
                  When cargo / documents will be ready.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-700">
                  Origin
                </label>
                <input
                  type="text"
                  value={form.origin}
                  onChange={handleChange("origin")}
                  className="border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder={
                    form.serviceType === "sea_freight"
                      ? "Southampton, UK"
                      : "Heathrow (LHR)"
                  }
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-700">
                  Destination
                </label>
                <input
                  type="text"
                  value={form.destination}
                  onChange={handleChange("destination")}
                  className="border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder={
                    form.serviceType === "sea_freight"
                      ? "Tema, Ghana"
                      : "Accra (ACC)"
                  }
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 mb-3">
              Cargo / quote info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-700">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={form.weight}
                  onChange={handleChange("weight")}
                  className="border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder="e.g. 2000"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-700">
                  Est. cost (£)
                </label>
                <input
                  type="number"
                  value={form.estimatedCost}
                  onChange={handleChange("estimatedCost")}
                  className="border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder="e.g. 950"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-700">
                  Internal notes
                </label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={handleChange("notes")}
                  className="border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder="Perishable, secure docs, etc."
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN – Parties & Submit */}
        <div className="w-full max-w-[360px] space-y-5">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 mb-3">
              Parties
            </h3>

            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-700">
                  Shipper name
                </label>
                <input
                  type="text"
                  value={form.shipperName}
                  onChange={handleChange("shipperName")}
                  className="border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder="Shipper / client name"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-700">
                  Shipper email
                </label>
                <input
                  type="email"
                  value={form.shipperEmail}
                  onChange={handleChange("shipperEmail")}
                  className="border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder="client@example.com"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-700">
                  Shipper address
                </label>
                <input
                  type="text"
                  value={form.shipperAddress}
                  onChange={handleChange("shipperAddress")}
                  className="border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder="32 Ashbourne Road, Romford"
                />
              </div>

              <div className="h-px bg-gray-200 my-2" />

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-700">
                  Consignee name
                </label>
                <input
                  type="text"
                  value={form.consigneeName}
                  onChange={handleChange("consigneeName")}
                  className="border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder="Consignee at destination"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-700">
                  Consignee email
                </label>
                <input
                  type="email"
                  value={form.consigneeEmail}
                  onChange={handleChange("consigneeEmail")}
                  className="border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder="consignee@example.com"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-700">
                  Consignee address
                </label>
                <input
                  type="text"
                  value={form.consigneeAddress}
                  onChange={handleChange("consigneeAddress")}
                  className="border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder="Address at destination"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="
                w-full 
                bg-[#1A2930] text-white 
                py-3 rounded-md 
                font-semibold text-sm 
                hover:bg-[#FFA500] hover:text-[#1A2930]
                transition
                disabled:opacity-60 disabled:cursor-not-allowed
              "
            >
              {saving
                ? "Creating..."
                : form.recordType === "quote"
                ? "Create quote & open booking"
                : "Create shipment & open booking"}
            </button>
            <p className="mt-2 text-[10px] text-gray-500">
              We’ll create a basic record and take you to the full booking
              screen to add vessel, routing, documents and charges.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewShipment;
