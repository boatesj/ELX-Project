import { useState } from "react";
import { FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import ContentBlockPanel from "./ContentBlockPanel";

const OPS_EMAIL = "info@ellcworth.com";
const UK_PHONE_DISPLAY = "+44 208 979 6054";
const UK_PHONE_TEL = "+442089796054";

const PreFooterCTA = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(OPS_EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch (err) {
      console.warn("Clipboard copy failed:", err);
    }
  };

  return (
    <section
      id="contact"
      className="w-full bg-white border-t border-[#9A9EAB]/30 scroll-mt-24"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-14 md:py-16">
        <div className="relative overflow-hidden rounded-2xl bg-[#1A2930] text-white shadow-xl">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 18% 28%, rgba(255,165,0,0.45) 0, rgba(255,165,0,0) 42%), radial-gradient(circle at 82% 62%, rgba(255,255,255,0.12) 0, rgba(255,255,255,0) 48%)",
            }}
          />

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 p-8 md:p-12">
            {/* LEFT: message */}
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

              <ul className="mt-6 space-y-2 text-sm text-white/75">
                <li>• Clear quotations before booking</li>
                <li>• Dedicated UK–Africa logistics specialists</li>
                <li>• Structured updates from collection to delivery</li>
              </ul>

              {/* Direct contacts */}
              <div className="mt-7 text-[12px] text-white/70">
                <p className="font-semibold text-white/90">Direct contacts</p>
                <p className="mt-1">
                  Email:{" "}
                  <span className="font-mono text-white">{OPS_EMAIL}</span>
                </p>
                <p>
                  Phone:{" "}
                  <span className="font-mono text-white">
                    {UK_PHONE_DISPLAY}
                  </span>
                </p>
              </div>
            </div>

            {/* RIGHT: operational bulletin + CTAs */}
            <div className="flex flex-col justify-center gap-4 w-full max-w-md">
              {/* ✅ Operational bulletin sits “balanced” in the right column */}
              <div className="rounded-2xl border border-white/10 bg-black/15 backdrop-blur px-4 py-4 shadow-[0_18px_60px_-40px_rgba(0,0,0,0.8)]">
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/60 font-semibold">
                  Operational bulletin
                </p>
                <div className="mt-3">
                  <ContentBlockPanel
                    contentKey="weekly_sailings"
                    tone="dark"
                    compact={false}
                    titleOverride="Weekly sailings & cut-off guidance"
                    className="bg-white/5"
                  />
                </div>
              </div>

              <a
                href="/#quote"
                className="inline-flex items-center justify-center rounded-lg bg-[#FFA500] text-[#1A2930] px-6 py-3 text-base font-bold shadow-lg shadow-black/30 transition hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFA500]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2930]"
              >
                Get a shipping quote
              </a>

              <div className="flex gap-3 flex-wrap">
                <a
                  href={`mailto:${OPS_EMAIL}?subject=${encodeURIComponent(
                    "Shipping enquiry — Ellcworth Express"
                  )}`}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-white/10 text-white px-5 py-2.5 text-sm font-semibold border border-white/20 hover:bg-white/15 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2930]"
                >
                  <FaEnvelope className="text-[#FFA500]" />
                  Email logistics team
                </a>

                <a
                  href={`tel:${UK_PHONE_TEL}`}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-white/10 text-white px-5 py-2.5 text-sm font-semibold border border-white/20 hover:bg-white/15 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2930]"
                >
                  <FaPhoneAlt className="text-[#FFA500]" />
                  Call UK office
                </a>
              </div>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="inline-flex items-center justify-center rounded-lg bg-white/5 text-white px-5 py-2.5 text-sm font-semibold border border-white/15 hover:bg-white/10 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2930]"
                title="Copy email address"
              >
                {copied ? "Email copied ✓" : "Copy email address"}
              </button>
            </div>
          </div>

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
