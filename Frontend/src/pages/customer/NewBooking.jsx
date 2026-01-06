import { useMemo, useState } from "react";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaShip,
  FaTruck,
  FaPlaneDeparture,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { customerAuthRequest } from "@/requestMethods";

const CREATE_SHIPMENT_PATH = "/shipments";

/**
 * Backend validator requires mode to be one of:
 * "RoRo", "Container", "Air", "LCL", "Documents", "Pallets", "Parcels"
 *
 * We keep UI minimal but corporate-realistic.
 */
const modes = [
  { value: "RoRo", label: "RoRo vehicle shipment", icon: <FaTruck /> },
  { value: "Container", label: "Containerised sea freight", icon: <FaShip /> },
  { value: "Air", label: "Air freight shipment", icon: <FaPlaneDeparture /> },
  {
    value: "Documents",
    label: "Secure document shipment",
    icon: <FaCheckCircle />,
  },
];

const containerTypes = [
  { value: "", label: "Select (optional)" },
  { value: "FCL 20ft", label: "FCL 20ft" },
  { value: "FCL 40ft", label: "FCL 40ft" },
  { value: "LCL", label: "LCL / loose cargo" },
];

const airTypes = [
  { value: "", label: "Select (optional)" },
  { value: "docs", label: "Documents" },
  { value: "parcels", label: "Parcels / small packages" },
  { value: "freight", label: "Larger freight" },
];

function pickCreatedShipment(body) {
  if (body?.shipment && typeof body.shipment === "object") return body.shipment;
  if (body?.data && typeof body.data === "object") return body.data;
  if (body && typeof body === "object") return body;
  return null;
}

function normalizeValidationErrors(err) {
  const data = err?.response?.data;
  const list = Array.isArray(data?.errors) ? data.errors : [];
  return list
    .map((e) => ({
      field: String(e?.field || "").trim(),
      message: String(e?.message || "").trim(),
    }))
    .filter((x) => x.field || x.message);
}

function toIsoDateOrEmpty(raw) {
  const s = String(raw || "").trim();
  if (!s) return "";
  // input type="date" gives YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return `${s}T00:00:00.000Z`;
  return s;
}

