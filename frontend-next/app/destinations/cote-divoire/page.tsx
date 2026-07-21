import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shipping to Côte d'Ivoire from the UK | Container & Air Freight",
  description: "FCL container shipping and air freight from the UK to Côte d'Ivoire. Abidjan Port Autonome and Félix Houphouët-Boigny International Airport. Full customs clearance end-to-end.",
  alternates: { canonical: "https://www.ellcworth.com/destinations/cote-divoire" },
  openGraph: {
    title: "Shipping to Côte d'Ivoire from the UK | Container & Air Freight",
    description: "FCL container shipping and air freight from the UK to Côte d'Ivoire. Abidjan Port Autonome and Félix Houphouët-Boigny International Airport. Full customs clearance end-to-end.",
    url: "https://www.ellcworth.com/destinations/cote-divoire",
    siteName: "Ellcworth Express",
    type: "website",
    images: [{ url: "https://www.ellcworth.com/ellc_hero1.webp" }],
  },
  twitter: { card: "summary_large_image", title: "Shipping to Côte d'Ivoire from the UK", description: "FCL container shipping and air freight UK to Côte d'Ivoire. Abidjan Port Autonome. Full customs clearance end-to-end." },
};

const STATS = [
  { value: "£1,600", label: "FCL from", sub: "20ft container to Abidjan" },
  { value: "18–23", label: "Transit days", sub: "UK ports → Abidjan" },
  { value: "5–7", label: "Air freight days", sub: "LHR → Abidjan (ABJ)" },
  { value: "100%", label: "DGI compliant", sub: "Direction Générale des Impôts" },
];

const SERVICES = [
  { icon: "📦", title: "FCL — Full Container Load", price: "20ft from £1,600 · 40ft from £2,800", description: "Dedicated containers from UK ports to Abidjan Port Autonome — one of West Africa's busiest and most efficient deep-water ports. Abidjan serves as a regional hub for landlocked countries including Mali, Burkina Faso, and Niger.", suited: ["Commercial goods", "Industrial equipment", "Retail stock", "Regional distribution"] },
  { icon: "🤝", title: "LCL — Groupage", price: "Quoted per CBM", description: "Share container space with other shippers moving cargo to Abidjan. Ideal for smaller loads. We consolidate at our UK depot under a single bill of lading, with Abidjan delivery through our local agent network.", suited: ["Small commercial loads", "Single pallets", "Samples", "Personal effects"] },
  { icon: "✈️", title: "Air Freight", price: "Quoted per kg", description: "Direct to Félix Houphouët-Boigny International Airport (ABJ), Abidjan. Door-to-airport and airport-to-airport options. Fastest route for urgent cargo, perishables, and time-critical consignments.", suited: ["Urgent cargo", "Perishables", "High-value goods", "Time-sensitive documents"] },
];

const CUSTOMS_STEPS = [
  { step: "01", title: "Pre-Shipment Inspection (Cotecna / Bureau Veritas)", body: "Côte d'Ivoire operates a pre-shipment inspection programme for commercial imports above the threshold value. Goods are inspected at origin (UK) by the appointed agency and a Certificate of Conformity is issued. This must be in place before the vessel departs. We coordinate inspection as part of the export process." },
  { step: "02", title: "SYDONIA++ Customs Declaration", body: "All imports into Côte d'Ivoire are processed through the SYDONIA++ customs management system, operated by the Direction Générale des Douanes. An import declaration is lodged by the Abidjan agent before arrival. Import duty is assessed on the CIF value using ECOWAS Common External Tariff rates." },
  { step: "03", title: "Customs Examination & Selectivity", body: "The Abidjan customs authority applies a risk-based selectivity system. Shipments with accurate documentation and a valid Certificate of Conformity typically clear without physical examination. Our Abidjan-based agents manage any examination requests and liaise with customs on release." },
  { step: "04", title: "Duty Payment & Port Release", body: "Import duties are paid through the SYGADE payment system. A release order authorises removal from Port Autonome d'Abidjan. Our local partners confirm clearance and arrange onward delivery across Abidjan and to regional destinations." },
];

