"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "../lib/customerAuth";

const API_V1 = `${API_BASE_URL}/api/v1`;

type Sailing = {
  _id: string;
  mode: "sea" | "roro" | "air";
  vesselOrRoute: string;
  departurePort: string;
  destinationPort: string;
  destination: string;
  closingDate: string;
  departureDate: string;
  eta: string | null;
  frequency: "once" | "daily" | "weekly" | "twice-weekly";
  spacesLabel: string;
  notes: string;
};

const FREQ_LABEL: Record<string, string> = {
  daily: "Daily departures",
  weekly: "Weekly departures",
  "twice-weekly": "Twice-weekly departures",
};

const MODE_TABS = [
  { id: "all", label: "All sailings" },
  { id: "sea", label: "Sea freight" },
  { id: "roro", label: "RoRo vehicles" },
  { id: "air", label: "Air freight" },
];

const MODE_CHIP: Record<string, string> = {
  sea:  "bg-sky-500/15 text-sky-300 border border-sky-500/40",
  roro: "bg-violet-500/15 text-violet-300 border border-violet-500/40",
  air:  "bg-amber-500/15 text-amber-300 border border-amber-500/40",
};

const MODE_LABEL: Record<string, string> = {
  sea: "Sea", roro: "RoRo", air: "Air",
};

function fmt(iso: string) {
  if (!iso) return "TBA";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function daysUntil(iso: string) {
  const diff = Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
  if (diff <= 0) return null;
  if (diff === 1) return "Closes tomorrow";
  if (diff <= 7) return `Closes in ${diff} days`;
  return null;
}

const VesselTracker = () => {
  const [sailings, setSailings] = useState<Sailing[]>([]);
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_V1}/sailings`)
      .then((r) => r.ok ? r.json() : [])
      .then(setSailings)
      .catch(() => setSailings([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = tab === "all" ? sailings : sailings.filter((s) => s.mode === tab);

  return (
    <section id="vessel-tracker" className="w-full py-14 md:py-20 bg-[#1A2930] scroll-mt-[120px] md:scroll-mt-[160px]" aria-label="Upcoming sailings — UK to West Africa">
      <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 md:mb-10">
          <span className="inline-flex items-center rounded-full bg-[#FFA500]/10 text-[#FFA500] border border-[#FFA500]/30 px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase mb-4">
            Confirmed sailings
          </span>
          <h2 className="text-2xl md:text-3xl font-semibold uppercase text-white mb-3">Upcoming departures</h2>
          <p className="text-sm md:text-base text-gray-400 max-w-2xl">Sea freight, RoRo vehicle shipping and air freight from the UK to West Africa. Sailings confirmed as spaces are allocated.</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {MODE_TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition ${
                tab === t.id
                  ? "bg-[#FFA500] text-black border-[#FFA500]"
                  : "bg-transparent text-gray-400 border-white/10 hover:border-white/30 hover:text-white"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map((i) => (
              <div key={i} className="rounded-2xl border border-white/5 bg-white/5 p-6 animate-pulse h-48" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-12 text-center">
            <p className="text-gray-400 text-sm mb-4">No confirmed sailings posted yet for this service.</p>
            <a href="/#quote" className="inline-flex items-center gap-2 rounded-full bg-[#FFA500] px-6 py-3 text-xs font-bold text-black uppercase tracking-widest hover:brightness-110 transition">
              Enquire about availability →
            </a>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((s) => {
              const urgent = daysUntil(s.closingDate);
              return (
                <div key={s._id} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-5 flex flex-col gap-3 hover:border-[#FFA500]/30 transition">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${MODE_CHIP[s.mode]}`}>
                      {MODE_LABEL[s.mode]}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      s.spacesLabel === "Limited" ? "bg-amber-500/15 text-amber-300" :
                      s.spacesLabel === "Full" ? "bg-red-500/15 text-red-300" :
                      "bg-emerald-500/15 text-emerald-300"
                    }`}>
                      {s.spacesLabel}
                    </span>
                  </div>

                  <div>
                    <p className="font-semibold text-white text-sm">{s.vesselOrRoute}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.departurePort} → {s.destinationPort}</p>
                  </div>

                  <div className="space-y-1 text-xs text-gray-500">
                    <div className="flex justify-between">
                      <span>Booking closes</span>
                      <span className="text-gray-300">{fmt(s.closingDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Departure</span>
                      <span className="text-gray-300">
                        {s.frequency && s.frequency !== "once"
                          ? FREQ_LABEL[s.frequency] || s.frequency
                          : fmt(s.departureDate)}
                      </span>
                    </div>
                    {s.eta && (
                      <div className="flex justify-between">
                        <span>ETA</span>
                        <span className="text-gray-300">{fmt(s.eta)}</span>
                      </div>
                    )}
                  </div>

                  {s.notes && <p className="text-xs text-gray-600">{s.notes}</p>}

                  {urgent && (
                    <p className="text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5">
                      ⚠️ {urgent}
                    </p>
                  )}

                  <a href="/#quote"
                    className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#FFA500] px-4 py-2.5 text-xs font-bold text-black uppercase tracking-widest hover:brightness-110 transition">
                    Book space →
                  </a>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-600">Sailings are posted as spaces are confirmed. Contact us for availability on specific dates.</p>
          <a href="mailto:cs@ellcworth.com" className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-[#FFA500] transition">
            cs@ellcworth.com →
          </a>
        </div>
      </div>
    </section>
  );
};

export default VesselTracker;
