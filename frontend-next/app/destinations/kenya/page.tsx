import type { Metadata } from "next";
import Link from "next/link";
import InstantQuoteEstimate from "../../components/InstantQuoteEstimate";

export const metadata: Metadata = {
  title: "Shipping to Kenya from the UK | Container & Air Freight",
  description: "FCL container shipping and air freight from the UK to Kenya. Mombasa Port and Jomo Kenyatta International Airport. Export documentation and customs clearance end-to-end.",
  alternates: { canonical: "https://www.ellcworth.com/destinations/kenya" },
  openGraph: {
    title: "Shipping to Kenya from the UK | Container & Air Freight",
    description: "FCL container shipping and air freight from the UK to Kenya. Mombasa Port and Jomo Kenyatta International Airport. Export documentation and customs clearance end-to-end.",
    url: "https://www.ellcworth.com/destinations/kenya",
    siteName: "Ellcworth Express",
    type: "website",
    images: [{ url: "https://www.ellcworth.com/ellc_hero1.webp" }],
  },
  twitter: { card: "summary_large_image", title: "Shipping to Kenya from the UK", description: "FCL container shipping and air freight UK to Kenya. Mombasa Port and Nairobi Airport. Customs clearance end-to-end." },
};

const STATS = [
  { value: "£1,050", label: "RoRo from", sub: "per vehicle / unit" },
  { value: "£1,700", label: "FCL from", sub: "20ft container to Mombasa" },
  { value: "22–26", label: "Transit days", sub: "Sheerness → Mombasa" },
  { value: "100%", label: "KRA compliant", sub: "Kenya Revenue Authority" },
];

const SERVICES = [
  { icon: "🚢", title: "RoRo Shipping", price: "From £1,050", description: "Roll-on/Roll-off is the fastest, most cost-effective method for vehicles and self-propelled machinery. You deliver the vehicle to the departure port yourself using the shipping note we issue — the port team takes it from there and drives it onto the vessel, off again at Mombasa. No containerisation costs, no crane fees.", suited: ["Cars & SUVs", "Vans & pickups", "Agricultural machinery", "Construction equipment"] },
  { icon: "📦", title: "Container Shipping to Kenya from the UK", price: "20ft from £1,700 · 40ft from £2,900", description: "Dedicated containers from UK ports to Mombasa — East Africa's largest port and the principal gateway for landlocked East African countries. Suited to commercial stock, industrial equipment, and institutional cargo.", suited: ["Commercial goods", "Industrial equipment", "Retail stock", "NGO supplies"] },
  { icon: "🤝", title: "LCL — Groupage", price: "Quoted per CBM", description: "Share container space with other shippers moving cargo to Mombasa. Ideal when your cargo does not justify a full container. We consolidate at our UK depot under a single bill of lading.", suited: ["Small commercial loads", "Single pallets", "Samples", "Documents"] },
  { icon: "✈️", title: "Air Freight from the UK to Kenya", price: "Quoted per kg", description: "Direct to Jomo Kenyatta International Airport (NBO), Nairobi. Door-to-airport and airport-to-airport options. Fastest route for urgent cargo, spare parts, pharmaceuticals, and time-critical consignments.", suited: ["Urgent cargo", "Pharmaceuticals", "High-value goods", "Time-sensitive documents"] },
];

const CUSTOMS_STEPS = [
  { step: "01", title: "Pre-Arrival Declaration (IDF)", body: "Imports into Kenya require an Import Declaration Form (IDF) lodged with Kenya Revenue Authority (KRA) through the iCMS platform before the cargo arrives. The IDF triggers advance risk assessment and duty calculation. Ellcworth works with your Kenyan consignee or agent to ensure the IDF is lodged correctly before the vessel sails." },
  { step: "02", title: "KEBS Pre-Export Verification (PVoC)", body: "Kenya operates a Pre-Export Verification of Conformity (PVoC) programme through KEBS (Kenya Bureau of Standards). Regulated products — electronics, machinery, building materials, food — must be inspected and certified before leaving the UK. We identify PVoC requirements at the quoting stage." },
  { step: "03", title: "KRA Customs Assessment", body: "KRA assesses import duty based on the CIF value using the applicable HS tariff rate. Kenya applies the EAC Common External Tariff — typically 0%, 10%, or 25% depending on product category. Our documentation is prepared to the standard required for smooth KRA processing at Mombasa." },
  { step: "04", title: "Duty Payment & Release", body: "Once assessed, import duty is paid through the KRA e-payment portal. A release order is issued authorising removal from port. Our Mombasa-based partners manage this step and confirm when your cargo is cleared and ready for collection or onward delivery to Nairobi or upcountry." },
];