const FAQS = [
  { q: "How long does shipping from the UK to Côte d'Ivoire take?", a: "By sea, expect 18–23 days from UK ports to Abidjan Port. Add 5–10 working days for customs clearance. Air freight to Abidjan (ABJ) typically takes 5–7 days door-to-door." },
  { q: "Is a pre-shipment inspection certificate required?", a: "Yes, for commercial imports above the threshold value. A Certificate of Conformity must be issued by the appointed inspection agency (Cotecna or Bureau Veritas) before the goods leave the UK. We arrange this as part of the export documentation process." },
  { q: "What documents are required for shipping to Côte d'Ivoire?", a: "You will need a commercial invoice, packing list, bill of lading or air waybill, certificate of origin, and Certificate of Conformity from the pre-shipment inspection. We provide a full checklist when you book." },
  { q: "How is import duty calculated in Côte d'Ivoire?", a: "Customs duty is calculated on CIF value using the ECOWAS Common External Tariff. Rates are typically 0%, 5%, 10%, or 20% depending on product category. Additional levies including TVA (18%) and statistical fee may apply. We provide a duty estimate before you commit." },
  { q: "Can cargo from Abidjan be forwarded to landlocked countries?", a: "Yes. Abidjan is one of West Africa's key transit hubs for Mali, Burkina Faso, Niger, and Guinea. Our Abidjan partners can arrange onward transit under bond to these destinations." },
  { q: "How do I get a quote?", a: "Use our online quote form or contact us via WhatsApp or email. For FCL or LCL we need cargo dimensions and weight. Quotes are returned within 24 hours." },
];

