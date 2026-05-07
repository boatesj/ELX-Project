import { useRef } from "react";
import { Helmet } from "react-helmet-async";
import MapEmbed, {
  PORTS,
  ORIGIN_COLOUR,
  DESTINATION_COLOUR,
} from "@/components/MapEmbed";

const ShipmentMap = () => {
  return (
    <div className="bg-[#0B141A] min-h-screen">
      <Helmet>
        <title>Africa Shipment Map | Ellcworth Express Ltd</title>
        <meta
          name="description"
          content="Ellcworth Express port connections — UK departure points and West Africa destinations including Tema, Lagos, Mombasa and more."
        />
        <link rel="canonical" href="https://www.ellcworth.com/map" />
      </Helmet>

      <section className="relative w-full bg-[#1A2930] text-white py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,165,0,0.08),transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <span className="inline-flex items-center rounded-full border border-[#FFA500] bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-100 mb-5">
            Live Network
          </span>
          <h1 className="text-3xl md:text-4xl font-semibold uppercase mb-4">
            Our port connections
          </h1>
          <p className="text-gray-300 max-w-xl text-base md:text-lg leading-relaxed">
            UK departure ports and West Africa destinations. Click any marker
            for details.
          </p>
          <div className="flex flex-wrap gap-6 mt-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FFA500] inline-block" />
              <span className="text-sm text-gray-300">UK origin ports</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#38BDF8] inline-block" />
              <span className="text-sm text-gray-300">Africa destinations</span>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full h-[600px]">
        <MapEmbed height="600px" zoom={2.4} />
      </section>

      <section className="py-16 bg-[#0B141A]">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <h2 className="text-xl font-semibold uppercase text-white mb-8">
            All ports &amp; connections
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {PORTS.map((port) => {
              const isOrigin = port.type === "Origin";
              const colour = isOrigin ? ORIGIN_COLOUR : DESTINATION_COLOUR;
              return (
                <div
                  key={port.id}
                  className="rounded-2xl border border-white/10 bg-[#1A2930] px-5 py-5 flex gap-4"
                >
                  <span className="text-2xl flex-shrink-0">{port.flag}</span>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-white text-sm">
                        {port.name}
                      </p>
                      <span
                        className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                        style={{
                          color: colour,
                          background: `${colour}18`,
                          border: `1px solid ${colour}44`,
                        }}
                      >
                        {port.type}
                      </span>
                    </div>
                    <p className="text-xs text-[#9A9EAB] leading-relaxed">
                      {port.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-12 bg-[#1A2930]">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-xl md:text-2xl font-semibold uppercase text-white mb-3">
            Shipping to one of these ports?
          </h2>

          <p className="text-gray-300 text-sm mb-6">Get a quote in 24 hours.</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:cs@ellcworth.com"
              className="inline-flex items-center justify-center rounded-full bg-[#FFA500] text-black px-8 py-3 text-sm font-semibold tracking-[0.14em] uppercase hover:bg-[#ffb733] transition shadow-md"
            >
              cs@ellcworth.com
            </a>

            <a
              href="/#quote"
              className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/5 text-white px-8 py-3 text-sm font-semibold tracking-[0.14em] uppercase hover:bg-white/10 transition"
            >
              Get a Quote
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ShipmentMap;
