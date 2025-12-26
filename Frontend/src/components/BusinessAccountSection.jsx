import { FaHandshake, FaUserTie, FaChartLine } from "react-icons/fa";

const BusinessAccountSection = () => {
  return (
    <section
      id="booking"
      className="
        w-full
        bg-gradient-to-r from-[#1A2930] via-[#1A2930] to-[#121826]
        text-white
        py-14 md:py-18
        border-t border-slate-800
        scroll-mt-[120px] md:scroll-mt-[160px]
      "
      aria-label="Business shipping profile"
    >
      <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr,1fr] items-center">
          {/* Text / pitch */}
          <div>
            <span className="inline-flex items-center rounded-full bg-white/5 text-[#FFA500] px-3 py-1 text-[11px] md:text-xs font-semibold tracking-[0.16em] uppercase mb-3">
              For traders, SMEs & institutions
            </span>

            <h2 className="text-2xl md:text-[2.1rem] font-semibold tracking-tight mb-3 uppercase">
              Set up an Ellcworth business shipping profile.
            </h2>

            <p className="text-sm md:text-base text-slate-200 leading-relaxed mb-5">
              If you ship regularly, we can streamline your bookings, paperwork
              and updates so each movement feels more like a simple workflow
              than a one-off project.
            </p>

            <div className="grid gap-3 md:grid-cols-2 mb-6">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#FFA500]/10 text-[#FFA500]">
                  <FaHandshake className="text-sm" />
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    Get a Dedicated Partner
                  </p>
                  <p className="text-xs md:text-[13px] text-slate-200/90 leading-snug">
                    Speak to someone who knows your routes, terms and typical
                    cargo.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#FFA500]/10 text-[#FFA500]">
                  <FaChartLine className="text-sm" />
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    Lock in Predictable Rates
                  </p>
                  <p className="text-xs md:text-[13px] text-slate-200/90 leading-snug">
                    Discuss rates and service levels that fit your shipping
                    pattern.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#FFA500]/10 text-[#FFA500]">
                  <FaUserTie className="text-sm" />
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    Simplify Your Paperwork
                  </p>
                  <p className="text-xs md:text-[13px] text-slate-200/90 leading-snug">
                    Help with repeat paperwork, export requirements and buyer
                    needs.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#FFA500]/10 text-[#FFA500]">
                  <span className="text-[11px] font-bold">Fx</span>
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    Integrate with Your Schedule
                  </p>
                  <p className="text-xs md:text-[13px] text-slate-200/90 leading-snug">
                    Plan around production, term dates or vessel schedules—not
                    guesswork.
                  </p>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="mailto:info@ellcworth.com?subject=Business%20shipping%20profile"
                className="
                  inline-flex items-center justify-center
                  rounded-full
                  bg-[#FFA500]
                  text-black
                  px-6 py-2.5
                  text-sm md:text-base font-semibold
                  shadow-md shadow-black/40
                  transition
                  hover:bg-[#ffb733]
                "
              >
                Discuss a business shipping profile
              </a>

              <a
                href="#quote"
                className="
                  inline-flex items-center justify-center
                  rounded-full
                  border border-[#FFA500]
                  text-[#FFA500]
                  px-5 py-2.5
                  text-sm md:text-base font-semibold
                  transition
                  hover:bg-[#1F2933]
                "
              >
                Start with a shipment today
              </a>
            </div>
          </div>

          {/* Info card / summary */}
          <aside
            className="
              rounded-2xl
              bg-[#0F172A]
              border border-[#9A9EAB]/50
              p-5 md:p-6
              shadow-[0_18px_40px_rgba(15,23,42,0.7)]
            "
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9A9EAB] mb-2">
              How it simplifies your logistics
            </p>
            <h3 className="text-sm md:text-base font-semibold mb-3">
              A simple framework for your repeat shipments
            </h3>
            <ul className="space-y-2.5 text-xs md:text-[13px] text-slate-200 leading-relaxed">
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#FFA500]" />
                <span>
                  Faster Bookings: Your core company details, main routes, and
                  preferred ports are already saved.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#FFA500]" />
                <span>
                  Reliable Process: We agree on a smooth, predictable way of
                  working for bookings, updates, and documentation.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#FFA500]" />
                <span>
                  Quick Resolution: A clear, established contact route when you
                  need to move something urgently or complex.
                </span>
              </li>
            </ul>
            <p className="mt-4 text-[11px] text-slate-400">
              Ready to simplify? Register your profile and start saving time.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default BusinessAccountSection;