const FAQS = [
  { q: "How long does shipping from the UK to Kenya take?", a: "By sea, expect 21–25 days from UK ports to Mombasa Port. Add 5–10 working days for KRA customs clearance. Air freight to Nairobi (NBO) typically takes 5–7 days door-to-door." },
  { q: "What is the PVoC certificate and do I need one?", a: "Pre-Export Verification of Conformity (PVoC) is required for regulated product categories entering Kenya — electronics, machinery, building materials, food products, and others. The product must be inspected by a KEBS-appointed agent in the UK before shipment. We identify whether your cargo requires PVoC at the quoting stage." },
  { q: "What documents are required for shipping to Kenya?", a: "You will need a commercial invoice, packing list, bill of lading or air waybill, certificate of origin, and Import Declaration Form (IDF) from the Kenyan consignee. PVoC-regulated goods also need a Certificate of Conformity. We provide a full checklist when you book." },
  { q: "How is import duty calculated in Kenya?", a: "KRA calculates duty on CIF value using the East African Community Common External Tariff. Rates are typically 0% (raw materials), 10% (intermediate goods), or 25% (finished goods). We provide a duty estimate before you commit." },
  { q: "Do you handle delivery from Mombasa to Nairobi or beyond?", a: "Yes. Our Mombasa-based partners provide port-to-door delivery and can arrange onward haulage to Nairobi, Kisumu, and other Kenyan cities via the SGR rail link or road." },
  { q: "How do I ship a container to Kenya from the UK?", a: "We book FCL (full container load) shipments from UK ports to Mombasa on a regular sailing schedule. A 20ft container starts from £1,700 and a 40ft from £2,900. We handle export documentation, IDF coordination, PVoC compliance where required, KRA customs clearance, and Mombasa-to-door delivery. Quotes are returned within 24 hours." },
  { q: "How do I ship goods to Mombasa from the UK?", a: "Sea freight to Mombasa Port takes 21–25 days from UK ports. Choose between a full container (FCL from £1,700 for 20ft) or shared container space (LCL, quoted per CBM). Air freight to Nairobi's Jomo Kenyatta International Airport takes 5–7 days. We manage the full journey — UK collection, export docs, customs clearance, and delivery." },
  { q: "How much does it cost to ship a car to Kenya by RoRo?", a: "RoRo rates start from £1,050 per vehicle. The final price depends on vehicle dimensions, departure port, and the sailing schedule at time of booking. Transit time from Sheerness to Mombasa is typically 22–26 days. We can usually confirm a rate and sailing date within 24 hours of enquiry." },
  { q: "Do you collect the vehicle, or do I need to deliver it to the port for RoRo shipping?", a: "For RoRo, you deliver the vehicle to the departure port yourself — typically Sheerness. Once you book, we issue a shipping note for you to bring on the day. From there, the port team takes over and drives the vehicle onto the vessel — you don't drive it on yourself. We handle all export documentation, port booking, and KRA customs clearance at the Mombasa end." },
  { q: "Can you ship oversized or high vehicles by RoRo?", a: "Yes. Standard sailings have a height limit, but we also arrange specialised high-and-heavy vessels for oversized vehicles, vans, and construction or agricultural machinery. Send us the dimensions and we'll confirm the right vessel and rate." },
    { q: "How do I get a quote?", a: "Use our online quote form or contact us via WhatsApp or email. For FCL or LCL we need cargo dimensions and weight. Quotes are returned within 24 hours." },
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

export default function KenyaPage() {
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
            <span>/</span><span className="text-[#FFA500]">Kenya</span>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🇰🇪</span>
            <span className="inline-flex items-center rounded-full border border-[#FFA500] bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-100">East Africa</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight uppercase mb-6">
            Shipping to Kenya<br /><span className="text-[#FFA500]">from the UK</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mb-8">
            FCL container shipping and air freight from the UK to Kenya. Mombasa Port and Jomo Kenyatta International Airport — export documentation, PVoC coordination, and KRA customs clearance end-to-end.
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

      {/* Instant Quote Estimate */}
      <section className="py-16 md:py-20 bg-[#EDECEC]">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-flex items-center rounded-full bg-[#1A2930] text-[#FFA500] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase mb-4">No Waiting</span>
              <h2 className="text-2xl md:text-3xl font-semibold uppercase text-[#1A2930] mb-4">See a price before you enquire.</h2>
              <p className="text-gray-600 text-base leading-relaxed">Pick a service to see an instant indicative rate — no email required. We'll confirm your exact quote within 24 hours of booking.</p>
            </div>
            <InstantQuoteEstimate destination="kenya" />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <span className="inline-flex items-center rounded-full bg-[#1A2930] text-[#FFA500] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase mb-4">The UK–Kenya Corridor</span>
          <h2 className="text-2xl md:text-3xl font-semibold uppercase text-[#1A2930] mb-6">Container Shipping &amp; Air Freight from the UK to Kenya.</h2>
          <div className="text-gray-700 space-y-5 text-base md:text-lg leading-relaxed">
            <p>Kenya is East Africa's commercial hub and the primary gateway for landlocked neighbours Uganda, Rwanda, South Sudan, and the DRC. Mombasa Port handles the majority of containerised imports from the UK, with the Standard Gauge Railway (SGR) providing fast onward connection to Nairobi's Inland Container Depot at Naivasha.</p>
            <p>Freight demand on the UK-Kenya corridor is driven by commercial importers, NGOs and development organisations procuring equipment and supplies, institutions sourcing UK-manufactured technology and lab materials, and diaspora shippers sending goods home.</p>
            <p>Ellcworth Express manages the complete journey: UK collection or depot drop-off, export documentation, PVoC coordination where required, sea or air freight booking, KRA customs clearance, and Mombasa-to-door delivery through our local agent network.</p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-[#EDECEC]">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <span className="inline-flex items-center rounded-full bg-[#1A2930] text-[#FFA500] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase mb-4">Shipping Options</span>
          <h2 className="text-2xl md:text-3xl font-semibold uppercase text-[#1A2930] mb-10">Container Shipping, Groupage &amp; Air Freight to Mombasa.</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICES.map((s) => (
              <div key={s.title} className="rounded-2xl border border-gray-200 bg-white px-6 py-6 flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl flex-shrink-0">{s.icon}</span>
                    <h3 className="font-semibold text-[#1A2930] text-base break-words">{s.title}</h3>
                  </div>
                  <span className="text-sm font-semibold text-[#FFA500]">{s.price}</span>
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
          <span className="inline-flex items-center rounded-full bg-[#1A2930] text-[#FFA500] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase mb-4">Most Popular</span>
          <h2 className="text-2xl md:text-3xl font-semibold uppercase text-[#1A2930] mb-6">Shipping a car to Kenya — how RoRo works.</h2>
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div className="text-gray-700 space-y-5 text-base leading-relaxed">
              <p>RoRo (Roll-on/Roll-off) is the industry standard for shipping vehicles to Kenya. Once you book, we issue a shipping note — you deliver your car, van, or SUV to the departure port yourself, typically Sheerness. From there, the port team takes over: they drive it onto the vessel and off again at Mombasa. No craning, no containerisation, no risk of strapping damage.</p>
              <p>Transit time from Sheerness to Mombasa is typically 22–26 days depending on routing and intermediate ports of call. From the moment the vessel berths, our Mombasa-based agents begin the KRA customs clearance process.</p>
              <p>RoRo rates start from £1,050 per vehicle. The final price depends on vehicle dimensions, departure port, and the sailing schedule at time of booking. We can typically confirm a rate and sailing date within 24 hours of enquiry.</p>
              <p>Sailings operate to a strict receiving cut-off — typically weekdays only, with a firm delivery deadline before the vessel closes for loading. We confirm this cut-off date and time as part of your booking. Sailing schedules are set by our shipping line partners and can change at short notice; we'll notify you of any changes as soon as we're informed.</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-[#F9FAFB] px-6 py-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#FFA500] mb-4">What you will need</p>
              <ul className="space-y-3">
                {["Original V5C logbook","Valid passport copy (ID page)","Proof of purchase / commercial invoice","Bill of Lading (once issued)","Vehicle clean inside and out","Fuel tank no more than ¼ full","Check personal-items policy for your vessel (varies by sailing)"].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-600">
                    <span className="text-[#FFA500] mt-0.5 flex-shrink-0">✓</span>{item}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-400 mt-5 pt-4 border-t border-gray-200">Missing a document? Contact us before delaying your booking — we will advise on alternatives.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <span className="inline-flex items-center rounded-full bg-[#1A2930] text-[#FFA500] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase mb-4">Kenya Customs</span>
          <h2 className="text-2xl md:text-3xl font-semibold uppercase text-[#1A2930] mb-4">How Kenya customs clearance works.</h2>
          <p className="text-gray-600 mb-10 text-base leading-relaxed max-w-2xl">Kenya Revenue Authority (KRA) processes all imports through the iCMS platform. The IDF and PVoC requirements must be in place before your cargo leaves the UK.</p>
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
          <h2 className="text-2xl md:text-3xl font-semibold uppercase text-[#1A2930] mb-2">UK to Kenya Shipping — Frequently Asked Questions.</h2>
          <p className="text-gray-600 mb-8">Shipping to Kenya from the UK.</p>
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
            <Link href="/destinations/sierra-leone" className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-[#1A2930] hover:border-[#FFA500] hover:text-[#FFA500] transition">Sierra Leone &rarr;</Link>
            <Link href="/destinations/cote-divoire" className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-[#1A2930] hover:border-[#FFA500] hover:text-[#FFA500] transition">Côte d'Ivoire &rarr;</Link>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-[#1A2930] text-white">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold uppercase mb-4">Ready to ship to Kenya?</h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">FCL from £1,700 (20ft). Air freight quoted per kg. Full KRA customs clearance coordination. Quote returned within 24 hours.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:cs@ellcworth.com" className="inline-flex items-center justify-center rounded-full bg-[#FFA500] text-black px-8 py-3 text-sm font-semibold tracking-[0.14em] uppercase hover:bg-[#ffb733] transition shadow-md">cs@ellcworth.com</a>
            <a href="/#quote" className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/5 text-white px-8 py-3 text-sm font-semibold tracking-[0.14em] uppercase hover:bg-white/10 transition">Get a Quote</a>
          </div>
        </div>
      </section>
    </div>
  );
}
