import {
  FaShip,
  FaCarSide,
  FaPlaneDeparture,
  FaFileSignature,
  FaRegClipboard,
  FaBoxes,
} from "react-icons/fa";

const DESTINATIONS = [
  {
    id: "containers",
    badge: "Container shipping",
    title: "Full & shared containers to West Africa",
    body: "For commercial cargo and household moves that need reliable sailings, export guidance, and clear communication.",
    routes: ["Tema · Takoradi", "Lagos (Apapa / Tin Can)", "Freetown · Banjul"],
    ctaLabel: "View container routes",
    icon: FaShip,
  },
  {
    id: "roro",
    badge: "RoRo vehicle shipping",
    title: "Cars, vans & trucks on regular RoRo sailings",
    body: "Ideal for single vehicles and trade customers who need predictable, port-to-port movements.",
    routes: ["Tema", "Lagos", "Cotonou", "Abidjan"],
    ctaLabel: "Check RoRo options",
    icon: FaCarSide,
  },
  {
    id: "air",
    badge: "Air freight",
    title: "Priority air freight when timing matters",
    body: "Smaller but urgent shipments that need to reach teams or customers in days, not weeks.",
    routes: ["Accra", "Lagos", "Nairobi"],
    ctaLabel: "Explore air routes",
    icon: FaPlaneDeparture,
  },
  {
    id: "documents",
    badge: "Secure documents",
    title: "Certificates, cheques & other secure print",
    body: "Built for institutions and banks that need tamper-evident, signed-for document movements.",
    routes: ["Universities", "Professional bodies", "Financial institutions"],
    ctaLabel: "Secure document support",
    icon: FaFileSignature,
  },
  {
    id: "repacking",
    badge: "Repacking & consolidation",
    title: "Consolidate multiple suppliers into one export",
    body: "Send UK deliveries to our warehouse; we’ll check, photograph, repack and ship as a single export.",
    routes: ["UK warehouse → West Africa", "Personal effects & e-commerce"],
    ctaLabel: "Arrange consolidation",
    icon: FaBoxes,
  },
  {
    id: "customs",
    badge: "Export & customs support",
    title: "Smooth clearance for UK exports to Africa",
    body: "We help you prepare compliant export paperwork—EORI checks, valuations, vehicle docs, commercial invoices and destination rules—so your shipment moves without unnecessary delays.",
    routes: ["Ghana · Nigeria", "Sierra Leone", "Benin · Côte d’Ivoire"],
    ctaLabel: "Get customs guidance",
    icon: FaRegClipboard,
  },
];

const KeyDestinations = () => {
  return (
    <section
      id="services"
      className="
        w-full
        bg-gradient-to-b from-[#1A2930] via-[#9A9EAB] to-[#F3F4F6]
        py-14 md:py-20
        border-t border-slate-700
        scroll-mt-[120px] md:scroll-mt-[160px]
      "
      aria-label="Key destinations and services"
    >
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-10 max-w-3xl">
          <span className="inline-flex items-center rounded-full bg-[#1A2930] text-[#FFA500] px-3 py-1 text-[11px] md:text-xs font-semibold tracking-[0.16em] uppercase mb-3">
            Step 2 · Destinations & services
          </span>
          <h2 className="text-3xl md:text-[2.5rem] font-semibold tracking-tight text-white mb-3 uppercase">
            Key destinations & services
          </h2>
          <p className="text-base md:text-lg text-slate-200">
            From single vehicles to secure documents and full containers,
            Ellcworth connects UK shippers to high-demand African routes with
            steady, transparent updates.
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-6 md:gap-7 md:grid-cols-2 lg:grid-cols-3">
          {DESTINATIONS.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.id}
                className="
                  group
                  flex flex-col
                  rounded-2xl
                  border border-slate-700/70
                  bg-slate-900/80
                  p-5 md:p-6
                  shadow-[0_18px_40px_rgba(15,23,42,0.65)]
                  transition
                  hover:-translate-y-1.5
                  hover:shadow-[0_26px_55px_rgba(15,23,42,0.9)]
                  hover:border-[#FFA500]/80
                "
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="inline-flex items-center rounded-full bg-[#1A2930] text-[#F9FAFB] px-3 py-1 text-[11px] md:text-xs font-semibold tracking-[0.14em] uppercase">
                    {item.badge}
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0f172a] text-[#FFA500] shadow-inner shadow-black/40">
                    <Icon className="text-lg" />
                  </div>
                </div>

                <h3 className="text-base md:text-xl font-semibold tracking-tight text-white mb-2">
                  {item.title}
                </h3>

                <p className="text-sm md:text-[15px] leading-relaxed text-slate-200 mb-4">
                  {item.body}
                </p>

                <div className="mb-4">
                  <p className="text-[11px] md:text-xs font-semibold text-slate-400 uppercase tracking-[0.18em] mb-1.5">
                    Typical destinations
                  </p>
                  <ul className="space-y-1.5 text-sm md:text-base text-slate-100">
                    {item.routes.map((route) => (
                      <li key={route} className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#FFA500]" />
                        <span>{route}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto pt-2">
                  <a
                    href="#quote"
                    className="
                      inline-flex items-center text-sm md:text-[15px] font-semibold
                      text-[#FFA500]
                      group-hover:text-[#ffd27a]
                      transition
                    "
                  >
                    {item.ctaLabel}
                    <span className="ml-1.5 text-base md:text-lg translate-y-[1px] group-hover:translate-x-0.5 transition-transform">
                      →
                    </span>
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default KeyDestinations;
