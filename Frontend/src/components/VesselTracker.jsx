import { useState } from "react";

const VIEWS = {
  tema: {
    label: "Tema Port",
    src: "https://www.vesselfinder.com/aismap?zoom=11&lat=5.6037&lon=-0.0167&width=100%25&height=400&names=false",
  },
  westAfrica: {
    label: "West Africa",
    src: "https://www.vesselfinder.com/aismap?zoom=5&lat=5.0&lon=-1.0&width=100%25&height=400&names=false",
  },
};

const VesselTracker = () => {
  const [view, setView] = useState("tema");

  return (
    <section
      id="vessel-tracker"
      className="w-full py-14 md:py-20 bg-[#EDECEC] scroll-mt-[120px] md:scroll-mt-[160px]"
      aria-label="Live vessel tracking — UK to West Africa corridor"
    >
      <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <span className="inline-flex items-center rounded-full bg-[#1A2930] text-[#FFA500] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase mb-4">
            Live Vessel Activity
          </span>
          <h2 className="text-2xl md:text-3xl font-semibold uppercase text-[#1A2930] mb-3">
            UK to West Africa corridor
          </h2>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl">
            Track vessels currently operating on the routes we work with.
            Sailings connect London Gateway, Tilbury, Sheerness, Teesport and
            Southampton to Tema, Lagos and beyond.
          </p>
        </div>

        <div className="rounded-2xl overflow-hidden border-2 border-[#1A2930] shadow-lg">
          <div className="bg-[#1A2930] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#FFA500] animate-pulse" />
              <span className="text-xs font-semibold tracking-[0.16em] uppercase text-white">
                Live — Powered by VesselFinder
              </span>
            </div>
            <button
              type="button"
              onClick={() =>
                setView((v) => (v === "tema" ? "westAfrica" : "tema"))
              }
              className="text-[11px] font-semibold tracking-[0.14em] uppercase rounded-full border border-white/20 bg-white/10 px-3 py-1 text-white hover:bg-white/20 transition"
            >
              {view === "tema" ? "Wider West Africa view" : "Tema Port view"}
            </button>
          </div>

          <iframe
            key={view}
            src={VIEWS[view].src}
            title="Live vessel tracking — UK to West Africa"
            width="100%"
            height="400"
            loading="lazy"
            className="block w-full border-0"
            allowFullScreen
          />
        </div>

        <div className="mt-6 text-center">
          <a
            href="#quote"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#1A2930] hover:text-[#FFA500] transition tracking-[0.12em]"
          >
            Get a quote for the next available sailing →
          </a>
          <a
            href="https://www.vesselfinder.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#1A2930] transition tracking-[0.12em]"
          >
            Search a vessel on VesselFinder →
          </a>
        </div>
      </div>
    </section>
  );
};

export default VesselTracker;
