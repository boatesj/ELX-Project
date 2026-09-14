"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_BASE_URL } from "../lib/customerAuth";

const API_V1 = `${API_BASE_URL}/api/v1`;

type Rate = {
  _id: string;
  destination: string;
  service: string;
  label: string;
  priceFrom: number;
  currency: string;
  unit: string;
  updatedAt: string;
  isActive: boolean;
};

const DESTINATIONS = [
  { id: "ghana",       label: "Ghana",         port: "Tema Port",              flag: "\u{1F1EC}\u{1F1ED}" },
  { id: "nigeria",     label: "Nigeria",        port: "Apapa Port, Lagos",      flag: "\u{1F1F3}\u{1F1EC}" },
  { id: "kenya",       label: "Kenya",          port: "Mombasa Port",           flag: "\u{1F1F0}\u{1F1EA}" },
  { id: "sierra-leone",label: "Sierra Leone",   port: "Freetown QEII Quay",     flag: "\u{1F1F8}\u{1F1F1}" },
  { id: "cote-divoire",label: "Côte d'Ivoire", port: "Abidjan Port Autonome", flag: "\u{1F1E8}\u{1F1EE}" },
];

const SERVICE_ORDER = ["roro", "fcl20", "fcl40", "lcl", "air"];
const SERVICE_LABEL: Record<string, string> = {
  roro:  "RoRo vehicle shipping",
  fcl20: "FCL 20ft container",
  fcl40: "FCL 40ft container",
  lcl:   "LCL groupage",
  air:   "Air freight",
};

function formatPrice(price: number, currency: string) {
  const symbol = currency === "GBP" ? "£" : currency + " ";
  return `${symbol}${price.toLocaleString("en-GB")}`;
}

function formatDate(iso: string) {
  try { return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }); }
  catch { return ""; }
}

export default function PricingClient() {
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ghana");

  useEffect(() => {
    Promise.all(
      DESTINATIONS.map((d) =>
        fetch(`${API_V1}/rates?destination=${d.id}`)
          .then((r) => r.ok ? r.json() : [])
          .catch(() => [])
      )
    ).then((results) => {
      const all = results.flat().filter((r: Rate) => r.isActive !== false);
      setRates(all);
      setLoading(false);
    });
  }, []);

  const destRates = rates
    .filter((r) => r.destination === activeTab)
    .sort((a, b) => SERVICE_ORDER.indexOf(a.service) - SERVICE_ORDER.indexOf(b.service));

  const lastUpdated = destRates[0]?.updatedAt ? formatDate(destRates[0].updatedAt) : null;
  const dest = DESTINATIONS.find((d) => d.id === activeTab)!;

  return (
    <div>
      {/* Destination tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {DESTINATIONS.map((d) => (
          <button key={d.id} onClick={() => setActiveTab(d.id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition ${
              activeTab === d.id
                ? "bg-[#1A2930] text-white border-[#1A2930]"
                : "bg-white text-[#1A2930] border-gray-200 hover:border-[#1A2930]"
            }`}>
            <span>{d.flag}</span>{d.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="rounded-2xl border border-gray-200 bg-gray-50 p-6 animate-pulse">
              <div className="h-3 w-24 bg-gray-200 rounded mb-3" />
              <div className="h-8 w-32 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : destRates.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 px-6 py-10 text-center">
          <p className="text-gray-500 text-sm">Rates for {dest.label} are being updated. <Link href="/#quote" className="text-[#FFA500] font-semibold">Request a quote directly.</Link></p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {destRates.map((rate) => (
              <div key={rate._id} className="rounded-2xl border border-gray-200 bg-white px-6 py-6 flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#FFA500]">{SERVICE_LABEL[rate.service] || rate.service}</p>
                <p className="text-3xl font-bold text-[#1A2930]">{formatPrice(rate.priceFrom, rate.currency)}</p>
                <p className="text-sm text-gray-500">{rate.unit}</p>
                <p className="text-xs text-gray-400 mt-2">To {dest.port}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-100">
            <div>
              {lastUpdated && <p className="text-xs text-gray-400">Rates last reviewed: {lastUpdated}. Indicative only — confirmed at booking.</p>}
              <p className="text-xs text-gray-400 mt-0.5">All rates are from UK ports. Transit times, insurance and customs fees are additional.</p>
            </div>
            <Link href={`/destinations/${activeTab}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#1A2930] px-5 py-2.5 text-sm font-semibold text-[#1A2930] hover:bg-[#1A2930] hover:text-white transition whitespace-nowrap">
              {dest.label} full guide →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
