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
  FaBolt,
  FaShieldAlt,
  FaRoute,
} from "react-icons/fa";

const SERVICES = [
  {
    id: "container",
    icon: FaShip,
    eyebrow: "FCL & LCL",
    title: "Container Shipping",
    body: "Move freight with predictable planning — full containers for scale, shared containers for efficiency.",
    highlights: [
      "FCL / LCL options",
      "Port-to-port or door solutions",
      "Milestone updates",
    ],
    bestFor: "Planned export, bulk cargo, commercial lanes, and cost control.",
  },
  {
    id: "roro",
    icon: FaCarSide,
    eyebrow: "Vehicles & Plant",
    title: "RoRo Vehicle Shipping",
    body: "Export cars and rolling equipment with disciplined handling and clear documentation guidance.",
    highlights: [
      "Regular sailings",
      "Vehicle handling care",
      "Docs and release guidance",
    ],
    bestFor: "Cars, 4×4s, vans, trucks, plant, and rolling stock.",
  },
  {
    id: "air",
    icon: FaPlaneDeparture,
    eyebrow: "Priority uplift",
    title: "Fast Air Freight",
    body: "When timelines tighten, air keeps commitments intact — fast uplift with visible progress.",
    highlights: [
      "Time-critical lanes",
      "Priority options",
      "Clear handoff checkpoints",
    ],
    bestFor: "Urgent cargo where delays are not acceptable.",
  },
  {
    id: "documents",
    icon: FaFileSignature,
    eyebrow: "Secure print & certificates",
    title: "Secure Document Logistics",
    body: "Sensitive documents handled with care and accountability — the right discipline for high-trust items.",
    highlights: [
      "Controlled handling",
      "Clear accountability",
      "Reduced risk of errors",
    ],
    bestFor: "Certificates, cheques, sensitive paperwork, secure print.",
  },
  {
    id: "repacking",
    icon: FaBoxes,
    eyebrow: "Inbound → Export-ready",
    title: "Repacking & Consolidation",
    body: "Multiple UK deliveries consolidated into one export shipment — checked, repacked, and organised.",
    highlights: [
      "Inbound checks",
      "Export-ready packing",
      "Single consolidated shipment",
    ],
    bestFor:
      "Multi-supplier orders, bulk buys, mixed cartons needing export prep.",
  },
  {
    id: "customs",
    icon: FaRegClipboard,
    eyebrow: "Paperwork & compliance",
    title: "Export & Customs Support",
    body: "Practical guidance to reduce document errors and prevent avoidable delays at origin or destination.",
    highlights: [
      "Document preparation",
      "Valuations guidance",
      "Destination readiness",
    ],
    bestFor:
      "Shippers who want fewer mistakes and smoother clearance outcomes.",
  },
];

const Pill = ({ children }) => (
  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/70 tracking-[0.14em] uppercase">
    {children}
  </span>
);

