import { FaPhoneAlt, FaEnvelope } from "react-icons/fa";

const PreFooterCTA = () => {
  return (
    <section className="w-full bg-[#FFA500] text-[#1A2930] border-t border-[#9A9EAB]/30">
      <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8 py-8 md:py-10">
        <div className="relative overflow-hidden rounded-2xl bg-[#FFA500]">
          {/* subtle internal pattern (no external dependency) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 18% 25%, rgba(26,41,48,0.55) 0, rgba(26,41,48,0) 46%), radial-gradient(circle at 80% 55%, rgba(26,41,48,0.45) 0, rgba(26,41,48,0) 52%)",
            }}
          />

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-5 p-6 md:p-8">
            {/* Message */}
            <div className="text-center md:text-left">
              <p className="text-[11px] md:text-xs font-semibold uppercase tracking-[0.2em] text-[#1A2930]/80">
                Support you can trust
              </p>
              <h3 className="mt-1 text-lg md:text-2xl font-extrabold tracking-tight">
                Need help with a shipment?
              </h3>
              <p className="text-sm md:text-[15px] text-[#1A2930]/90 mt-2 max-w-xl">
                We’ll guide you with routes, pricing and paperwork — from
                booking to delivery.
              </p>
            </div>

            {/* CTA buttons */}
            <div className="flex items-center gap-3 flex-wrap justify-center md:justify-end">
              {/* Email */}
              <a
                href="mailto:info@ellcworth.com"
                className="inline-flex items-center gap-2 rounded-full bg-[#1A2930] text-[#FFA500] px-5 py-2.5 text-sm md:text-base font-semibold shadow-md shadow-black/30 transition hover:bg-[#121c23] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A2930]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFA500]"
              >
                <FaEnvelope className="text-[15px] text-[#FFA500]" />
                Email us
              </a>

              {/* Call (now high contrast vs orange section) */}
              <a
                href="tel:+442089796054"
                className="inline-flex items-center gap-2 rounded-full bg-white text-[#1A2930] px-5 py-2.5 text-sm md:text-base font-semibold shadow-md shadow-black/30 transition hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFA500]"
              >
                <FaPhoneAlt className="text-[15px] text-[#1A2930]" />
                Call us
              </a>
            </div>
          </div>

          {/* micro reassurance row */}
          <div className="relative border-t border-[#1A2930]/15 px-6 md:px-8 py-3">
            <p className="text-xs md:text-[13px] text-[#1A2930]/80 text-center md:text-left">
              Typical response time:{" "}
              <span className="font-semibold">same day</span> • Clear updates •
              UK–Africa specialists
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PreFooterCTA;
