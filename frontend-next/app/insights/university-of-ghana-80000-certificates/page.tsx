import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "80,000 Certificates. Two Pallets. One Seamless Operation.",
  description:
    "How Ellcworth Express moved 80,000 secure-printed degree certificates — 840kg across two pallets — from a UK print facility to the University of Ghana, Legon in five days.",
  alternates: {
    canonical:
      "https://www.ellcworth.com/insights/university-of-ghana-80000-certificates",
  },
  openGraph: {
    title: "80,000 Certificates. Two Pallets. One Seamless Operation.",
    description:
      "840kg. Two pallets. Five days collection to ACC. Zero complications.",
    url: "https://www.ellcworth.com/insights/university-of-ghana-80000-certificates",
    siteName: "Ellcworth Express",
    type: "article",
  },
};

const stats = [
  { value: "80,000", label: "Certificates" },
  { value: "840kg", label: "Total Weight" },
  { value: "5 days", label: "Collection to ACC" },
  { value: "100%", label: "Delivered Intact" },
];

const services = [
  "Pre-Planned Air Freight (LHR → ACC)",
  "Direct Collection — Print Facility to LHR",
  "Export Documentation & Proof of Export",
  "Photographic Proof of Collection",
  "Live Tracking Updates to UG Liaison",
];

export default function UniversityOfGhanaCaseStudy() {
  return (
    <main className="bg-[#0B141A] min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-4xl mx-auto px-6 pt-10 pb-0">
        <nav className="flex items-center gap-2 text-xs text-[#9A9EAB]">
          {/* Related destinations */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 mb-4">Related destinations</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/destinations/ghana" className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-[#1A2930] hover:border-[#FFA500] hover:text-[#FFA500] transition">Shipping to Ghana &rarr;</Link>
              <Link href="/institutional" className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-[#1A2930] hover:border-[#FFA500] hover:text-[#FFA500] transition">Institutional cargo &rarr;</Link>
            </div>
          </div>
          <Link href="/insights" className="hover:text-[#FFA500] transition">
            Insights
          </Link>
          <span>/</span>
          <span className="text-white">University of Ghana — 80,000 Certificates</span>
        </nav>
      </div>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-10 pb-12">
        <span className="inline-block text-[#FFA500] text-xs font-bold tracking-[0.25em] uppercase mb-4">
          Air Freight · Planned Operation
        </span>
        <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight tracking-tight mb-4">
          80,000 Certificates. Two Pallets. One Seamless Operation.
        </h1>
        <p className="text-[#9A9EAB] text-sm mb-8">
          University of Ghana, Legon — March 2026
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/8 border border-white/8 rounded-2xl overflow-hidden">
          {stats.map((s) => (
            <div key={s.label} className="px-6 py-6 text-center">
              <p className="text-[#FFA500] text-3xl font-bold mb-1">{s.value}</p>
              <p className="text-[#9A9EAB] text-xs uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Body */}
      <section className="max-w-4xl mx-auto px-6 pb-24 space-y-10">

        {/* The Brief */}
        <div className="space-y-4">
          <h2 className="text-white text-lg font-bold tracking-tight">The Brief</h2>
          <p className="text-[#C8CDD6] text-sm leading-relaxed">
            The University of Ghana&apos;s 2026 graduation season required 80,000 secure-printed
            certificates moved from a UK print partner to Accra. At 840kg across two pallets,
            this was a high-value, time-sensitive consignment with zero tolerance for damage
            or delay — certificates represent the academic records of thousands of graduating
            students.
          </p>
          <p className="text-[#C8CDD6] text-sm leading-relaxed">
            Unlike emergency operations, this one was planned eight months in advance. The
            university&apos;s procurement team engaged Ellcworth early, agreed rates, and
            established a clear handoff protocol. Planning time does not reduce the pressure
            on execution — if anything, it raises the bar. There is no excuse for
            complications on a job that has been in the diary for eight months.
          </p>
        </div>

        {/* Route */}
        <div className="bg-[#111C24] border border-white/8 rounded-2xl px-6 py-5">
          <p className="text-[#FFA500] text-xs font-bold tracking-[0.2em] uppercase mb-2">
            Shipment Route
          </p>
          <p className="text-white text-sm font-medium">
            Vendor Collection (UK) → Heathrow Air Freight Facility (LHR) → Accra International Airport (ACC) → UG Legon
          </p>
        </div>

        {/* The Operation */}
        <div className="space-y-4">
          <h2 className="text-white text-lg font-bold tracking-tight">The Operation</h2>
          <p className="text-[#C8CDD6] text-sm leading-relaxed">
            Ellcworth collected directly from the print facility and transferred the pallets
            to the Heathrow air freight facility — eliminating any unnecessary warehousing leg.
            Photographic proof of collection was issued to the UG liaison contact at point of
            pickup. Export documentation and proof of export were completed before the pallets
            left the vendor.
          </p>
          <p className="text-[#C8CDD6] text-sm leading-relaxed">
            The consignment moved on a direct LHR–ACC service. Live tracking updates were
            provided to the university&apos;s logistics contact throughout. From collection to
            confirmed arrival at Accra Kotoka International Airport: five days. The
            certificates were received by UG Legon without incident.
          </p>
        </div>

        {/* Services */}
        <div className="bg-[#111C24] border border-white/8 rounded-2xl px-6 py-6">
          <p className="text-white text-xs font-bold tracking-[0.2em] uppercase mb-4">
            Services Deployed
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {services.map((svc) => (
              <li key={svc} className="flex items-start gap-2 text-[#C8CDD6] text-sm">
                <span className="text-[#FFA500] mt-0.5">✓</span>
                {svc}
              </li>
            ))}
          </ul>
        </div>

        {/* Outcome */}
        <div className="space-y-4">
          <h2 className="text-white text-lg font-bold tracking-tight">The Outcome</h2>
          <p className="text-[#C8CDD6] text-sm leading-relaxed">
            80,000 certificates. 840kg. Two pallets. Five days from collection to ACC.
            Zero damage. Zero customs complications. Zero surprises. The operation delivered
            exactly what was agreed eight months earlier — which is precisely the point.
            Institutional clients need a freight partner who performs the same way whether
            the call comes in with eight months&apos; notice or eight hours&apos;.
          </p>
        </div>

        {/* CTA */}
        <div className="bg-[#111C24] border border-white/8 rounded-2xl px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-white font-bold mb-1">Planning a similar shipment?</p>
            <p className="text-[#9A9EAB] text-sm">
              Early engagement means better rates and zero last-minute pressure.
              We quote institutional shipments within 24 hours.
            </p>
          </div>
          <Link
            href="/institutional"
            className="shrink-0 inline-block bg-[#FFA500] text-[#1A2930] px-6 py-3 rounded-full text-xs font-bold tracking-[0.14em] uppercase hover:opacity-90 transition"
          >
            Plan Your Shipment
          </Link>
        </div>

        {/* Back link */}
        <div className="pt-4">
          <Link href="/insights" className="text-[#9A9EAB] text-sm hover:text-[#FFA500] transition">
            ← All case studies
          </Link>
        </div>
      </section>
    </main>
  );
}
