"use client";

import { useEffect, useMemo, useState } from "react";
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
};

const SERVICE_ORDER = ["roro", "fcl20", "fcl40", "lcl", "air"];

function formatPrice(priceFrom: number, currency: string) {
  const symbol = currency === "GBP" ? "£" : currency + " ";
  return `${symbol}${priceFrom.toLocaleString("en-GB")}`;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return "";
  }
}

export default function InstantQuoteEstimate({ destination }: { destination: string }) {
  const [rates, setRates] = useState<Rate[]>([]);
  const [selectedService, setSelectedService] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    fetch(`${API_V1}/rates?destination=${encodeURIComponent(destination)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch rates");
        return res.json();
      })
      .then((data: Rate[]) => {
        if (cancelled) return;
        const sorted = [...data].sort(
          (a, b) => SERVICE_ORDER.indexOf(a.service) - SERVICE_ORDER.indexOf(b.service)
        );
        setRates(sorted);
        if (sorted.length) setSelectedService(sorted[0].service);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [destination]);

  const activeRate = useMemo(
    () => rates.find((r) => r.service === selectedService) || null,
    [rates, selectedService]
  );

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-[#F9FAFB] px-6 py-6 animate-pulse">
        <div className="h-4 w-40 bg-gray-200 rounded mb-4" />
        <div className="h-8 w-32 bg-gray-200 rounded" />
      </div>
    );
  }

  if (error || rates.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-[#F9FAFB] px-6 py-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#FFA500] mb-4">
        Get an instant estimate
      </p>

      <label className="block text-xs font-medium text-gray-600 mb-1.5" htmlFor="instant-quote-service">
        Service
      </label>
      <select
        id="instant-quote-service"
        value={selectedService}
        onChange={(e) => setSelectedService(e.target.value)}
        className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FFA500]/80 mb-5"
      >
        {rates.map((r) => (
          <option key={r.service} value={r.service}>
            {r.label}
          </option>
        ))}
      </select>

      {activeRate && (
        <>
          <p className="text-3xl font-bold text-[#1A2930]">
            {formatPrice(activeRate.priceFrom, activeRate.currency)}
          </p>
          <p className="text-sm text-gray-500 mt-1">{activeRate.unit}</p>

          <div className="mt-5 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 leading-relaxed">
              Indicative rate, confirmed at booking.
              <br />
              Rates reviewed {formatDate(activeRate.updatedAt)}.
            </p>
          </div>

          
            href="/#quote"
            className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#FFA500] text-black px-6 py-3 text-sm font-semibold tracking-[0.1em] uppercase hover:bg-[#ffb733] transition"
          >
            Confirm this quote
          </a>
        </>
      )}
    </div>
  );
}
