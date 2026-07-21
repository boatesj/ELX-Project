import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Race Against the Clock: UDS Degree Certificates by Air",
  description:
    "How Ellcworth Express delivered 10 cartons of secure-printed degree certificates from Grays, Essex to the University for Development Studies, Tamale — 48 hours printer to Heathrow, 7 days UK to Ghana, 100% intact.",
  alternates: {
    canonical:
      "https://www.ellcworth.com/insights/uds-degree-certificates",
  },
  openGraph: {
    title: "Race Against the Clock: UDS Degree Certificates by Air",
    description:
      "10 cartons. 48 hours printer to Heathrow. 7 days UK to Tamale. 100% delivered intact.",
    url: "https://www.ellcworth.com/insights/uds-degree-certificates",
    siteName: "Ellcworth Express",
    type: "article",
  },
};

const stats = [
  { value: "10", label: "Cartons" },
  { value: "48h", label: "Printer to Heathrow" },
  { value: "7 days", label: "UK to Ghana" },
  { value: "100%", label: "Delivered Intact" },
];

const services = [
  "Air Freight (LHR → ACC)",
  "Palletisation & Repackaging",
  "Export Documentation",
  "Ghana Customs Clearance",
  "Inland Delivery to Tamale",
];

export default function UDSCaseStudy() {
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
          <span className="text-white">UDS Degree Certificates</span>
        </nav>
      </div>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-10 pb-12">
        <span className="inline-block text-[#FFA500] text-xs font-bold tracking-[0.25em] uppercase mb-4">
          Air Freight · Emergency Operation
        </span>
        <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight tracking-tight mb-4">
          Race Against the Clock: Delivering UDS Degree Certificates by Air
        </h1>
        <p className="text-[#9A9EAB] text-sm mb-8">
          University for Development Studies, Tamale, Ghana — January 2026
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

        {/* The Challenge */}
        <div className="space-y-4">
          <h2 className="text-white text-lg font-bold tracking-tight">The Challenge</h2>
          <p className="text-[#C8CDD6] text-sm leading-relaxed">
            Ten cartons of secure-printed degree certificates needed to reach the University for
            Development Studies in Tamale, northern Ghana — with a hard graduation deadline and no
            margin for error on the delivery side. The window from collection to Heathrow was tight:
            48 hours. Certificates held up in transit or cleared late meant a graduation ceremony
            without its documents.
          </p>
          <p className="text-[#C8CDD6] text-sm leading-relaxed">
            Secure print consignments of this kind carry institutional weight beyond their physical
            value. Delay is not a logistics problem — it is a reputational one for the university
            and a practical crisis for graduating students. The brief was simple: get them there,
            intact, on time.
          </p>
        </div>

        {/* Route */}
        <div className="bg-[#111C24] border border-white/8 rounded-2xl px-6 py-5">
          <p className="text-[#FFA500] text-xs font-bold tracking-[0.2em] uppercase mb-2">
            Shipment Route
          </p>
          <p className="text-white text-sm font-medium">
            Vendor Collection (UK) → Heathrow Air Freight Facility (LHR) → Accra International Airport (ACC) → UDS Tamale
          </p>
        </div>

        {/* The Operation */}
        <div className="space-y-4">
          <h2 className="text-white text-lg font-bold tracking-tight">The Operation</h2>
          <p className="text-[#C8CDD6] text-sm leading-relaxed">
            Ellcworth collected the ten cartons directly from the printer and transferred them
            to the Heathrow air freight facility, palletised and ready to move within 48 hours. Export documentation was completed
            same-day. The consignment moved through Heathrow on a direct service to Accra
            Kotoka International Airport, where Ellcworth&apos;s Ghana-side partners handled
            customs clearance end-to-end.
          </p>
          <p className="text-[#C8CDD6] text-sm leading-relaxed">
            From ACC, the certificates were transported inland to UDS Tamale — a further leg
            that required coordination with the university procurement team to confirm receipt.
            Total transit time: seven days from UK collection to confirmed delivery on campus.
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

        {/* Quote */}
        <blockquote className="border-l-2 border-[#FFA500] pl-6 py-2">
          <p className="text-[#C8CDD6] text-sm leading-relaxed italic mb-3">
            &ldquo;I am pleased to inform you that the templates have finally arrived in the
            University for Development Studies, Tamale. I want to thank all stakeholders for
            ensuring a smooth transaction.&rdquo;
          </p>
          <cite className="text-[#9A9EAB] text-xs not-italic">
            — Procurement Director, University for Development Studies — 27 January 2026
          </cite>
        </blockquote>

        {/* Outcome */}
        <div className="space-y-4">
          <h2 className="text-white text-lg font-bold tracking-tight">The Outcome</h2>
          <p className="text-[#C8CDD6] text-sm leading-relaxed">
            All ten cartons arrived at UDS intact, ahead of the graduation ceremony. Zero losses,
            zero damage claims, zero customs holds. The procurement director confirmed receipt
            directly — the message above arrived unsolicited.
          </p>
        </div>

        {/* CTA */}
        <div className="bg-[#111C24] border border-white/8 rounded-2xl px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-white font-bold mb-1">Running a similar operation?</p>
            <p className="text-[#9A9EAB] text-sm">
              We handle institutional shipments — certificates, lab equipment, university
              procurement — with the same precision.
            </p>
          </div>
          <Link
            href="/institutional"
            className="shrink-0 inline-block bg-[#FFA500] text-[#1A2930] px-6 py-3 rounded-full text-xs font-bold tracking-[0.14em] uppercase hover:opacity-90 transition"
          >
            Institutional Shipping
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
