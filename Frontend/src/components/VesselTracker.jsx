const TEMA_URL =
  "https://www.marinetraffic.com/en/ais/embed/maptype:1/mmsi:0/vesselid:0/zoom:10/mapzoom:10/lat:5.6037/lon:-0.0167/width:100%25/height:400/shownames:false/eta_prediction:false/startport:0/landmass:1/fleet:0/fleet_id:0/clickevent:0";

const WEST_AFRICA_URL =
  "https://www.marinetraffic.com/en/ais/embed/maptype:1/mmsi:0/vesselid:0/zoom:6/mapzoom:6/lat:5.0/lon:-1.0/width:100%25/height:400/shownames:false/eta_prediction:false/startport:0/landmass:1/fleet:0/fleet_id:0/clickevent:0";

import { useState } from "react";

const VesselTracker = () => {
  const [wideView, setWideView] = useState(false);

  return (
    <section
      id="vessel-tracker"
      className="
        w-full
        py-14 md:py-20
        bg-[#EDECEC]
        scroll-mt-[120px] md:scroll-mt-[160px]
      "
      aria-label="Live vessel tracking — UK to West Africa corridor"
    >
      <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-8 md:mb-10">
          <span className="inline-flex items-center rounded-full bg-[#1A2930] text-[#FFA500] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase mb-4">
            Live Vessel Activity
          </span>
          <h2 className="text-2xl md:text-3xl font-semibold uppercase text-[#1A2930] mb-3">
            UK to West Africa corridor
          </h2>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl">
            Track vessels currently operating on the routes we work with.
            Sailings connect Tilbury, Sheerness and Southampton to Tema, Lagos
            and beyond.
          </p>
        </div>

        {/* Map frame */}
        <div className="rounded-2xl overflow-hidden border-2 border-[#1A2930] shadow-lg">
          {/* Branded header strip */}
          <div className="bg-[#1A2930] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#FFA500] animate-pulse" />
              <span className="text-xs font-semibold tracking-[0.16em] uppercase text-white">
                Live — Powered by MarineTraffic
              </span>
            </div>

            {/* Toggle */}
            <button
              type="button"
              onClick={() => setWideView((v) => !v)}
              className="
                text-[11px] font-semibold tracking-[0.14em] uppercase
                rounded-full border border-white/20 bg-white/10
                px-3 py-1 text-white
                hover:bg-white/20 transition
              "
            >
              {wideView ? "Tema Port view" : "Wider West Africa view"}
            </button>
          </div>

          <iframe
            key={wideView ? "wide" : "tema"}
            src={wideView ? WEST_AFRICA_URL : TEMA_URL}
            title="Live vessel tracking — UK to West Africa"
            width="100%"
            height="400"
            loading="lazy"
            className="block w-full border-0"
            allowFullScreen
          />
        </div>

        {/* CTA below map */}
        <div className="mt-6 text-center">
          
            href="#quote"
            className="
              inline-flex items-center gap-2
              text-sm font-semibold text-[#1A2930]
              hover:text-[#FFA500] transition
              tracking-[0.12em]
            "
          >
            Get a quote for the next available sailing →
          </a>
        </div>
      </div>
    </section>
  );
};

export default VesselTracker;
