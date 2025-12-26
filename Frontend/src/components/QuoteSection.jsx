import { useMemo, useState } from "react";

const SERVICE_TABS = [
  { id: "container", label: "Container shipping" },
  { id: "roro", label: "RoRo vehicle shipping" },
  { id: "air", label: "Air freight" },
];

const QuoteSection = () => {
  const [activeService, setActiveService] = useState("container");
  const [submitted, setSubmitted] = useState(false);

  const serviceLabel = useMemo(
    () => getServiceLabel(activeService),
    [activeService]
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    // Phase 4: UI-only lead capture (no backend wiring yet).
    // Keep it quiet + professional.
    setSubmitted(true);

    // Optional: auto-hide the success notice after a bit
    window.setTimeout(() => setSubmitted(false), 6500);
  };

  return (
    <section
      id="quote"
      className="
        w-full
        bg-gradient-to-b from-[#E5E7EB] via-[#F9FAFB] to-[#E5E7EB]
        py-14 md:py-20
        border-t border-gray-200
        scroll-mt-[120px] md:scroll-mt-[160px]
      "
      aria-label="Get a shipping quote"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 md:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-10 text-center max-w-3xl">
          <span className="inline-flex items-center rounded-full bg-[#1A2930] text-[#FFA500] px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase mb-4">
            Step 1 · Get a quote
          </span>
          <h2 className="text-3xl md:text-4xl font-semibold text-[#111827] mb-3 uppercase">
            Get a quick shipping quote
          </h2>
          <p className="text-lg md:text-xl text-gray-700">
            Choose your service, tell us a few details, and we’ll come back with
            clear options and costs for your route.
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
          {submitted ? (
            <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left">
              <p className="text-sm md:text-base font-semibold text-emerald-900">
                Thank you — we’ve received your request.
              </p>
              <p className="text-xs md:text-sm text-emerald-800 mt-1">
                In the next iteration this will submit directly to Ellcworth.
                For now, it confirms the UX flow is working.
              </p>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder="e.g. Jake Boateng"
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
                "
              >
                Start your {serviceLabel} quote
              </button>

              <p className="text-xs md:text-sm text-gray-500 mt-3">
                We usually respond within one business day. If your shipment is
                urgent, mention your latest delivery date so we can prioritise
                it.
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
      return "container";
    case "roro":
      return "RoRo";
    case "air":
      return "air freight";
    default:
      return "shipping";
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