export default function NewBooking() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    mode: "RoRo",

    shipperName: "",
    shipperAddress: "",
    shipperEmail: "",

    consigneeName: "",
    consigneeAddress: "",

    originPort: "",
    destinationPort: "",

    // ✅ Quote-critical (always)
    cargoSummary: "",
    cargoWeightKg: "",
    readyDate: "",

    // ✅ Mode-specific
    // RoRo
    roroVehicleMakeModel: "",
    roroVehicleYear: "",
    roroRunning: "runner", // runner | non_runner

    // Container
    containerType: "",

    // Air
    airType: "",
    airDimensions: "",
    airDeadline: "",

    notes: "",
  });

  const [status, setStatus] = useState({
    loading: false,
    error: "",
    success: "",
    fieldErrors: [],
  });

  const canSubmit = useMemo(() => {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      String(form.shipperEmail || "").trim()
    );

    return Boolean(
      form.mode &&
        form.shipperName.trim() &&
        form.shipperAddress.trim() &&
        emailOk &&
        form.consigneeName.trim() &&
        form.consigneeAddress.trim() &&
        form.originPort.trim() &&
        form.destinationPort.trim() &&
        form.cargoSummary.trim()
    );
  }, [form]);

  const onChange = (key) => (e) => {
    const value = e.target.value;
    setForm((p) => ({ ...p, [key]: value }));
    if (status.error || (status.fieldErrors && status.fieldErrors.length)) {
      setStatus((s) => ({ ...s, error: "", fieldErrors: [] }));
    }
  };

  const onPickMode = (value) => {
    setForm((p) => ({
      ...p,
      mode: value,

      // reset mode-specific bits so the UI doesn't carry confusing data across modes
      roroVehicleMakeModel: "",
      roroVehicleYear: "",
      roroRunning: "runner",

      containerType: "",

      airType: "",
      airDimensions: "",
      airDeadline: "",
    }));

    if (status.error || (status.fieldErrors && status.fieldErrors.length)) {
      setStatus((s) => ({ ...s, error: "", fieldErrors: [] }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || status.loading) return;

    setStatus({ loading: true, error: "", success: "", fieldErrors: [] });

    try {
      const readyIso = toIsoDateOrEmpty(form.readyDate);
      const airDeadlineIso = toIsoDateOrEmpty(form.airDeadline);

      const cargoWeight =
        String(form.cargoWeightKg || "").trim() !== ""
          ? `${String(form.cargoWeightKg).trim()} kg`
          : "";

      const cargoDescriptionParts = [
        `Customer booking request · ${form.mode}`,
        `Cargo: ${form.cargoSummary.trim()}`,
        cargoWeight ? `Weight: ${cargoWeight}` : null,

        // Container
        form.mode === "Container" && form.containerType
          ? `Container: ${form.containerType}`
          : null,

        // RoRo
        form.mode === "RoRo" && form.roroVehicleMakeModel.trim()
          ? `Vehicle: ${form.roroVehicleMakeModel.trim()}`
          : null,
        form.mode === "RoRo" && form.roroVehicleYear.trim()
          ? `Year: ${form.roroVehicleYear.trim()}`
          : null,
        form.mode === "RoRo"
          ? `Condition: ${
              form.roroRunning === "runner" ? "Runs & drives" : "Non-runner"
            }`
          : null,

        // Air
        form.mode === "Air" && form.airType
          ? `Air type: ${form.airType}`
          : null,
        form.mode === "Air" && form.airDimensions.trim()
          ? `Dims: ${form.airDimensions.trim()}`
          : null,
        form.mode === "Air" && airDeadlineIso
          ? `Latest delivery: ${String(form.airDeadline || "").trim()}`
          : null,

        form.notes.trim() ? `Notes: ${form.notes.trim()}` : null,
      ].filter(Boolean);

      const payload = {
        mode: form.mode,

        shipper: {
          name: form.shipperName.trim(),
          address: form.shipperAddress.trim(),
          email: form.shipperEmail.trim().toLowerCase(),
        },

        consignee: {
          name: form.consigneeName.trim(),
          address: form.consigneeAddress.trim(),
        },

        ports: {
          originPort: form.originPort.trim(),
          destinationPort: form.destinationPort.trim(),
        },

        cargo: {
          description: cargoDescriptionParts.join(" | "),
          weight: cargoWeight,

          vehicle:
            form.mode === "RoRo"
              ? {
                  make: form.roroVehicleMakeModel.trim(),
                  model: "",
                  year: form.roroVehicleYear.trim(),
                  vin: "",
                  registrationNo: "",
                }
              : {},

          container:
            form.mode === "Container"
              ? {
                  containerType: form.containerType || "",
                }
              : {},

          documentsShipment:
            form.mode === "Documents"
              ? { count: 1, docTypes: ["Documents"], secure: true }
              : {},
        },

        // Optional planning dates:
        shippingDate: readyIso || undefined,

        meta: {
          source: "customer_portal",
          createdAtClient: new Date().toISOString(),
          intake: {
            cargoSummary: form.cargoSummary.trim(),
            cargoWeightKg: String(form.cargoWeightKg || "").trim() || null,
            readyDate: form.readyDate || null,
            notes: form.notes.trim() || "",

            roro:
              form.mode === "RoRo"
                ? {
                    makeModel: form.roroVehicleMakeModel.trim() || "",
                    year: form.roroVehicleYear.trim() || "",
                    running: form.roroRunning,
                  }
                : null,

            container:
              form.mode === "Container"
                ? { containerType: form.containerType || "" }
                : null,

            air:
              form.mode === "Air"
                ? {
                    airType: form.airType || "",
                    dimensions: form.airDimensions.trim() || "",
                    latestDeliveryDate: airDeadlineIso || null,
                  }
                : null,
          },
        },
      };

      const res = await customerAuthRequest.post(CREATE_SHIPMENT_PATH, payload);
      const body = res?.data ?? {};
      const created = pickCreatedShipment(body);

      const id = created?._id || created?.id;

      setStatus({
        loading: false,
        error: "",
        success: "Booking created. Redirecting to shipment details…",
        fieldErrors: [],
      });

      setTimeout(() => {
        if (id) navigate(`/shipmentdetails/${id}`, { replace: true });
        else navigate("/myshipments", { replace: true });
      }, 350);
    } catch (err) {
      const fieldErrors = normalizeValidationErrors(err);

      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "We couldn’t create this booking. Please try again.";

      setStatus({
        loading: false,
        error: msg,
        success: "",
        fieldErrors,
      });

      // eslint-disable-next-line no-console
      console.error("NewBooking create error:", err);
    }
  };

  return (
    <div className="bg-[#1A2930] min-h-[70vh] py-8 text-white">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-6">
          <Link to="/myshipments">
            <button className="inline-flex items-center gap-2 text-xs md:text-sm text-slate-200 hover:text-[#FFA500] transition">
              <FaArrowLeft />
              <span>Back to my shipments</span>
            </button>
          </Link>

          <div className="hidden md:flex items-center text-[11px] uppercase tracking-[0.2em] text-[#9A9EAB]">
            CUSTOMER PORTAL · NEW BOOKING
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xl border border-[#9A9EAB]/40 overflow-hidden text-[#1A2930]">
          <div className="px-6 py-5 border-b border-[#E5E7EB]">
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#9A9EAB]">
              Create a booking
            </p>
            <h1 className="text-lg md:text-xl font-semibold mt-1">
              Start a new shipment request
            </h1>
            <p className="text-sm text-slate-600 mt-2">
              This captures the essentials required for a realistic quote.
              Operations can confirm details and finalise routing after intake.
            </p>
          </div>

          <div className="p-6">
            {status.error ? (
              <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">
                <div className="font-semibold">Couldn’t create booking</div>
                <div className="mt-1">{status.error}</div>

                {status.fieldErrors?.length ? (
                  <ul className="mt-3 text-[12px] list-disc pl-5 space-y-1">
                    {status.fieldErrors.map((e, idx) => (
                      <li key={`${e.field}-${idx}`}>
                        <span className="font-semibold">{e.field}:</span>{" "}
                        {e.message}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}

            {status.success ? (
              <div className="mb-4 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800">
                {status.success}
              </div>
            ) : null}

            <form onSubmit={onSubmit} className="space-y-6">
              {/* Mode */}
              <div>
                <label className="text-sm font-semibold block mb-2">
                  Shipping mode
                </label>
                <div className="grid gap-3 md:grid-cols-2">
                  {modes.map((m) => {
                    const active = form.mode === m.value;
                    return (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => onPickMode(m.value)}
                        className={`
                          rounded-xl border px-4 py-3 text-left transition
                          ${
                            active
                              ? "border-[#FFA500] bg-[#FFA500]/10"
                              : "border-[#E5E7EB] bg-white hover:bg-[#F9FAFB]"
                          }
                        `}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={
                              active ? "text-[#FFA500]" : "text-[#1A2930]"
                            }
                          >
                            {m.icon}
                          </span>
                          <span className="text-sm font-semibold">
                            {m.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quote essentials */}
              <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#9A9EAB] mb-3">
                  Shipment details (quote essentials)
                </p>

                <div>
                  <label className="text-sm font-semibold block mb-2">
                    What are you shipping?{" "}
                    <span className="text-red-600">*</span>
                  </label>
                  <input
                    value={form.cargoSummary}
                    onChange={onChange("cargoSummary")}
                    className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                    placeholder={
                      form.mode === "RoRo"
                        ? "e.g. Toyota RAV4 2018 (personal vehicle)"
                        : form.mode === "Container"
                        ? "e.g. household goods + commercial stock (mixed)"
                        : form.mode === "Air"
                        ? "e.g. 3 cartons of cosmetics / spare parts / samples"
                        : "e.g. certificates / secure print documents"
                    }
                    required
                  />
                  <p className="mt-2 text-[11px] text-slate-500">
                    This is the key detail Operations needs to quote correctly.
                  </p>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold block mb-2">
                      Approx. total weight (kg) (optional)
                    </label>
                    <input
                      value={form.cargoWeightKg}
                      onChange={onChange("cargoWeightKg")}
                      className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                      placeholder="e.g. 75"
                      inputMode="numeric"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold block mb-2">
                      Ready date (optional)
                    </label>
                    <input
                      value={form.readyDate}
                      onChange={onChange("readyDate")}
                      className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                      type="date"
                    />
                  </div>
                </div>

                {/* Mode-specific: RoRo */}
                {form.mode === "RoRo" ? (
                  <div className="mt-4 rounded-lg border border-[#E5E7EB] bg-white p-4">
                    <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#9A9EAB] mb-3">
                      RoRo vehicle details (recommended)
                    </p>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-semibold block mb-2">
                          Make & model
                        </label>
                        <input
                          value={form.roroVehicleMakeModel}
                          onChange={onChange("roroVehicleMakeModel")}
                          className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                          placeholder="e.g. Toyota RAV4"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-semibold block mb-2">
                          Year (optional)
                        </label>
                        <input
                          value={form.roroVehicleYear}
                          onChange={onChange("roroVehicleYear")}
                          className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                          placeholder="e.g. 2018"
                          inputMode="numeric"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="text-sm font-semibold block mb-2">
                        Running condition
                      </label>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="radio"
                            name="roroRunning"
                            value="runner"
                            checked={form.roroRunning === "runner"}
                            onChange={onChange("roroRunning")}
                            className="h-4 w-4 accent-[#FFA500]"
                          />
                          Runs & drives
                        </label>
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="radio"
                            name="roroRunning"
                            value="non_runner"
                            checked={form.roroRunning === "non_runner"}
                            onChange={onChange("roroRunning")}
                            className="h-4 w-4 accent-[#FFA500]"
                          />
                          Non-runner
                        </label>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Mode-specific: Container */}
                {form.mode === "Container" ? (
                  <div className="mt-4 rounded-lg border border-[#E5E7EB] bg-white p-4">
                    <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#9A9EAB] mb-3">
                      Container details (optional)
                    </p>

                    <div>
                      <label className="text-sm font-semibold block mb-2">
                        Container type
                      </label>
                      <select
                        value={form.containerType}
                        onChange={onChange("containerType")}
                        className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500] bg-white"
                      >
                        {containerTypes.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                      <p className="mt-2 text-[11px] text-slate-500">
                        If unsure, leave blank — Operations will confirm.
                      </p>
                    </div>
                  </div>
                ) : null}

                {/* Mode-specific: Air */}
                {form.mode === "Air" ? (
                  <div className="mt-4 rounded-lg border border-[#E5E7EB] bg-white p-4">
                    <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#9A9EAB] mb-3">
                      Air freight details (recommended)
                    </p>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-semibold block mb-2">
                          Shipment type
                        </label>
                        <select
                          value={form.airType}
                          onChange={onChange("airType")}
                          className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500] bg-white"
                        >
                          {airTypes.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-semibold block mb-2">
                          Dimensions (optional)
                        </label>
                        <input
                          value={form.airDimensions}
                          onChange={onChange("airDimensions")}
                          className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                          placeholder="e.g. 80 × 60 × 40 cm"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="text-sm font-semibold block mb-2">
                        Latest delivery date (if time-critical)
                      </label>
                      <input
                        value={form.airDeadline}
                        onChange={onChange("airDeadline")}
                        className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                        type="date"
                      />
                    </div>
                  </div>
                ) : null}

                <div className="mt-4">
                  <label className="text-sm font-semibold block mb-2">
                    Notes (optional)
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={onChange("notes")}
                    rows={3}
                    className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                    placeholder="e.g. time-critical, collection needed, item values, special handling, delivery deadline…"
                  />
                </div>
              </div>

              {/* Shipper */}
              <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#9A9EAB] mb-3">
                  Shipper details
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold block mb-2">
                      Shipper name
                    </label>
                    <input
                      value={form.shipperName}
                      onChange={onChange("shipperName")}
                      className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                      placeholder="e.g. Jake Boateng"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold block mb-2">
                      Shipper email
                    </label>
                    <input
                      value={form.shipperEmail}
                      onChange={onChange("shipperEmail")}
                      className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                      placeholder="e.g. name@company.com"
                      type="email"
                      required
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-sm font-semibold block mb-2">
                    Shipper address
                  </label>
                  <input
                    value={form.shipperAddress}
                    onChange={onChange("shipperAddress")}
                    className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                    placeholder="e.g. London, UK"
                    required
                  />
                </div>
              </div>

              {/* Consignee */}
              <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#9A9EAB] mb-3">
                  Consignee details
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold block mb-2">
                      Consignee name
                    </label>
                    <input
                      value={form.consigneeName}
                      onChange={onChange("consigneeName")}
                      className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                      placeholder="e.g. Kofi Mensah"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold block mb-2">
                      Consignee address
                    </label>
                    <input
                      value={form.consigneeAddress}
                      onChange={onChange("consigneeAddress")}
                      className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                      placeholder="e.g. Tema, Ghana"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Ports */}
              <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#9A9EAB] mb-3">
                  Ports / airports
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold block mb-2">
                      Origin (port / town / airport)
                    </label>
                    <input
                      value={form.originPort}
                      onChange={onChange("originPort")}
                      className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                      placeholder="e.g. Tilbury / London / Heathrow"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold block mb-2">
                      Destination (port / city / airport)
                    </label>
                    <input
                      value={form.destinationPort}
                      onChange={onChange("destinationPort")}
                      className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                      placeholder="e.g. Tema / Accra / Kotoka"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <p className="text-[11px] text-slate-500">
                  After creation, you’ll see the shipment reference and
                  milestones on the details page.
                </p>

                <button
                  type="submit"
                  disabled={!canSubmit || status.loading}
                  className={`
                    px-5 py-2.5 rounded-full text-sm font-semibold transition
                    ${
                      !canSubmit || status.loading
                        ? "bg-[#9A9EAB] text-white cursor-not-allowed"
                        : "bg-[#1A2930] text-white hover:bg-[#FFA500] hover:text-[#1A2930]"
                    }
                  `}
                >
                  {status.loading ? "Creating…" : "Create booking"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-6 text-[11px] text-white/50">
          If validation fails, the server will return field errors — shown
          above.
        </div>
      </div>
    </div>
  );
}
