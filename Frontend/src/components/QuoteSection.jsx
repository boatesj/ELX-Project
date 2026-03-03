import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { publicRequest } from "../requestMethods"; // ✅ force public for lead requests

const SERVICE_TABS = [
  { id: "container", label: "Container shipping" },
  { id: "roro", label: "RoRo vehicle shipping" },
  { id: "air", label: "Air freight" },
];

function mapServiceParamToTabId(raw) {
  const v = String(raw || "")
    .toLowerCase()
    .trim();

  // accept a few common variations
  if (v === "container" || v === "sea" || v === "fcl" || v === "lcl")
    return "container";
  if (v === "roro" || v === "ro-ro" || v === "vehicle" || v === "cars")
    return "roro";
  if (
    v === "air" ||
    v === "airfreight" ||
    v === "air-freight" ||
    v === "air_freight"
  )
    return "air";

  return null;
}

/**
 * HashRouter example: "#quote?service=air"
 * Returns "air" (string) or null
 */
function readServiceFromHash(hash = "") {
  const raw = String(hash || "");
  if (!raw.startsWith("#")) return null;

  const withoutHash = raw.slice(1); // "quote?service=air"
  const [anchor, qs] = withoutHash.split("?"); // ["quote", "service=air"]

  const cleanAnchor = String(anchor || "")
    .replace(/^\/+/, "")
    .toLowerCase();

  if (cleanAnchor !== "quote") return null;

  const params = new URLSearchParams(qs || "");
  return params.get("service");
}

/**
 * BrowserRouter example: "/?service=air#quote"
 * We only use location.search when hash is "#quote"
 */
function readServiceFromSearch(search = "") {
  const params = new URLSearchParams(String(search || ""));
  return params.get("service");
}

/**
 * Remove "bad optional" values that trigger express-validator:
 * - null
 * - undefined
 * - "" (empty string)
 */
function deepPrune(value) {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "string" && value.trim() === "") return undefined;

  if (Array.isArray(value)) {
    const cleaned = value.map(deepPrune).filter((v) => v !== undefined);
    return cleaned.length ? cleaned : undefined;
  }

  if (typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      const cleaned = deepPrune(v);
      if (cleaned !== undefined) out[k] = cleaned;
    }
    return Object.keys(out).length ? out : undefined;
  }

  return value;
}

function normaliseDateToIso(value) {
  if (!value) return undefined;

  if (value instanceof Date) {
    const t = value.getTime();
    return Number.isFinite(t) ? value.toISOString() : undefined;
  }

  const s = String(value).trim();
  if (!s) return undefined;

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const d = new Date(`${s}T00:00:00.000Z`);
    return Number.isFinite(d.getTime()) ? d.toISOString() : undefined;
  }

  return s;
}

