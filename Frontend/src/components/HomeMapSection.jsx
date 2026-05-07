import { Link } from "react-router-dom";
import MapEmbed, { PORTS, ORIGIN_COLOUR, DESTINATION_COLOUR } from "./MapEmbed";

const DESTINATIONS = PORTS.filter((p) => p.type === "Destination");

const HomeMapSection = () => (
  <section className="w-full bg-[#0B141A] py-16 md:py-20">
    <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
        <div>
          <span className="inline-flex items-center rounded-full border border-[#FFA500]/60 bg-[#FFA500]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#FFA500] mb-4">
            Live Network
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Our shipment network
          </h2>
          <p className="mt-2 text-sm text-[#9A9EAB] max-w-lg leading-relaxed">
            7 UK departure ports. 6 Africa destinations. Every dashed line is a
            route we run — regularly, reliably, on record.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ background: ORIGIN_COLOUR }} />
            <span className="text-xs text-[#9A9EAB]">UK origin ports</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ background: DESTINATION_COLOUR }} />
            <span className="text-xs text-[#9A9EAB]">Africa destinations</span>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="w-full rounded-2xl overflow-hidden border border-white/10 shadow-[0_16px_48px_rgba(0,0,0,0.4)]">
        <MapEmbed height="420px" zoom={2.2} />
      </div>

      {/* Destination chips */}
      <div className="mt-6 flex flex-wrap gap-2">
        {DESTINATIONS.map((d) => (
          <span
            key={d.id}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80"
          >
            <span>{d.flag}</span>
            {d.name}
          </span>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
        <Link
          to="/map"
          className="inline-flex items-center justify-center rounded-full bg-[#FFA500] text-[#1A2930] px-6 py-3 text-sm font-bold tracking-[0.14em] uppercase hover:opacity-90 transition shadow-md"
        >
          Explore full map →
        </Link>
        <span className="text-xs text-[#9A9EAB]">
          Click any port marker for details on routes, cargo types and sailing frequency.
        </span>
      </div>
    </div>
  </section>
);

export default HomeMapSection;