export default function Services() {
  return (
    <div className="w-full">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="bg-[#071013] bg-[radial-gradient(900px_450px_at_20%_0%,rgba(255,165,0,0.18),transparent_55%),radial-gradient(700px_420px_at_90%_10%,rgba(56,189,248,0.10),transparent_55%),radial-gradient(800px_520px_at_55%_100%,rgba(16,185,129,0.08),transparent_60%)]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-[130px] md:pt-[165px] lg:pt-[175px] pb-12 md:pb-14">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="flex flex-wrap gap-2">
                  <Pill>Service Directory</Pill>
                  <Pill>UK → West Africa</Pill>
                  <Pill>Control Tower Standards</Pill>
                </div>

                <h1 className="mt-4 text-white text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05]">
                  Choose your route. Ship with{" "}
                  <span className="text-[#FFA500]">confidence</span>.
                </h1>

                <p className="mt-4 text-sm sm:text-base text-white/70 leading-relaxed">
                  Ellcworth services are built around disciplined handling,
                  clear milestones, and practical guidance. Whether you’re
                  exporting a vehicle, freight, documents, or consolidated
                  cartons — you’ll know what happens next.
                </p>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/#booking"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FFA500] text-[#1A2930] px-6 py-3 text-sm font-semibold tracking-[0.08em] hover:opacity-95 transition shadow-[0_18px_50px_-28px_rgba(255,165,0,0.65)]"
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

                <div className="mt-7 text-[12px] text-white/55">
                  <Link to="/" className="hover:text-white/80 transition">
                    Home
                  </Link>{" "}
                  <span className="mx-2">/</span>
                  <span className="text-white/80">Services</span>
                </div>
              </div>

              {/* Executive standards panel */}
              <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 backdrop-blur px-6 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
                <p className="text-[11px] uppercase tracking-[0.26em] text-white/60">
                  The Ellcworth standard
                </p>

                <div className="mt-4 grid gap-4">
                  {[
                    {
                      icon: FaRoute,
                      title: "Visible milestones",
                      body: "Clear checkpoints so you’re never guessing what’s next.",
                    },
                    {
                      icon: FaShieldAlt,
                      title: "Careful handling",
                      body: "Disciplined processes for cargo, vehicles, and sensitive items.",
                    },
                    {
                      icon: FaBolt,
                      title: "Faster decisions",
                      body: "Practical guidance that reduces back-and-forth and delays.",
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="flex items-start gap-3">
                        <div className="mt-0.5 h-9 w-9 rounded-2xl bg-[#1A2930] border border-white/10 text-[#FFA500] flex items-center justify-center">
                          <Icon className="text-sm" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">
                            {item.title}
                          </p>
                          <p className="mt-1 text-sm text-white/65 leading-snug">
                            {item.body}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/55">
                    Preferred contact
                  </p>
                  <p className="mt-2 text-sm text-white/70">
                    For service selection and quotes, email{" "}
                    <a
                      className="text-[#FFA500] font-semibold hover:opacity-90"
                      href="mailto:cs@ellcworth.com"
                    >
                      cs@ellcworth.com
                    </a>{" "}
                    or proceed to booking.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== DIRECTORY ===== */}
      <section className="bg-[#071013]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-white text-xl md:text-2xl font-semibold tracking-tight">
                Services built for real-world shipping
              </h2>
              <p className="mt-2 text-sm text-white/65 max-w-2xl">
                Open a service to see what it’s best for, what you’ll need, and
                how we run the shipment from start to finish.
              </p>
            </div>

            <Link
              to="/#booking"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/10 transition"
            >
              Go to booking
            </Link>
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
                          <p className="text-[11px] uppercase tracking-[0.24em] text-white/55">
                            {s.eyebrow}
                          </p>
                          <p className="mt-1 text-white text-lg font-semibold leading-snug">
                            {s.title}
                          </p>
                        </div>
                      </div>

                      <div className="text-white/55 group-hover:text-[#FFA500] transition mt-1">
                        <FaArrowRight />
                      </div>
                    </div>

                    <p className="mt-3 text-sm text-white/65 leading-relaxed">
                      {s.body}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {s.highlights.map((m) => (
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
                        Best for
                      </p>
                      <p className="mt-1 text-sm text-white/70">{s.bestFor}</p>

                      <div className="mt-3 flex items-center gap-2 text-[#FFA500]">
                        <FaCheckCircle className="text-sm" />
                        <span className="text-[12px] font-semibold tracking-[0.08em]">
                          View service requirements
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* ===== Bottom CTA ===== */}
          <div className="mt-10 rounded-3xl border border-white/10 bg-gradient-to-r from-[#0E1B20] to-[#0B1118] px-6 py-7 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div>
                <p className="text-white text-lg font-semibold">
                  Not sure which service fits your shipment?
                </p>
                <p className="mt-1 text-sm text-white/65 max-w-2xl">
                  Tell us what you’re shipping, where it’s going, and your
                  timeline. We’ll recommend the best lane and the next steps —
                  quickly, clearly, professionally.
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

          {/* ===== Gentle footer note ===== */}
          <p className="mt-8 text-center text-[11px] uppercase tracking-[0.24em] text-white/40">
            Ellcworth Express · Built for reliable export operations
          </p>
        </div>
      </section>
    </div>
  );
}
