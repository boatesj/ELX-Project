const partners = [
  {
    name: "Presbyterian University",
    label: "Higher Education · Ghana",
    short: "PUC",
  },
  {
    name: "Tamale Technical University",
    label: "Technical Institute · Ghana",
    short: "TTU",
  },
  {
    name: "SecurePrint UK",
    label: "Secure Document Printer · United Kingdom",
    short: "SP UK",
  },
  {
    name: "Atlantic Vehicle Traders",
    label: "Automotive Exporter · United Kingdom",
    short: "AVT",
  },
  {
    name: "Northern Freight Partners",
    label: "Logistics Partner · Wales",
    short: "NFP",
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
              Our partners rely on our expertise for secure UK–Africa cargo.
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
              Many partners ship with us multiple times each year, validating
              our commitment to reliability.
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
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="
                group
                flex flex-col items-center justify-center
                rounded-2xl border border-gray-200
                bg-[#F9FAFB]/90
                px-4 py-4 md:px-5 md:py-5
                shadow-sm
                transition
                hover:border-[#FFA500]/60 hover:bg-white
                backdrop-blur-sm
              "
            >
              {/* Mood-board logo placeholder */}
              <div
                className="
                  mb-3 md:mb-4
                  flex items-center justify-center
                  h-10 md:h-11 w-full
                  rounded-md
                  bg-white
                  border border-gray-200
                  shadow-[0_1px_2px_rgba(0,0,0,0.04)]
                "
              >
                <span className="text-[11px] md:text-xs font-semibold text-gray-700 tracking-[0.16em] uppercase">
                  {partner.short}
                </span>
              </div>

              <div className="text-center">
                <p className="text-xs md:text-sm font-semibold text-[#111827]">
                  {partner.name}
                </p>
                {partner.label && (
                  <p className="text-[11px] md:text-xs text-gray-500 mt-1">
                    {partner.label}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Optional CTA line */}
        <div className="mt-8 md:mt-10 text-center text-xs md:text-sm text-gray-600">
          <span className="font-medium text-[#1A2930]">
            Ready to establish reliable UK–Africa shipping?
          </span>{" "}
          Contact us today to add Ellcworth to your approved vendor list.
        </div>
      </div>
    </section>
  );
};

export default SocialProofBoard;
