const sectors = [
  {
    icon: "🎓",
    label: "Higher Education",
    detail: "Universities & academic institutions",
  },
  {
    icon: "🖨️",
    label: "Secure Print",
    detail: "Certificate & document printers",
  },
  {
    icon: "🚗",
    label: "Automotive Export",
    detail: "Vehicle traders & exporters",
  },
  {
    icon: "🚢",
    label: "Freight Logistics",
    detail: "Clearing & forwarding partners",
  },
  {
    icon: "🏥",
    label: "Healthcare",
    detail: "Medical equipment & supplies",
  },
];

const SocialProofBoard = () => {
  return (
    <section
      id="partners"
      className="
        relative
        w-full
        border-t border-gray-200
        py-14 md:py-18 lg:py-20
        bg-white
        overflow-hidden
        scroll-mt-[120px] md:scroll-mt-[160px]
      "
      aria-label="Ellcworth partners and institutions"
    >
      {/* Background texture (local-only; avoids external dependencies) */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.08]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,165,0,0.35),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(26,41,48,0.35),transparent_45%),radial-gradient(circle_at_50%_85%,rgba(154,158,171,0.25),transparent_45%)]" />
      </div>

      {/* Soft overlay so content stays readable */}
      <div className="absolute inset-0 bg-white/85 backdrop-blur-[2px]" />

      <div className="relative mx-auto w-full max-w-6xl px-4 md:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-8 md:mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="inline-flex items-center rounded-full bg-[#1A2930] text-[#FFA500] px-3 py-1 text-[11px] md:text-xs font-semibold tracking-[0.16em] uppercase mb-3">
              Partners & Institutions
            </span>
            <h2 className="text-2xl md:text-[2rem] font-semibold tracking-tight text-[#111827] mb-2 uppercase">
              We work with organisations across these sectors.
            </h2>
            <p className="text-sm md:text-base text-gray-600 max-w-2xl">
              We support organisations across education, secure printing and
              industry who rely on us for reliable, well-documented movement of
              critical and high-value cargo.
            </p>
          </div>

          <div className="text-xs md:text-sm text-gray-500 md:text-right">
            <p className="font-semibold text-[#111827]">
              Focused on lasting relationships, not just one-off transactions.
            </p>
            <p>
              Case studies and named references available on request.
            </p>
          </div>
        </div>

        {/* Brand board */}
        <div
          className="
            grid gap-4 md:gap-6
            grid-cols-2 md:grid-cols-3 lg:grid-cols-5
          "
        >
          {sectors.map((sector) => (
            <div
              key={sector.label}
              className="
                group
                flex flex-col items-center justify-center text-center
                rounded-2xl border border-gray-200
                bg-[#F9FAFB]/90
                px-4 py-5 md:px-5 md:py-6
                shadow-sm
                transition
                hover:border-[#FFA500]/60 hover:bg-white
                backdrop-blur-sm
              "
            >
              <div className="mb-3 flex items-center justify-center h-11 w-11 rounded-full bg-[#1A2930] text-2xl">
                {sector.icon}
              </div>
              <p className="text-xs md:text-sm font-semibold text-[#111827] mb-1">
                {sector.label}
              </p>
              <p className="text-[11px] md:text-xs text-gray-500">
                {sector.detail}
              </p>
            </div>
          ))}
        </div>

        {/* Optional CTA line */}
        <div className="mt-8 md:mt-10 text-center text-xs md:text-sm text-gray-600">
          <span className="font-medium text-[#1A2930]">
            Case studies and named references available on request.
          </span>{" "}
          <a href="mailto:cs@ellcworth.com" className="underline hover:text-[#FFA500] transition">
            Contact us to find out more.
          </a>
        </div>
      </div>
    </section>
  );
};

export default SocialProofBoard;
