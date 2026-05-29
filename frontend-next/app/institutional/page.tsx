import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Institutional Cargo UK to Africa | Ellcworth Express",
  description: "Ellcworth Express ships for universities, hospitals, banks, government ministries and NGOs — sealed, documented, on time. Book a 15-minute call to discuss your institutional shipping needs.",
  alternates: { canonical: "https://www.ellcworth.com/institutional" },
  openGraph: {
    title: "Institutional Cargo UK to Africa | Ellcworth Express",
    description: "Ellcworth Express ships for universities, hospitals, banks, government ministries and NGOs — sealed, documented, on time. 15+ years. Zero institutional deadlines missed.",
    url: "https://www.ellcworth.com/institutional",
    type: "website",
    images: [{ url: "https://www.ellcworth.com/ellc_hero1.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Institutional Cargo UK to Africa | Ellcworth Express",
    description: "Ellcworth Express ships for universities, hospitals, banks, government ministries and NGOs — sealed, documented, on time. 15+ years. Zero institutional deadlines missed.",
  },
};

const cargoTypes = [
  { icon: "🎓", title: "Academic & ceremonial cargo", body: "Blank degree certificates, regalia and academic materials. Tamper-proof, time-critical. Collected from UK printers, sealed and delivered to campus before graduation. We have never missed a deadline in 15+ years." },
  { icon: "🏥", title: "Medical & healthcare procurement", body: "Hospital equipment, diagnostic devices, pharmaceutical supplies and consumables for healthcare procurement agencies. Handled with the documentation discipline that institutional supply chains demand." },
  { icon: "🏦", title: "Banking & financial equipment", body: "ATM units, cash-handling equipment, server infrastructure and secure IT hardware for banks and financial institutions. Chain-of-custody documentation provided at every stage." },
  { icon: "🏛️", title: "Government & ministry cargo", body: "Ministerial procurement, civil service equipment and public sector project cargo. We work within formal procurement frameworks — proper invoices, auditable documentation, named contacts." },
  { icon: "🔬", title: "Lab & scientific equipment", body: "Sensitive instruments requiring export documentation, careful packaging and named customs handling at destination. Research institutions and teaching hospitals served." },
  { icon: "📚", title: "Library, IT & AV equipment", body: "Books, servers, terminals and AV equipment consolidated at our network near UK ports and shipped on the next available vessel." },
  { icon: "🌍", title: "NGO & humanitarian supplies", body: "Faith-based organisations, development agencies and humanitarian NGOs. We understand donor-funded procurement requirements and provide the paper trail your auditors need." },
  { icon: "⚙️", title: "Industrial & project cargo", body: "OOG and heavy-lift assessed on merit. If we can do it well, we will. If not, we will say so and refer you to someone who can." },
];

const whyItems = [
  { number: "01", title: "Sealed and photographed", body: "Every institutional shipment is sealed at the point of loading. Seal number and photographic evidence provided before the container leaves UK shores." },
  { number: "02", title: "Named account manager", body: "Not a ticketing system. A named person who knows your shipment, your deadline and your procurement officer's expectations." },
  { number: "03", title: "Documentation discipline", body: "Export declarations, packing lists, certificates of origin and destination customs pre-clearance — all handled and auditable." },
  { number: "04", title: "Named clearing partners", body: "We work with established, named agents at Tema, Lagos and Mombasa. You know who is handling your cargo at destination, not just that someone is." },
  { number: "05", title: "Procurement-friendly", body: "We issue proper invoices, provide shipment reports, and can work within formal procurement frameworks. No cash-in-hand ambiguity." },
  { number: "06", title: "Retainer option available", body: "Regular shippers can lock in a fortnightly sea-freight slot, priority air access and pre-negotiated rates via a monthly retainer. Ask us about pricing." },
];

const stats = [
  { stat: "12+", label: "Years on the UK–West Africa corridor" },
  { stat: "0", label: "Institutional deadlines missed" },
  { stat: "10+", label: "Institutions served across education, health and government" },
];

const institutionTypes = [
  { icon: "🎓", label: "Universities & Schools" },
  { icon: "🏥", label: "Hospitals & Healthcare Agencies" },
  { icon: "🏦", label: "Banks & Financial Institutions" },
  { icon: "🏛️", label: "Government Ministries" },
  { icon: "🌍", label: "NGOs & Development Agencies" },
  { icon: "⛪", label: "Faith-Based Organisations" },
];

const destinations = [
  { label: "Ghana", href: "/destinations/ghana" },
  { label: "Nigeria", href: "/destinations/nigeria" },
  { label: "Kenya", href: "/destinations/kenya" },
  { label: "Other Africa", href: null },
];

export default function InstitutionalPage() {
  return (
    <div className="bg-[#EDECEC]">

      {/* Hero */}
      <section className="relative w-full bg-[#1A2930] text-white py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,165,0,0.08),transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <span className="inline-flex items-center rounded-full border border-[#FFA500] bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-100 mb-6">For Institutions</span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight uppercase mb-6">
            When the cargo matters,<br /><span className="text-[#FFA500]">the carrier matters.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mb-10">Ellcworth Express works with universities, hospitals, banks, government ministries and NGOs who cannot afford a shipment that goes wrong. Sealed. Documented. On time.</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="https://calendly.com/ellcworth/15min" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-full bg-[#FFA500] text-black px-8 py-3 text-sm font-semibold tracking-[0.14em] uppercase hover:bg-[#ffb733] transition shadow-md">Book a 15-minute call</a>
            <a href="mailto:cs@ellcworth.com" className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/5 text-white px-8 py-3 text-sm font-semibold tracking-[0.14em] uppercase hover:bg-white/10 transition">Email us directly</a>
          </div>
        </div>
      </section>

      {/* Who we serve */}
      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <span className="inline-flex items-center rounded-full bg-[#1A2930] text-[#FFA500] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase mb-4">Who We Serve</span>
          <h2 className="text-2xl md:text-3xl font-semibold uppercase text-[#1A2930] mb-4">Any institution that needs it done right.</h2>
          <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-10 max-w-2xl">Our institutional clients share one thing: the cost of a logistics failure is far higher than the cost of the shipment. Whether that is a graduation ceremony, a hospital procurement deadline or a government ministry tender, we treat every consignment accordingly.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {institutionTypes.map((item) => (
              <div key={item.label} className="rounded-2xl border border-gray-200 bg-[#F9FAFB] px-5 py-5 flex items-center gap-3">
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <p className="text-sm font-semibold text-[#1A2930]">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Track record */}
      <section className="py-16 md:py-24 bg-[#EDECEC]">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <span className="inline-flex items-center rounded-full bg-[#1A2930] text-[#FFA500] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase mb-4">Track Record</span>
          <h2 className="text-2xl md:text-3xl font-semibold uppercase text-[#1A2930] mb-6">Graduation is 7 days away.<br />There is no room for error.</h2>
          <div className="text-gray-700 space-y-5 text-base md:text-lg leading-relaxed mb-12">
            <p>For over 15 years, Ellcworth Express has been the logistics partner behind some of Ghana's most important graduation ceremonies. Each year, universities across Ghana — including the University of Ghana, KNUST, UCC and UDS — outsource the printing of their blank degree certificates to specialist printers in the UK.</p>
            <p>By the time we receive the call, graduation is typically 7 days away. The certificates must be collected, packaged tamper-proof, cleared through UK export and Ghana customs, and delivered to campus before the ceremony begins.</p>
            <p className="font-semibold text-[#1A2930]">In 15+ years, we have never let a single institution down.</p>
            <p>That track record extends beyond academia. The same process — sealed, documented, tracked, delivered — is what hospitals, procurement agencies and government ministries get when they ship with us. The cargo changes. The standard does not.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {stats.map((item) => (
              <div key={item.label} className="rounded-2xl border border-gray-200 bg-white px-6 py-6 text-center">
                <p className="text-4xl font-bold text-[#FFA500] mb-2">{item.stat}</p>
                <p className="text-sm text-gray-600">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How we work */}
      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <span className="inline-flex items-center rounded-full bg-[#1A2930] text-[#FFA500] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase mb-4">How We Work</span>
          <h2 className="text-2xl md:text-3xl font-semibold uppercase text-[#1A2930] mb-10">What institutional clients get that others don't.</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {whyItems.map((item) => (
              <div key={item.number} className="rounded-2xl border border-gray-200 bg-[#F9FAFB] px-6 py-6 flex gap-5">
                <span className="text-[#FFA500] font-bold text-sm tracking-widest flex-shrink-0 pt-1">{item.number}</span>
                <div>
                  <p className="font-semibold text-[#1A2930] mb-1">{item.title}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we ship */}
      <section className="py-16 md:py-24 bg-[#EDECEC]">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <span className="inline-flex items-center rounded-full bg-[#1A2930] text-[#FFA500] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase mb-4">What We Ship</span>
          <h2 className="text-2xl md:text-3xl font-semibold uppercase text-[#1A2930] mb-10">Cargo we specialise in for institutional clients.</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cargoTypes.map((item) => (
              <div key={item.title} className="rounded-2xl border border-gray-200 bg-white px-6 py-6 flex gap-4">
                <span className="text-3xl flex-shrink-0">{item.icon}</span>
                <div>
                  <p className="font-semibold text-[#1A2930] mb-1">{item.title}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Retainer */}
      <section className="py-16 md:py-20 bg-white">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <div className="rounded-2xl bg-[#1A2930] px-8 py-10 md:px-12 md:py-12 flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1">
              <span className="inline-flex items-center rounded-full border border-[#FFA500]/40 bg-white/5 px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase text-[#FFA500] mb-4">Retainer Option</span>
              <h2 className="text-xl md:text-2xl font-semibold uppercase text-white mb-3">Ship regularly? Lock in a monthly retainer.</h2>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed">Universities, hospitals, banks and NGOs with regular volumes can move to a monthly retainer — a guaranteed fortnightly sea-freight slot, priority air access, pre-negotiated rates and a named account manager. No competitor on this corridor offers this. Ask us about it on the call.</p>
            </div>
            <div className="flex-shrink-0 flex items-center">
              <a href="https://calendly.com/ellcworth/15min" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-full bg-[#FFA500] text-black px-7 py-3 text-sm font-semibold tracking-[0.14em] uppercase hover:bg-[#ffb733] transition shadow-md whitespace-nowrap">Book a call</a>
            </div>
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section className="py-16 md:py-24 bg-[#EDECEC]">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <span className="inline-flex items-center rounded-full bg-[#1A2930] text-[#FFA500] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase mb-4">Destinations</span>
          <h2 className="text-2xl md:text-3xl font-semibold uppercase text-[#1A2930] mb-6">Where we ship for institutions.</h2>
          <div className="text-gray-700 space-y-5 text-base md:text-lg leading-relaxed mb-8">
            <p>Our primary corridor is UK to Ghana — weekly sailings from Tilbury and Southampton to Tema, with established customs agents at the port. Ghana is where our knowledge and relationships are deepest.</p>
            <p>We also serve Nigeria, Kenya and a range of West and East African destinations. If you are shipping to an institution on the continent, talk to us. We will tell you honestly whether we can serve it well.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {destinations.map((dest) => dest.href ? (
              <Link key={dest.label} href={dest.href} className="group rounded-xl border border-gray-200 bg-white px-4 py-4 text-center hover:border-[#FFA500]/50 transition">
                <p className="font-semibold text-[#1A2930] text-sm group-hover:text-[#FFA500] transition">{dest.label}</p>
              </Link>
            ) : (
              <div key={dest.label} className="rounded-xl border border-gray-200 bg-white px-4 py-4 text-center">
                <p className="font-semibold text-[#1A2930] text-sm">{dest.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-20 bg-[#1A2930] text-white">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold uppercase mb-4">Let's talk about your shipment.</h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">A 15-minute call is enough to understand your requirements, your destination and your timeline. No obligation. No sales script.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://calendly.com/ellcworth/15min" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-full bg-[#FFA500] text-black px-8 py-3 text-sm font-semibold tracking-[0.14em] uppercase hover:bg-[#ffb733] transition shadow-md">Book a 15-minute call</a>
            <a href="mailto:cs@ellcworth.com" className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/5 text-white px-8 py-3 text-sm font-semibold tracking-[0.14em] uppercase hover:bg-white/10 transition">cs@ellcworth.com</a>
          </div>
          <p className="text-gray-500 text-xs mt-6">
            Prefer to read first?{" "}
            <Link href="/about" className="text-gray-400 underline hover:text-white transition">Read our story</Link>{" "}or{" "}
            <Link href="/#quote" className="text-gray-400 underline hover:text-white transition">request a quote</Link>.
          </p>
        </div>
      </section>

    </div>
  );
}
