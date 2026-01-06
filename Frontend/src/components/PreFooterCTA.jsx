import { FaPhoneAlt, FaEnvelope } from "react-icons/fa";

const PreFooterCTA = () => {
  return (
    <section className="w-full bg-white border-t border-[#9A9EAB]/30">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-14 md:py-16">
        <div className="relative overflow-hidden rounded-2xl bg-[#1A2930] text-white shadow-xl">
          {/* subtle enterprise texture */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 18% 28%, rgba(255,165,0,0.45) 0, rgba(255,165,0,0) 42%), radial-gradient(circle at 82% 62%, rgba(255,255,255,0.12) 0, rgba(255,255,255,0) 48%)",
            }}
          />

          {/* content */}
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 p-8 md:p-12">
            {/* LEFT: commercial messaging */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#FFA500]">
                Ready when you are
              </p>

              <h3 className="mt-3 text-2xl md:text-3xl font-extrabold tracking-tight">
                Start your shipment with confidence
              </h3>

              <p className="mt-4 text-sm md:text-[15px] text-white/80 leading-relaxed max-w-xl">
                Whether you’re shipping a single vehicle, commercial cargo or
                urgent documents, our logistics team will confirm routes,
                pricing and timelines before anything moves.
              </p>

              {/* reassurance bullets */}
              <ul className="mt-6 space-y-2 text-sm text-white/75">
                <li>• Clear quotations before booking</li>
                <li>• Dedicated UK–Africa logistics specialists</li>
                <li>• Structured updates from collection to delivery</li>
              </ul>
            </div>

            {/* RIGHT: CTAs */}
            <div className="flex flex-col justify-center gap-4 w-full max-w-md">
              {/* Primary CTA */}
              <a
                href="#booking"
                className="inline-flex items-center justify-center rounded-lg bg-[#FFA500] text-[#1A2930] px-6 py-3 text-base font-bold shadow-lg shadow-black/30 transition hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFA500]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2930]"
              >
                Get a shipping quote
              </a>

              {/* Secondary CTA */}
              <div className="flex gap-3 flex-wrap">
                <a
                  href="mailto:info@ellcworth.com"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-white/10 text-white px-5 py-2.5 text-sm font-semibold border border-white/20 hover:bg-white/15 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2930]"
                >
                  <FaEnvelope className="text-[#FFA500]" />
                  Email logistics team
                </a>

                <a
                  href="tel:+442089796054"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-white/10 text-white px-5 py-2.5 text-sm font-semibold border border-white/20 hover:bg-white/15 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2930]"
                >
                  <FaPhoneAlt className="text-[#FFA500]" />
                  Call UK office
                </a>
              </div>
            </div>
          </div>

          {/* bottom trust bar */}
          <div className="relative border-t border-white/10 px-8 md:px-12 py-4">
            <p className="text-xs md:text-[13px] text-white/70 text-center lg:text-left">
              Trusted by individuals, SMEs and exporters shipping between the UK
              and Africa • Typical response time:{" "}
              <span className="font-semibold text-white">
                same business day
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PreFooterCTA;
