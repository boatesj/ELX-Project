"use client";

import Link from "next/link";

const ROUTES = [
  { flag: "🇬🇧", from: "London Gateway / Tilbury", to: "Tema Port, Ghana", days: "15–21 days" },
  { flag: "🇬🇧", from: "Grimsby / Tilbury",        to: "Apapa Port, Lagos",  days: "16–20 days" },
  { flag: "🇬🇧", from: "Sheerness",                to: "Mombasa Port, Kenya", days: "22–26 days" },
  { flag: "🇬🇧", from: "Grimsby / Tilbury",        to: "Cotonou, Benin",     days: "16–20 days" },
];

const VesselTracker = () => {
  return (
    <section id="vessel-tracker" className="w-full py-14 md:py-20 bg-[#EDECEC] scroll-mt-[120px] md:scroll-mt-[160px]" aria-label="Live vessel tracking — UK to West Africa corridor">
      <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <span className="inline-flex items-center rounded-full bg-[#1A2930] text-[#FFA500] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase mb-4">Live Vessel Activity</span>
          <h2 className="text-2xl md:text-3xl font-semibold uppercase text-[#1A2930] mb-3">UK to West Africa corridor</h2>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl">Sailings connect London Gateway, Tilbury, Sheerness and Southampton to Tema, Lagos, Mombasa and beyond. Track vessels in real time on VesselFinder.</p>
        </div>

        {/* Route cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {ROUTES.map((r) => (
            <div key={r.to} className="rounded-2xl bg-[#1A2930] text-white px-5 py-5 flex flex-col gap-3">
              <span className="text-2xl">{r.flag}</span>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">From</p>
                <p className="text-sm font-semibold">{r.from}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">To</p>
                <p className="text-sm font-semibold text-[#FFA500]">{r.to}</p>
              </div>
              <p className="text-xs text-gray-400 mt-auto">Transit: {r.days}</p>
            </div>
          ))}
        </div>

        {/* Live tracking CTA */}
        <div className="rounded-2xl border-2 border-[#1A2930] bg-white px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#FFA500] animate-pulse" />
              <span className="text-xs font-semibold tracking-[0.16em] uppercase text-[#1A2930]">Live AIS data — powered by VesselFinder</span>
            </div>
            <p className="text-sm text-gray-600 max-w-md">Track vessels currently operating on our routes in real time — position, speed, ETA and port call data.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <a href="https://www.vesselfinder.com/ports/GHTEM000" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1A2930] text-white px-5 py-3 text-xs font-bold uppercase tracking-widest hover:brightness-110 transition whitespace-nowrap">
              Tema Port live →
            </a>
            <a href="https://www.vesselfinder.com/ports/NGAPP000" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#1A2930] text-[#1A2930] px-5 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#1A2930] hover:text-white transition whitespace-nowrap">
              Apapa Port live →
            </a>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a href="/#quote" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1A2930] hover:text-[#FFA500] transition tracking-[0.12em]">
            Get a quote for the next available sailing →
          </a>
        </div>
      </div>
    </section>
  );
};

export default VesselTracker;
