import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shipping to Nigeria from the UK | Container & Air Freight",
  description: "FCL container shipping and air freight from the UK to Nigeria. Apapa Port Lagos and Murtala Muhammed Airport. Export documentation, customs clearance end-to-end.",
  alternates: { canonical: "https://www.ellcworth.com/destinations/nigeria" },
  openGraph: {
    title: "Shipping to Nigeria from the UK | Container & Air Freight",
    description: "FCL container shipping and air freight from the UK to Nigeria. Apapa Port Lagos and Murtala Muhammed Airport. Export documentation, customs clearance end-to-end.",
    url: "https://www.ellcworth.com/destinations/nigeria",
    siteName: "Ellcworth Express",
    type: "website",
    images: [{ url: "https://www.ellcworth.com/ellc_hero1.webp" }],
  },
  twitter: { card: "summary_large_image", title: "Shipping to Nigeria from the UK", description: "FCL container shipping and air freight UK to Nigeria. Apapa Port Lagos. Export documentation end-to-end." },
};

const STATS = [
  { value: "£1,600", label: "FCL from", sub: "20ft container to Apapa" },
  { value: "21–28", label: "Transit days", sub: "UK ports → Apapa" },
  { value: "5–7", label: "Air freight days", sub: "LHR → Lagos (LOS)" },
  { value: "100%", label: "NCS compliant", sub: "Nigeria Customs Service" },
];

const SERVICES = [
  { icon: "📦", title: "Container Shipping to Nigeria from the UK", price: "20ft from £1,600 · 40ft from £2,800", description: "Dedicated containers from UK ports to Apapa Port, Lagos — Nigeria's principal deep-water port. Suited to commercial stock, industrial equipment, and institutional cargo where security and condition matter.", suited: ["Commercial goods", "Industrial parts", "Retail stock", "Institutional equipment"] },
  { icon: "🤝", title: "LCL — Groupage", price: "Quoted per CBM", description: "Share container space with other shippers moving cargo to Lagos. We consolidate at our UK depot and your freight travels alongside vetted co-loaders under a single bill of lading.", suited: ["Small commercial loads", "Single pallets", "Samples", "Documents"] },
  { icon: "✈️", title: "Air Freight from the UK to Nigeria", price: "Quoted per kg", description: "Direct to Murtala Muhammed International Airport (LOS), Lagos. Door-to-airport and airport-to-airport options. Fastest route for time-critical cargo, spare parts, and high-value consignments.", suited: ["Urgent spare parts", "High-value goods", "Time-sensitive documents", "Perishables"] },
];

const CUSTOMS_STEPS = [
  { step: "01", title: "Pre-Arrival Declaration (Form M)", body: "Nigerian imports require a Form M — a mandatory foreign exchange document issued by a Nigerian bank before shipment. It must be in place before cargo departs the UK. Ellcworth works with your Nigerian consignee or their bank to ensure Form M is secured before the vessel sails." },
  { step: "02", title: "NAFDAC & SON Permits (where applicable)", body: "Certain goods — food, pharmaceuticals, electronics, cosmetics — require clearance from NAFDAC (National Agency for Food and Drug Administration) or SON (Standards Organisation of Nigeria) before release. We identify permit requirements at the quoting stage so nothing surprises you at the port." },
  { step: "03", title: "Nigeria Customs Service Assessment", body: "NCS assesses import duty based on the CIF value of the shipment. Import duties range from 5% to 35% depending on the HS tariff code. Our documentation is prepared to the standard required for smooth NCS processing at Apapa." },
  { step: "04", title: "Duty Payment & Release", body: "Once assessed, import duty is paid through the NCS e-payment system. A release order is issued authorising removal from the port. Our Lagos-based partners manage this step and provide confirmation when your cargo is cleared and ready for collection." },
];

const FAQS = [
  { q: "How long does shipping from the UK to Nigeria take?", a: "By sea, expect 21–28 days from UK ports to Apapa Port, Lagos. Add 5–10 working days for NCS customs clearance. Air freight to Lagos (LOS) typically takes 5–7 days door-to-door." },
  { q: "What is Form M and do I need one?", a: "Form M is a mandatory Nigerian import document issued by a Nigerian commercial bank. It must be obtained by the Nigerian consignee (importer) before the goods leave the UK. Without it, the shipment cannot clear Nigerian customs. We flag this requirement at the quoting stage." },
  { q: "What documents are required for shipping to Nigeria?", a: "You will need a commercial invoice, packing list, bill of lading (sea) or air waybill (air), certificate of origin, and Form M from the Nigerian consignee. Some goods also require NAFDAC or SON permits. We provide a full checklist when you book." },
  { q: "How is import duty calculated in Nigeria?", a: "NCS calculates duty on the CIF value (Cost + Insurance + Freight) using the applicable HS tariff rate. Rates range from 5% to 35% depending on the category of goods. We provide a duty estimate before you commit to shipment." },
  { q: "Do you handle delivery from Apapa Port to Lagos or beyond?", a: "Yes. Our Lagos-based partners provide port-to-door delivery across Lagos and can arrange onward haulage to Abuja, Port Harcourt, and other major cities." },
  { q: "How do I ship a container to Nigeria from the UK?", a: "We book FCL (full container load) shipments from UK ports to Apapa Port, Lagos on a weekly sailing schedule. A 20ft container starts from £1,600 and a 40ft from £2,800. We handle export documentation, Form M coordination with your Nigerian bank, Nigeria Customs Service clearance, and port-to-door delivery in Lagos. Quotes are returned within 24 hours." },
    { q: "How do I get a quote?", a: "Use our online quote form or contact us directly via WhatsApp or email. For FCL or LCL we need cargo dimensions and weight. For air freight we need weight and dimensions. Quotes are typically returned within 24 hours." },
];

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