const QuoteSection = () => {
  const location = useLocation();
  const sectionRef = useRef(null);

  const [activeService, setActiveService] = useState("container");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [createdRef, setCreatedRef] = useState("");

  // ✅ NEW: in-house bot defence timer (server expects this in prod)
  const [formStartedAt, setFormStartedAt] = useState(() => Date.now());

  // ✅ Auto-select tab from service param when targeting #quote
  useEffect(() => {
    const hash = String(location.hash || "");
    const hashLower = hash.toLowerCase();

    // Only act when #quote is targeted
    if (!hashLower.startsWith("#quote")) return;

    // 1) HashRouter style: "#quote?service=air"
    const serviceFromHash = readServiceFromHash(hash);

    // 2) BrowserRouter style: "?service=air#quote"
    const serviceFromSearch = readServiceFromSearch(location.search || "");

    // Prefer hash param if present, else search param
    const serviceRaw = serviceFromHash || serviceFromSearch;
    const tab = mapServiceParamToTabId(serviceRaw);

    if (tab && tab !== activeService) {
      setActiveService(tab);
      setSubmitted(false);
      setSubmitError("");
      setCreatedRef("");

      // ✅ reset timing window on tab switch
      setFormStartedAt(Date.now());
    }

    // Ensure quote section is visible
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash, location.search]);

  const serviceLabel = useMemo(
    () => getServiceLabel(activeService),
    [activeService],
  );

  const buildPayloadFromForm = (fd, serviceId) => {
    const leadName = String(fd.get("lead_name") || "").trim();
    const leadEmail = String(fd.get("lead_email") || "").trim();
    const leadPhone = String(fd.get("lead_phone") || "").trim();

    const nowIso = new Date().toISOString();

    // Shared defaults (validator requires shipper/consignee/ports)
    const base = {
      status: "request_received",
      paymentStatus: "unpaid",

      shipper: {
        name: leadName,
        address: "To be confirmed",
        email: leadEmail,
        phone: leadPhone || "",
      },

      // Consignee info may be unknown at request stage
      consignee: {
        name: "To be confirmed",
        address: "To be confirmed",
      },

      notify: {},

      ports: {
        originPort: "",
        destinationPort: "",
      },

      cargo: {
        description: "",
        weight: "",
        vehicle: {},
        container: {},
        documentsShipment: {},
      },

      services: {
        repacking: {
          required: false,
          notes: "",
        },
      },

      meta: {
        source: "web_quote",
        createdAtClient: nowIso,
        serviceTab: serviceId,
        leadStage: true,

        // ✅ IMPORTANT: store lead snapshot here (backend expects meta.requestor)
        requestor: {
          name: leadName,
          email: leadEmail,
          phone: leadPhone || "",
        },
      },

      // ✅ Always treat as web portal lead
      channel: "web_portal",
    };

    if (serviceId === "container") {
      const from = String(fd.get("container_from") || "").trim();
      const to = String(fd.get("container_to") || "").trim();
      const cargoType = String(fd.get("container_cargo_type") || "").trim(); // fcl20 | fcl40 | lcl
      const weight = String(fd.get("container_weight") || "").trim();
      const readyDate = String(fd.get("container_ready_date") || "").trim();
      const desc = String(fd.get("container_description") || "").trim();

      base.ports.originPort = from;
      base.ports.destinationPort = to;

      const isLcl = cargoType === "lcl";
      base.serviceType = "sea_freight";
      base.cargoType = isLcl ? "lcl" : "container";
      base.mode = isLcl ? "LCL" : "Container";

      base.cargo.weight = weight ? `${weight} kg` : "";
      base.shippingDate = normaliseDateToIso(readyDate);

      base.cargo.description = [
        "Quote request · Container",
        `Cargo: ${cargoType || "—"}`,
        desc ? `Description: ${desc}` : null,
      ]
        .filter(Boolean)
        .join(" | ");

      base.meta.intake = {
        container: {
          cargoType,
          weightKg: weight || null,
          readyDate: readyDate || null,
          description: desc || "",
        },
      };

      return base;
    }

    if (serviceId === "roro") {
      const from = String(fd.get("roro_from") || "").trim();
      const to = String(fd.get("roro_to") || "").trim();
      const vehicleType = String(fd.get("roro_vehicle_type") || "").trim();
      const makeModel = String(fd.get("roro_make_model") || "").trim();
      const running = String(fd.get("roro_running") || "runner").trim();
      const delivery = String(fd.get("roro_delivery") || "delivered").trim();
      const dimensions = String(fd.get("roro_dimensions") || "").trim();

      base.ports.originPort = from;
      base.ports.destinationPort = to;

      base.serviceType = "sea_freight";
      base.cargoType = "vehicle";
      base.mode = "RoRo";

      base.cargo.vehicle = {
        make: makeModel,
        model: "",
        year: "",
        vin: "",
        registrationNo: "",
      };

      base.cargo.description = [
        "Quote request · RoRo",
        `Vehicle: ${vehicleType || "—"}`,
        makeModel ? `Make/Model: ${makeModel}` : null,
        `Condition: ${running === "runner" ? "Runs & drives" : "Non-runner"}`,
        `Port access: ${
          delivery === "delivered" ? "Delivered to port" : "Need collection"
        }`,
        dimensions ? `Dims: ${dimensions}` : null,
      ]
        .filter(Boolean)
        .join(" | ");

      base.meta.intake = {
        roro: {
          from,
          to,
          vehicleType,
          makeModel,
          running,
          delivery,
          dimensions,
        },
      };

      return base;
    }

    // air
    const from = String(fd.get("air_from") || "").trim();
    const to = String(fd.get("air_to") || "").trim();
    const airType = String(fd.get("air_type") || "").trim(); // docs | parcels | freight
    const weight = String(fd.get("air_weight") || "").trim();
    const dims = String(fd.get("air_dimensions") || "").trim();
    const deadline = String(fd.get("air_deadline") || "").trim();

    base.ports.originPort = from;
    base.ports.destinationPort = to;

    base.serviceType = "air_freight";

    if (airType === "docs") {
      base.mode = "Documents";
      base.cargoType = "lcl";
      base.cargo.documentsShipment = {
        count: 1,
        docTypes: ["Documents"],
        secure: true,
      };
    } else {
      base.mode = "Air";
      base.cargoType = "lcl";
    }

    base.cargo.weight = weight ? `${weight} kg` : "";

    base.cargo.description = [
      "Quote request · Air freight",
      `Type: ${airType || "—"}`,
      weight ? `Weight: ${weight} kg` : null,
      dims ? `Dims: ${dims}` : null,
      deadline ? `Deadline: ${deadline}` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    base.meta.intake = {
      air: {
        from,
        to,
        airType,
        weightKg: weight || null,
        dimensions: dims,
        deadline: deadline || null,
      },
    };

    return base;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formEl = e.currentTarget;

    setSubmitError("");
    setCreatedRef("");
    setSubmitting(true);

    try {
      const fd = new FormData(formEl);

      // ✅ NEW: robust Turnstile token capture
      // Cloudflare Turnstile commonly injects: name="cf-turnstile-response"
      const turnstileToken =
        String(
          fd.get("turnstileToken") ||
            fd.get("cfTurnstileToken") ||
            fd.get("cf-turnstile-response") ||
            fd.get("captchaToken") ||
            "",
        ).trim() || "";

      let payload = buildPayloadFromForm(fd, activeService);

      if (!payload?.ports?.originPort || !payload?.ports?.destinationPort) {
        throw new Error("Please provide both origin and destination.");
      }

      // ✅ NEW: in-house bot defence fields
      payload.formStartedAt = Number(formStartedAt) || Date.now();

      // (Honeypot is checked server-side; we do NOT need to copy it into payload.
      // But if you want it visible for logs, you can pass it. We leave it out.)

      // ✅ Pass Turnstile token if present (verifyTurnstile expects this key)
      if (turnstileToken) {
        payload.turnstileToken = turnstileToken;
      }

      payload = deepPrune(payload) || {};

      if (!payload.shipper || !payload.consignee || !payload.ports) {
        throw new Error("Missing required quote fields. Please try again.");
      }

      // ✅ IMPORTANT: lead requests must be PUBLIC (avoid stale customer token)
      const res = await publicRequest.post(
        "/api/v1/shipments/public-request",
        payload,
      );

      const created = res.data?.shipment || res.data?.data || res.data;
      const ref = created?.referenceNo || "";

      setSubmitted(true);
      setCreatedRef(ref);

      if (formEl && typeof formEl.reset === "function") {
        formEl.reset();
      }

      // ✅ reset timing window for next submit
      setFormStartedAt(Date.now());

      window.setTimeout(() => setSubmitted(false), 6500);
    } catch (err) {
      const api = err?.response?.data;
      const firstFieldError =
        Array.isArray(api?.errors) && api.errors.length
          ? `${api.errors[0].field}: ${api.errors[0].message}`
          : "";

      const msg =
        firstFieldError ||
        api?.message ||
        err?.message ||
        "Sorry — we couldn’t submit your request. Please try again.";

      setSubmitError(msg);
      setSubmitted(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="quote"
      className="
        w-full
        bg-gradient-to-b from-[#E5E7EB] via-[#F9FAFB] to-[#E5E7EB]
        py-14 md:py-20
        border-t border-gray-200
        scroll-mt-[120px] md:scroll-mt-[160px]
      "
      aria-label="Request a freight quote"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 md:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-10 text-center max-w-3xl">
          <span className="inline-flex items-center rounded-full bg-[#1A2930] text-[#FFA500] px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase mb-4">
            Quote request
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold text-[#111827] mb-3 uppercase">
            Request a shipping quote
          </h2>
          <p className="text-lg md:text-xl text-gray-700">
            Select a service and provide the basics. We’ll respond with clear
            pricing and next steps for your route.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8 w-full">
          <div
            className="
              flex flex-col items-stretch gap-2
              sm:inline-flex sm:flex-row sm:items-center sm:justify-center
              rounded-2xl sm:rounded-full
              bg-[#1A2930]/95
              p-1.5
              border border-[#1A2930]
              shadow-lg shadow-slate-900/20
              max-w-md sm:max-w-none
              mx-auto
            "
            role="tablist"
            aria-label="Quote service tabs"
          >
            {SERVICE_TABS.map((tab) => {
              const active = activeService === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setActiveService(tab.id);
                    setSubmitted(false);
                    setSubmitError("");
                    setCreatedRef("");

                    // ✅ reset timing window on tab switch
                    setFormStartedAt(Date.now());
                  }}
                  className={`
                    w-full sm:w-auto
                    rounded-full
                    px-4 sm:px-5 md:px-7
                    py-2 sm:py-2.5
                    text-[11px] sm:text-xs md:text-sm
                    font-medium
                    transition
                    ${
                      active
                        ? "bg-[#FFA500] text-black shadow-md shadow-black/20"
                        : "bg-transparent text-slate-100 hover:bg-white/10"
                    }
                  `}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Card */}
        <div
          className="
            w-full
            rounded-3xl
            border border-gray-200/80
            bg-white
            px-5 py-7 md:px-10 md:py-9
            shadow-[0_22px_45px_rgba(15,23,42,0.18)]
          "
        >
          {submitError ? (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-left">
              <p className="text-sm md:text-base font-semibold text-red-900">
                We couldn’t submit your request.
              </p>
              <p className="text-xs md:text-sm text-red-800 mt-1">
                {submitError}
              </p>
            </div>
          ) : null}

          {submitted ? (
            <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left">
              <p className="text-sm md:text-base font-semibold text-emerald-900">
                Thank you — we’ve received your request.
              </p>
              <p className="text-xs md:text-sm text-emerald-800 mt-1">
                Our team will review and respond with a quote.{" "}
                {createdRef ? (
                  <span className="font-mono font-semibold">
                    Ref: {createdRef}
                  </span>
                ) : null}
              </p>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ✅ NEW: in-house bot defence fields */}
            <input type="hidden" name="formStartedAt" value={formStartedAt} />

            {/* ✅ Honeypot (bots fill it; humans won't) */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                left: "-10000px",
                top: "auto",
                width: "1px",
                height: "1px",
                overflow: "hidden",
              }}
            >
              <label htmlFor="website">Website</label>
              <input
                id="website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {/* Lead capture (shared) */}
            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-1">
                <label className={labelClasses} htmlFor="lead_name">
                  Your name
                </label>
                <input
                  id="lead_name"
                  type="text"
                  name="lead_name"
                  placeholder="e.g. John Doe"
                  className={commonInputClasses}
                  required
                />
              </div>

              <div className="md:col-span-1">
                <label className={labelClasses} htmlFor="lead_email">
                  Email
                </label>
                <input
                  id="lead_email"
                  type="email"
                  name="lead_email"
                  placeholder="e.g. you@company.com"
                  className={commonInputClasses}
                  required
                />
              </div>

              <div className="md:col-span-1">
                <label className={labelClasses} htmlFor="lead_phone">
                  Phone (optional)
                </label>
                <input
                  id="lead_phone"
                  type="tel"
                  name="lead_phone"
                  placeholder="e.g. +44 7..."
                  className={commonInputClasses}
                />
              </div>
            </div>

            {/* Service-specific fields */}
            <div className="grid gap-6 md:grid-cols-2">
              {activeService === "container" ? <ContainerFields /> : null}
              {activeService === "roro" ? <RoroFields /> : null}
              {activeService === "air" ? <AirFields /> : null}
            </div>

            {/* CTA */}
            <div className="pt-4 text-center">
              <button
                type="submit"
                disabled={submitting}
                className="
                  inline-flex items-center justify-center
                  rounded-full
                  border border-[#FFA500]
                  bg-[#FFA500]
                  px-8 py-3.5
                  text-sm md:text-lg font-semibold text-black
                  shadow-md shadow-black/20
                  transition
                  hover:bg-[#ffb733]
                  focus:outline-none
                  focus:ring-2 focus:ring-[#FFA500]/80
                  focus:ring-offset-2 focus:ring-offset-white
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
              >
                {submitting ? "Submitting..." : `Request ${serviceLabel} quote`}
              </button>

              <p className="text-xs md:text-sm text-gray-500 mt-3">
                Typical response time: one business day. If your shipment is
                time-critical, include your latest delivery date so we can
                prioritise.
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

const getServiceLabel = (id) => {
  switch (id) {
    case "container":
      return "a container";
    case "roro":
      return "a RoRo";
    case "air":
      return "an air freight";
    default:
      return "a shipping";
  }
};

/* ---------- Shared styles ---------- */

const commonInputClasses =
  "w-full rounded-2xl border border-gray-300/80 bg-[#F9FAFB] px-3.5 py-3.5 text-base md:text-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFA500]/85 focus:border-transparent transition-shadow";

const labelClasses =
  "block text-sm md:text-base font-medium text-gray-800 mb-1.5";

/* ---------- Service-specific field blocks ---------- */

const ContainerFields = () => {
  return (
    <>
      <div>
        <label className={labelClasses}>From (UK port or town)</label>
        <input
          type="text"
          name="container_from"
          placeholder="e.g. London, Tilbury, Felixstowe"
          className={commonInputClasses}
          required
        />
      </div>

      <div>
        <label className={labelClasses}>To (destination port / country)</label>
        <input
          type="text"
          name="container_to"
          placeholder="e.g. Tema, Lagos, Freetown"
          className={commonInputClasses}
          required
        />
      </div>

      <div>
        <label className={labelClasses}>Cargo type</label>
        <select
          name="container_cargo_type"
          className={commonInputClasses}
          defaultValue=""
          required
        >
          <option value="" disabled>
            Select option
          </option>
          <option value="fcl20">FCL 20ft container</option>
          <option value="fcl40">FCL 40ft container</option>
          <option value="lcl">LCL / loose cargo</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClasses}>Approx. total weight (kg)</label>
          <input
            type="number"
            name="container_weight"
            min="0"
            placeholder="e.g. 1,200"
            className={commonInputClasses}
          />
        </div>
        <div>
          <label className={labelClasses}>Ready date (approx.)</label>
          <input
            type="date"
            name="container_ready_date"
            className={commonInputClasses}
          />
        </div>
      </div>

      <div className="md:col-span-2">
        <label className={labelClasses}>What are you shipping?</label>
        <input
          type="text"
          name="container_description"
          placeholder="e.g. household goods, commercial stock, machinery"
          className={commonInputClasses}
        />
      </div>
    </>
  );
};

const RoroFields = () => {
  return (
    <>
      <div>
        <label className={labelClasses}>From (UK RoRo port)</label>
        <input
          type="text"
          name="roro_from"
          placeholder="e.g. Tilbury, Sheerness, Southampton"
          className={commonInputClasses}
          required
        />
      </div>

      <div>
        <label className={labelClasses}>To (destination port)</label>
        <input
          type="text"
          name="roro_to"
          placeholder="e.g. Tema, Lagos, Cotonou"
          className={commonInputClasses}
          required
        />
      </div>

      <div>
        <label className={labelClasses}>Vehicle type</label>
        <select
          name="roro_vehicle_type"
          className={commonInputClasses}
          defaultValue=""
          required
        >
          <option value="" disabled>
            Select vehicle
          </option>
          <option value="car">Car</option>
          <option value="4x4">4×4 / SUV</option>
          <option value="van">Van</option>
          <option value="minibus">Minibus</option>
          <option value="truck">Truck / lorry</option>
          <option value="plant">Plant / machinery</option>
        </select>
      </div>

      <div>
        <label className={labelClasses}>Make &amp; model</label>
        <input
          type="text"
          name="roro_make_model"
          placeholder="e.g. Toyota RAV4 2018"
          className={commonInputClasses}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm md:text-base text-gray-800 md:col-span-2">
        <div>
          <span className="block text-sm md:text-base font-medium text-gray-800 mb-1.5">
            Running condition
          </span>
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-1.5">
              <input
                type="radio"
                name="roro_running"
                value="runner"
                defaultChecked
                className="h-4 w-4 accent-[#FFA500]"
              />
              Runs &amp; drives
            </label>
            <label className="inline-flex items-center gap-1.5">
              <input
                type="radio"
                name="roro_running"
                value="non_runner"
                className="h-4 w-4 accent-[#FFA500]"
              />
              Non-runner
            </label>
          </div>
        </div>

        <div>
          <span className="block text-sm md:text-base font-medium text-gray-800 mb-1.5">
            How will it reach port?
          </span>
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-1.5">
              <input
                type="radio"
                name="roro_delivery"
                value="delivered"
                defaultChecked
                className="h-4 w-4 accent-[#FFA500]"
              />
              Delivered to port
            </label>
            <label className="inline-flex items-center gap-1.5">
              <input
                type="radio"
                name="roro_delivery"
                value="collection"
                className="h-4 w-4 accent-[#FFA500]"
              />
              Need collection
            </label>
          </div>
        </div>
      </div>

      <div className="md:col-span-2">
        <label className={labelClasses}>
          Vehicle dimensions (L × W × H, metres)
        </label>
        <input
          type="text"
          name="roro_dimensions"
          placeholder="e.g. 4.5 × 1.8 × 1.6"
          className={commonInputClasses}
        />
      </div>
    </>
  );
};

const AirFields = () => {
  return (
    <>
      <div>
        <label className={labelClasses}>From (UK town / airport)</label>
        <input
          type="text"
          name="air_from"
          placeholder="e.g. London, Heathrow"
          className={commonInputClasses}
          required
        />
      </div>

      <div>
        <label className={labelClasses}>To (city / airport)</label>
        <input
          type="text"
          name="air_to"
          placeholder="e.g. Accra, Kotoka"
          className={commonInputClasses}
          required
        />
      </div>

      <div>
        <label className={labelClasses}>Shipment type</label>
        <select
          name="air_type"
          className={commonInputClasses}
          defaultValue=""
          required
        >
          <option value="" disabled>
            Select type
          </option>
          <option value="docs">Documents only</option>
          <option value="parcels">Parcels / small packages</option>
          <option value="freight">Larger freight</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClasses}>Total weight (kg)</label>
          <input
            type="number"
            name="air_weight"
            min="0"
            placeholder="e.g. 75"
            className={commonInputClasses}
          />
        </div>
        <div>
          <label className={labelClasses}>Dimensions (optional)</label>
          <input
            type="text"
            name="air_dimensions"
            placeholder="e.g. 80 × 60 × 40 cm"
            className={commonInputClasses}
          />
        </div>
      </div>

      <div className="md:col-span-2">
        <label className={labelClasses}>
          Latest delivery date (if time-critical)
        </label>
        <input type="date" name="air_deadline" className={commonInputClasses} />
      </div>
    </>
  );
};

export default QuoteSection;
