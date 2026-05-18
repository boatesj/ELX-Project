import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Insights & Case Studies | Ellcworth Express",
  description:
    "Real freight operations from Ellcworth Express — air freight case studies, customs intelligence, and trade guides for UK exporters shipping to Ghana and West Africa.",
  alternates: { canonical: "https://www.ellcworth.com/insights" },
};

const caseStudies = [
  {
    slug: "uds-degree-certificates",
    tag: "Air Freight · Emergency Operation",
    title: "Race Against the Clock: Delivering UDS Degree Certificates by Air",
    subtitle:
      "University for Development Studies, Tamale, Ghana — January 2026",
    summary:
      "A UK printer delay and a hard graduation deadline. Ten cartons of secure-printed degree certificates needed to reach northern Ghana — 48 hours from warehouse to Heathrow, seven days UK to Tamale, 100% intact.",
    stats: [
      { value: "10", label: "Cartons" },
      { value: "48h", label: "Printer to Heathrow" },
      { value: "7 days", label: "UK to Ghana" },
      { value: "100%", label: "Delivered Intact" },
    ],
    route: "Grays, Essex → Heathrow → Accra Airport (ACC) → UDS Tamale",
    quote: {
      text: "I am pleased to inform you that the templates have finally arrived in the University for Development Studies, Tamale. I want to thank all stakeholders for ensuring a smooth transaction.",
      attribution: "Procurement Director, University for Development Studies — 27 January 2026",
    },
    services: [
      "Air Freight (LHR → ACC)",
      "Palletisation & Repackaging",
      "Export Documentation",
      "Ghana Customs Clearance",
      "Inland Delivery to Tamale",
    ],
    cta: {
      label: "Institutional Shipping",
      href: "/institutional",
    },
  },
  {
    slug: "university-of-ghana-80000-certificates",
    tag: "Air Freight · Planned Operation",
    title: "80,000 Certificates. Two Pallets. One Seamless Operation.",
    subtitle: "University of Ghana, Legon — March 2026",
    summary:
      "The University of Ghana's 2026 graduation season required 80,000 secure-printed certificates moved from a UK print partner to Accra. Quote agreed eight months in advance. Five days from collection to confirmed arrival at ACC. Zero complications.",
    stats: [
      { value: "80,000", label: "Certificates" },
      { value: "840kg", label: "Total Weight" },
      { value: "5 days", label: "Collection to ACC" },
      { value: "100%", label: "Delivered Intact" },
    ],
    route: "Hounslow Print Facility → Heathrow (LHR) → Accra International Airport (ACC) → UG Legon",
    quote: null,
    services: [
      "Pre-Planned Air Freight (LHR → ACC)",
      "Direct Collection — Print Facility to LHR",
      "Export Documentation & Proof of Export",
      "Photographic Proof of Collection",
      "Live Tracking Updates to UG Liaison",
    ],
    cta: {
      label: "Plan Your Shipment",
      href: "/institutional",
    },
  },
];

export default function InsightsPage() {
  return (
    <main className="bg-[#0B141A] min-h-screen">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
        <p className="text-[#FFA500] text-xs font-bold tracking-[0.3em] uppercase mb-4">
          Case Studies
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-6">
          Ellcworth Insights
        </h1>
        <p className="text-[#9A9EAB] text-base leading-relaxed max-w-2xl mx-auto">
          Real operations. Real outcomes. Freight intelligence for UK exporters
          and institutions shipping to Ghana and West Africa.
        </p>
      </section>

      {/* Case Studies */}
      <section className="max-w-5xl mx-auto px-6 pb-24 space-y-16">
        {caseStudies.map((cs, i) => (
          <article
            key={cs.slug}
            className="bg-[#111C24] border border-white/8 rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-8 pt-8 pb-6 border-b border-white/8">
              <span className="inline-block text-[#FFA500] text-xs font-bold tracking-[0.25em] uppercase mb-3">
                {cs.tag}
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-white leading-snug mb-2">
                {cs.title}
              </h2>
              <p className="text-[#9A9EAB] text-sm">{cs.subtitle}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/8 border-b border-white/8">
              {cs.stats.map((s) => (
                <div key={s.label} className="px-6 py-5 text-center">
                  <p className="text-[#FFA500] text-2xl font-bold mb-1">{s.value}</p>
                  <p className="text-[#9A9EAB] text-xs uppercase tracking-widest">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Body */}
            <div className="px-8 py-8 space-y-6">
              <p className="text-[#C8CDD6] text-sm leading-relaxed">{cs.summary}</p>

              {/* Route */}
              <div className="bg-[#0B141A] rounded-xl px-5 py-4 border border-white/8">
                <p className="text-[#FFA500] text-xs font-bold tracking-[0.2em] uppercase mb-1">
                  Shipment Route
                </p>
                <p className="text-white text-sm font-medium">{cs.route}</p>
              </div>

              {/* Services */}
              <div>
                <p className="text-white text-xs font-bold tracking-[0.2em] uppercase mb-3">
                  Services Deployed
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {cs.services.map((svc) => (
                    <li key={svc} className="flex items-start gap-2 text-[#C8CDD6] text-sm">
                      <span className="text-[#FFA500] mt-0.5">✓</span>
                      {svc}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quote */}
              {cs.quote && (
                <blockquote className="border-l-2 border-[#FFA500] pl-5 py-1">
                  <p className="text-[#C8CDD6] text-sm leading-relaxed italic mb-2">
                    &ldquo;{cs.quote.text}&rdquo;
                  </p>
                  <cite className="text-[#9A9EAB] text-xs not-italic">
                    — {cs.quote.attribution}
                  </cite>
                </blockquote>
              )}
            </div>

            {/* Footer CTA */}
            <div className="px-8 py-6 border-t border-white/8 flex items-center justify-between gap-4 flex-wrap">
              <p className="text-[#9A9EAB] text-sm">
                Running a similar operation?
              </p>
              <Link
                href={cs.cta.href}
                className="inline-block bg-[#FFA500] text-[#1A2930] px-5 py-2.5 rounded-full text-xs font-bold tracking-[0.14em] uppercase hover:opacity-90 transition"
              >
                {cs.cta.label}
              </Link>
            </div>
          </article>
        ))}
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-white/8 bg-[#111C24]">
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <p className="text-[#FFA500] text-xs font-bold tracking-[0.3em] uppercase mb-4">
            More Coming
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Vehicle shipping, sea freight, and more case studies in progress.
          </h2>
          <p className="text-[#9A9EAB] text-sm mb-8">
            In the meantime — if you have a shipment to move, we quote within 24 hours.
          </p>
          <Link
            href="/#quote"
            className="inline-block bg-[#FFA500] text-[#1A2930] px-8 py-3 rounded-full text-sm font-bold tracking-[0.14em] uppercase hover:opacity-90 transition"
          >
            Get a Quote
          </Link>
        </div>
      </section>
    </main>
  );
}