export default function NigeriaPage() {
  return (
    <div className="bg-[#EDECEC]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />
      <section className="relative w-full bg-[#1A2930] text-white py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,165,0,0.08),transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-4 text-sm text-slate-400">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <span>/</span><span className="text-slate-300">Destinations</span>
            <span>/</span><span className="text-[#FFA500]">Nigeria</span>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🇳🇬</span>
            <span className="inline-flex items-center rounded-full border border-[#FFA500] bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-100">West Africa</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight uppercase mb-6">
            Shipping to Nigeria<br /><span className="text-[#FFA500]">from the UK</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mb-8">
            FCL container shipping and air freight from the UK to Nigeria. Apapa Port Lagos and Murtala Muhammed International Airport — export documentation, Form M coordination, and customs clearance end-to-end.
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
          <span className="inline-flex items-center rounded-full bg-[#1A2930] text-[#FFA500] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase mb-4">The UK–Nigeria Corridor</span>
          <h2 className="text-2xl md:text-3xl font-semibold uppercase text-[#1A2930] mb-6">Container Shipping &amp; Air Freight from the UK to Nigeria.</h2>
          <div className="text-gray-700 space-y-5 text-base md:text-lg leading-relaxed">
            <p>Nigeria is the largest economy in Africa and one of the UK's most significant trading partners on the continent. Freight demand runs across every sector: commercial importers supplying Lagos's retail and construction markets, diaspora shippers sending goods home, industrial buyers procuring UK machinery and equipment, and institutions importing technology, laboratory supplies, and printed materials.</p>
            <p>Apapa Port, Lagos — Nigeria's primary deep-water port — handles the bulk of containerised imports from the UK. It connects to the national road network and onward haulage routes to Abuja, Port Harcourt, Kano, and beyond. For time-critical cargo, Murtala Muhammed International Airport (LOS) in Lagos provides direct air freight links from Heathrow.</p>
            <p>Ellcworth Express manages the full UK-to-Nigeria journey: export documentation, sea or air freight booking, Form M coordination with your Nigerian bank, Nigeria Customs Service clearance, and port-to-door delivery through our Lagos agent network.</p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-[#EDECEC]">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <span className="inline-flex items-center rounded-full bg-[#1A2930] text-[#FFA500] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase mb-4">Shipping Options</span>
          <h2 className="text-2xl md:text-3xl font-semibold uppercase text-[#1A2930] mb-10">Container Shipping, Groupage &amp; Air Freight to Lagos.</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICES.map((s) => (
              <div key={s.title} className="rounded-2xl border border-gray-200 bg-white px-6 py-6 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl flex-shrink-0">{s.icon}</span>
                    <h3 className="font-semibold text-[#1A2930] text-base">{s.title}</h3>
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
          <span className="inline-flex items-center rounded-full bg-[#1A2930] text-[#FFA500] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase mb-4">Nigeria Customs</span>
          <h2 className="text-2xl md:text-3xl font-semibold uppercase text-[#1A2930] mb-4">How Nigerian customs clearance works.</h2>
          <p className="text-gray-600 mb-10 text-base leading-relaxed max-w-2xl">Nigeria Customs Service (NCS) processes all imports through the NICIS II platform. Understanding the requirements before you ship avoids costly holds at Apapa.</p>
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
          <h2 className="text-2xl md:text-3xl font-semibold uppercase text-[#1A2930] mb-2">UK to Nigeria Shipping — Frequently Asked Questions.</h2>
          <p className="text-gray-600 mb-8">Shipping to Nigeria from the UK.</p>
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
            <Link href="/destinations/kenya" className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-[#1A2930] hover:border-[#FFA500] hover:text-[#FFA500] transition">Kenya &rarr;</Link>
            <Link href="/destinations/sierra-leone" className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-[#1A2930] hover:border-[#FFA500] hover:text-[#FFA500] transition">Sierra Leone &rarr;</Link>
            <Link href="/destinations/cote-divoire" className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-[#1A2930] hover:border-[#FFA500] hover:text-[#FFA500] transition">Côte d'Ivoire &rarr;</Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-[#1A2930] text-white">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold uppercase mb-4">Ready to ship to Nigeria?</h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">FCL from £1,600 (20ft). Air freight quoted per kg. Full Nigeria Customs clearance coordination. Quote returned within 24 hours.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:cs@ellcworth.com" className="inline-flex items-center justify-center rounded-full bg-[#FFA500] text-black px-8 py-3 text-sm font-semibold tracking-[0.14em] uppercase hover:bg-[#ffb733] transition shadow-md">cs@ellcworth.com</a>
            <a href="/#quote" className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/5 text-white px-8 py-3 text-sm font-semibold tracking-[0.14em] uppercase hover:bg-white/10 transition">Get a Quote</a>
          </div>
        </div>
      </section>
    </div>
  );
}
