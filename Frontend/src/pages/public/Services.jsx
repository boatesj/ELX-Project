import { Link } from "react-router-dom";
import {
  FaShip,
  FaCarSide,
  FaPlaneDeparture,
  FaFileSignature,
  FaBoxes,
  FaRegClipboard,
  FaArrowRight,
  FaCheckCircle,
} from "react-icons/fa";

const SERVICES = [
  {
    id: "container",
    icon: FaShip,
    title: "Container shipping (FCL & LCL)",
    body: "Full and shared containers from the UK to key West African ports.",
    meta: ["FCL / LCL", "Port-to-port or door options", "Clear ETAs"],
  },
  {
    id: "roro",
    icon: FaCarSide,
    title: "RoRo vehicle shipping",
    body: "Cars, vans, 4×4s, trucks and plant on regular RoRo sailings.",
    meta: ["Frequent sailings", "Vehicle handling", "Docs guidance"],
  },
  {
    id: "air",
    icon: FaPlaneDeparture,
    title: "Fast air freight",
    body: "Priority options for urgent cargo that can’t wait for a vessel.",
    meta: ["Fast uplift options", "Urgent lanes", "Milestone updates"],
  },
  {
    id: "documents",
    icon: FaFileSignature,
    title: "Secure document logistics",
    body: "Certificates, cheques and other secure print handled with care.",
    meta: ["Chain-of-custody", "Secure handling", "Accountability"],
  },
  {
    id: "repacking",
    icon: FaBoxes,
    title: "Repacking & consolidation",
    body: "Multiple UK deliveries checked, repacked and shipped as one export.",
    meta: ["Inbound checks", "Export-ready packing", "Single shipment"],
  },
  {
    id: "customs",
    icon: FaRegClipboard,
    title: "Export & customs support",
    body: "Practical help with export paperwork, valuations and destination rules.",
    meta: ["Document prep", "Compliance help", "Clear instructions"],
  },
];

export default function Services() {
  return (
    <div className="w-full">
      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="bg-[#071013] bg-[radial-gradient(900px_450px_at_20%_0%,rgba(255,165,0,0.16),transparent_55%),radial-gradient(700px_420px_at_90%_10%,rgba(56,189,248,0.10),transparent_55%),radial-gradient(800px_520px_at_55%_100%,rgba(16,185,129,0.08),transparent_60%)]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-[130px] md:pt-[165px] lg:pt-[175px] pb-10 md:pb-12">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-[11px] uppercase tracking-[0.26em] text-white/60">
                  Ellcworth Express · Service Directory
                </p>

                <h1 className="mt-3 text-white text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight">
                  Freight services built for{" "}
                  <span className="text-[#FFA500]">clarity</span> — not chaos.
                </h1>

                <p className="mt-4 text-sm sm:text-base text-white/70 leading-relaxed">
                  Choose the lane that fits your shipment. You’ll get guidance,
                  careful handling and updates you can trust — from booking to
                  delivery.
                </p>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/#booking"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FFA500] text-[#1A2930] px-6 py-3 text-sm font-semibold tracking-[0.08em] hover:opacity-95 transition"
                  >
                    Book a shipment <FaArrowRight className="text-sm" />
                  </Link>

                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-[#FFA500]/60 text-[#FFA500] px-6 py-3 text-sm font-semibold tracking-[0.08em] hover:bg-[#FFA500]/10 transition"
                  >
                    Customer login
                  </Link>
                </div>
              </div>

              {/* Executive proof / promise */}
              <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 backdrop-blur px-5 py-5 shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/60">
                  Operational promise
                </p>
                <div className="mt-3 grid gap-3">
                  {[
                    "Clear milestones and updates",
                    "Guidance with export documents",
                    "Careful handling across each handoff",
                  ].map((t) => (
                    <div key={t} className="flex items-start gap-3">
                      <div className="mt-0.5 text-[#FFA500]">
                        <FaCheckCircle />
                      </div>
                      <p className="text-sm text-white/75 leading-snug">{t}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Breadcrumb-ish navigation */}
            <div className="mt-8 text-[12px] text-white/55">
              <Link to="/" className="hover:text-white/80 transition">
                Home
              </Link>{" "}
              <span className="mx-2">/</span>
              <span className="text-white/80">Services</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Service cards (polished directory) ===== */}
      <section className="bg-[#071013]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-white text-xl md:text-2xl font-semibold tracking-tight">
                Explore our services
              </h2>
              <p className="mt-2 text-sm text-white/65 max-w-2xl">
                Each service page gives you what matters: what it’s for, what
                you need to prepare, and what happens next.
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s) => {
              const Icon = s.icon;
              return (
                <Link
                  key={s.id}
                  to={`/services/${s.id}`}
                  className="
                    group rounded-3xl
                    border border-white/10
                    bg-gradient-to-b from-white/6 to-white/3
                    hover:border-[#FFA500]/40
                    hover:bg-white/5
                    transition
                    shadow-[0_18px_60px_-28px_rgba(0,0,0,0.85)]
                  "
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="h-11 w-11 rounded-2xl bg-[#1A2930] text-[#FFA500] flex items-center justify-center border border-white/10">
                          <Icon />
                        </div>
                        <div>
                          <p className="text-white font-semibold leading-snug">
                            {s.title}
                          </p>
                          <p className="mt-1 text-sm text-white/65 leading-relaxed">
                            {s.body}
                          </p>
                        </div>
                      </div>

                      <div className="text-white/55 group-hover:text-[#FFA500] transition">
                        <FaArrowRight />
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {s.meta.map((m) => (
                        <span
                          key={m}
                          className="text-[11px] px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/70"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="px-5 pb-5">
                    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-white/50">
                        Typical next step
                      </p>
                      <p className="mt-1 text-sm text-white/70">
                        View requirements → then book or request a quote.
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Bottom CTA strip */}
          <div className="mt-10 rounded-3xl border border-white/10 bg-gradient-to-r from-[#0E1B20] to-[#0B1118] px-6 py-6 shadow-[0_24px_70px_rgba(0,0,0,0.55)]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-white font-semibold">
                  Need help choosing a lane?
                </p>
                <p className="mt-1 text-sm text-white/65">
                  Tell us what you’re shipping and where it’s going — we’ll
                  recommend the best service and timeline.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/#booking"
                  className="inline-flex items-center justify-center rounded-full bg-[#FFA500] text-[#1A2930] px-6 py-3 text-sm font-semibold hover:opacity-95 transition"
                >
                  Book a shipment
                </Link>
                <a
                  href="mailto:cs@ellcworth.com"
                  className="inline-flex items-center justify-center rounded-full border border-[#FFA500]/60 text-[#FFA500] px-6 py-3 text-sm font-semibold hover:bg-[#FFA500]/10 transition"
                >
                  Email support
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
