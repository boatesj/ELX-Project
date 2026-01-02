import { useMemo, useState } from "react";
import { FaArrowLeft, FaCheckCircle, FaShip, FaTruck } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { customerAuthRequest } from "@/requestMethods";

const CREATE_SHIPMENT_PATH = "/shipments";

/**
 * Backend validator requires mode to be one of:
 * "RoRo", "Container", "Air", "LCL", "Documents", "Pallets", "Parcels"
 *
 * For Phase 5 we keep the UI minimal but contract-correct.
 */
const modes = [
  { value: "RoRo", label: "RoRo vehicle shipment", icon: <FaTruck /> },
  { value: "Container", label: "Containerised sea freight", icon: <FaShip /> },
  {
    value: "Documents",
    label: "Secure document shipment",
    icon: <FaCheckCircle />,
  },
];

function pickCreatedShipment(body) {
  // Accept common response shapes:
  // { shipment:{...} } OR { ok:true, data:{...} } OR { ...shipment }
  if (body?.shipment && typeof body.shipment === "object") return body.shipment;
  if (body?.data && typeof body.data === "object") return body.data;
  if (body && typeof body === "object") return body;
  return null;
}

function normalizeValidationErrors(err) {
  const data = err?.response?.data;
  const list = Array.isArray(data?.errors) ? data.errors : [];
  // each: { field, message, value? }
  return list
    .map((e) => ({
      field: String(e?.field || "").trim(),
      message: String(e?.message || "").trim(),
    }))
    .filter((x) => x.field || x.message);
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
        form.destinationPort.trim()
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
    setForm((p) => ({ ...p, mode: value }));
    if (status.error || (status.fieldErrors && status.fieldErrors.length)) {
      setStatus((s) => ({ ...s, error: "", fieldErrors: [] }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || status.loading) return;

    setStatus({ loading: true, error: "", success: "", fieldErrors: [] });

    try {
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
              This form captures the minimum required details to create a
              shipment. Additional details can be added later by Operations.
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
                <div className="grid gap-3 md:grid-cols-3">
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
                  Ports
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold block mb-2">
                      Origin port
                    </label>
                    <input
                      value={form.originPort}
                      onChange={onChange("originPort")}
                      className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                      placeholder="e.g. London"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold block mb-2">
                      Destination port
                    </label>
                    <input
                      value={form.destinationPort}
                      onChange={onChange("destinationPort")}
                      className="w-full rounded-lg border border-[#D1D5DB] px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/60 focus:border-[#FFA500]"
                      placeholder="e.g. Tema"
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