export default function CoteDIvoirePage() {
  return (
    <div className="bg-[#EDECEC]">
      <section className="relative w-full bg-[#1A2930] text-white py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,165,0,0.08),transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-4 text-sm text-slate-400">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <span>/</span><span className="text-slate-300">Destinations</span>
            <span>/</span><span className="text-[#FFA500]">Côte d&apos;Ivoire</span>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🇨🇮</span>
            <span className="inline-flex items-center rounded-full border border-[#FFA500] bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-100">West Africa</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight uppercase mb-6">
            Shipping to Côte d&apos;Ivoire<br /><span className="text-[#FFA500]">from the UK</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mb-8">
            FCL container shipping and air freight from the UK to Côte d&apos;Ivoire. Abidjan Port Autonome and Félix Houphouët-Boigny International Airport — pre-shipment inspection, export documentation, and customs clearance end-to-end.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="/#quote" className="inline-flex items-center justify-center rounded-full bg-[#FFA500] text-black px-8 py-3 text-sm font-semibold tracking-[0.14em] uppercase hover:bg-[#ffb733] transition shadow-md">Get a Quote</a>
            <a href="https://wa.me/447776234234?text=Hello%20Ellcworth%2C%20I%20have%20a%20shipping%20enquiry." target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/5 text-white px-8 py-3 text-sm font-semibold tracking-[0.14em] uppercase hover:bg-white/10 transition">WhatsApp Us</a>
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-2xl border border-gray-200 bg-[#F9FAFB] px-6 py-6 text-center">
                <p className="text-3xl font-bold text-[#FFA500] mb-1">{s.value}</p>
                <p className="text-sm font-semibold text-[#1A2930]">{s.label}</p>
                <p className="text-xs text-gray-500 mt-1">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <span className="inline-flex items-center rounded-full bg-[#1A2930] text-[#FFA500] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase mb-4">The UK–Côte d&apos;Ivoire Corridor</span>
          <h2 className="text-2xl md:text-3xl font-semibold uppercase text-[#1A2930] mb-6">West Africa&apos;s regional hub. A strategic freight destination.</h2>
          <div className="text-gray-700 space-y-5 text-base md:text-lg leading-relaxed">
            <p>Côte d&apos;Ivoire is one of West Africa&apos;s fastest-growing economies and a regional logistics hub. Abidjan Port Autonome is the busiest port in francophone West Africa — it serves not only the domestic market but acts as the principal transit gateway for landlocked Mali, Burkina Faso, Niger, and Guinea. UK exporters shipping to the wider West African hinterland often route cargo through Abidjan.</p>
            <p>Freight demand from the UK covers commercial goods, industrial equipment, construction materials, and institutional supplies. The port&apos;s efficient handling and established transit corridor infrastructure make it one of the more predictable clearance environments in the region when documentation is correctly prepared.</p>
            <p>Ellcworth Express manages the full journey: UK collection or depot drop-off, pre-shipment inspection coordination, export documentation, sea or air freight booking, Direction Générale des Douanes clearance, and port-to-door delivery through our Abidjan agent network.</p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-[#EDECEC]">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <span className="inline-flex items-center rounded-full bg-[#1A2930] text-[#FFA500] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase mb-4">Shipping Options</span>
          <h2 className="text-2xl md:text-3xl font-semibold uppercase text-[#1A2930] mb-10">Three freight modes to Côte d&apos;Ivoire.</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICES.map((s) => (
              <div key={s.title} className="rounded-2xl border border-gray-200 bg-white px-6 py-6 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl flex-shrink-0">{s.icon}</span>
                    <p className="font-semibold text-[#1A2930]">{s.title}</p>
                  </div>
                  <span className="text-sm font-semibold text-[#FFA500] whitespace-nowrap">{s.price}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{s.description}</p>
                <div className="flex flex-wrap gap-2 mt-auto pt-2">
                  {s.suited.map((tag) => <span key={tag} className="text-[11px] px-3 py-1 rounded-full bg-[#F9FAFB] border border-gray-200 text-gray-500">{tag}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <span className="inline-flex items-center rounded-full bg-[#1A2930] text-[#FFA500] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase mb-4">Customs Clearance</span>
          <h2 className="text-2xl md:text-3xl font-semibold uppercase text-[#1A2930] mb-4">How Côte d&apos;Ivoire customs clearance works.</h2>
          <p className="text-gray-600 mb-10 text-base leading-relaxed max-w-2xl">All imports are processed through SYDONIA++ by the Direction Générale des Douanes. Pre-shipment inspection is required for most commercial imports and must be arranged before cargo leaves the UK.</p>
          <div className="space-y-0">
            {CUSTOMS_STEPS.map((s, i) => (
              <div key={s.step} className={"flex gap-6 " + (i < CUSTOMS_STEPS.length - 1 ? "pb-8 mb-8 border-b border-gray-200" : "")}>
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#1A2930] flex items-center justify-center">
                  <span className="text-[#FFA500] font-bold text-xs">{s.step}</span>
                </div>
                <div>
                  <p className="font-semibold text-[#1A2930] mb-2">{s.title}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-[#EDECEC]">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <span className="inline-flex items-center rounded-full bg-[#1A2930] text-[#FFA500] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase mb-4">FAQ</span>
          <h2 className="text-2xl md:text-3xl font-semibold uppercase text-[#1A2930] mb-2">Common questions answered.</h2>
          <p className="text-gray-600 mb-8">Shipping to Côte d&apos;Ivoire from the UK.</p>
          <div className="rounded-2xl border border-gray-200 bg-white px-6 md:px-8">
            {FAQS.map((faq) => (
              <div key={faq.q} className="border-b border-gray-200 last:border-0 py-5">
                <p className="font-semibold text-[#1A2930] text-sm mb-2">{faq.q}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Also shipping to */}
      <section className="py-10 bg-[#EDECEC] border-t border-gray-200">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 mb-4">Also shipping to</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/destinations/ghana" className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-[#1A2930] hover:border-[#FFA500] hover:text-[#FFA500] transition">Ghana &rarr;</Link>
            <Link href="/destinations/nigeria" className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-[#1A2930] hover:border-[#FFA500] hover:text-[#FFA500] transition">Nigeria &rarr;</Link>
            <Link href="/destinations/kenya" className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-[#1A2930] hover:border-[#FFA500] hover:text-[#FFA500] transition">Kenya &rarr;</Link>
            <Link href="/destinations/sierra-leone" className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-[#1A2930] hover:border-[#FFA500] hover:text-[#FFA500] transition">Sierra Leone &rarr;</Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-[#1A2930] text-white">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold uppercase mb-4">Ready to ship to Côte d&apos;Ivoire?</h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">FCL from £1,600 (20ft). Air freight quoted per kg. Full customs clearance coordination. Quote returned within 24 hours.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:cs@ellcworth.com" className="inline-flex items-center justify-center rounded-full bg-[#FFA500] text-black px-8 py-3 text-sm font-semibold tracking-[0.14em] uppercase hover:bg-[#ffb733] transition shadow-md">cs@ellcworth.com</a>
            <a href="/#quote" className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/5 text-white px-8 py-3 text-sm font-semibold tracking-[0.14em] uppercase hover:bg-white/10 transition">Get a Quote</a>
          </div>
        </div>
      </section>
    </div>
  );
}
