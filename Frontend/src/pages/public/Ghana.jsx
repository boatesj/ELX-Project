import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const STATS = [
  { value: "£750", label: "RoRo from", sub: "per vehicle / unit" },
  { value: "£1,500", label: "FCL from", sub: "20ft container" },
  { value: "15–21", label: "Transit days", sub: "UK ports → Tema" },
  { value: "100%", label: "ICUMS compliant", sub: "end-to-end clearance" },
];

const SERVICES = [
  {
    icon: "🚢",
    title: "RoRo Shipping",
    price: "From £750",
    description: "Roll-on/Roll-off is the fastest, most cost-effective method for vehicles and self-propelled machinery. Your unit drives on at Grimsby, Southampton, or Tilbury and drives off at Tema. No containerisation costs, no crane fees.",
    suited: ["Cars & SUVs", "Vans & pickups", "Agricultural machinery", "Construction equipment"],
  },
  {
    icon: "📦",
    title: "FCL — Full Container Load",
    price: "20ft from £1,500 · 40ft from £2,500",
    description: "Your cargo fills a dedicated container — sealed, secured, shipped under your bill of lading. 20ft from £1,500, 40ft from £2,500. Preferred for household goods, commercial stock, institutional equipment, and mixed cargo where security and condition matter.",
    suited: ["Household removals", "Retail stock", "Industrial parts", "Personal effects"],
  },
  {
    icon: "🤝",
    title: "LCL — Groupage",
    price: "Quoted per CBM",
    description: "Share container space with other shippers. Ideal when your cargo does not justify a full box. We consolidate at our UK depot and your freight travels alongside vetted co-loaders.",
    suited: ["Small commercial loads", "Single pallets", "Samples & documents", "Excess baggage"],
  },
  {
    icon: "✈️",
    title: "Air Freight",
    price: "Quoted per kg",
    description: "When time is the constraint. Direct to Kotoka International Airport (ACC), with Accra and Tema delivery options. Door-to-door and airport-to-airport both available.",
    suited: ["Urgent spare parts", "Perishables", "High-value goods", "Time-sensitive documents"],
  },
];

const ICUMS_STEPS = [
  {
    step: "01",
    title: "Pre-Arrival Declaration",
    body: "Under ICUMS (Integrated Customs Management System), importers or their licensed agents must lodge a Pre-Arrival Assessment Reporting System (PAARS) declaration before the vessel reaches Tema. This triggers an advance risk assessment by Ghana Revenue Authority (GRA) officers — meaning clearance work begins before the ship berths.",
  },
  {
    step: "02",
    title: "Customs Classification & Valuation",
    body: "GRA assigns each shipment an HS tariff code. Import duty is calculated on the CIF value (Cost + Insurance + Freight). Most used vehicles attract 20% import duty plus 12.5% VAT. New goods vary by category. Correct classification from the outset is critical — misclassification is the most common cause of delays and demurrage charges at Tema.",
  },
  {
    step: "03",
    title: "Examination & Release",
    body: "ICUMS uses a traffic-light selectivity system: Green (documentary check only), Yellow (document examination), Red (full physical examination of cargo). Well-prepared shipments with accurate documentation typically clear on Green or Yellow. We coordinate directly with our Tema-based agents to manage any examination requests and accelerate release.",
  },
  {
    step: "04",
    title: "Duty Payment & Gate Pass",
    body: "Once assessed, duty and levies are paid through the GRA e-payment portal. A Gate Pass is issued, authorising removal of the cargo from port. Ellcworth Express Ltd manages this step end-to-end — you receive confirmation when your shipment is cleared and ready for collection or onward delivery.",
  },
];

const FAQS = [
  { q: "How long does shipping from the UK to Ghana take?", a: "By sea, expect 15–21 days from Felixstowe, Tilbury, or Southampton to Tema Port. Add 3–5 working days for ICUMS customs clearance. Air freight to Kotoka (ACC) takes 3–5 days door-to-door." },
  { q: "What documents do I need to ship a car to Ghana?", a: "You will need the original V5C logbook, a valid passport copy, proof of ownership or purchase receipt, and a commercial invoice. For the ICUMS pre-arrival declaration, your agent also needs the Bill of Lading once issued. We provide a full checklist when you book." },
  { q: "How is import duty calculated on a used vehicle?", a: "GRA calculates duty on the CIF value (Cost + Insurance + Freight). Most used vehicles attract 20% import duty plus 12.5% VAT plus an ECOWAS levy. The exact figure depends on GRA's depreciated valuation of the vehicle. We provide a duty estimate before you commit." },
  { q: "Can I ship household goods and a car in the same container?", a: "Yes. A 40ft container can comfortably hold one vehicle plus household effects. We consolidate these under a single shipment, which reduces your total freight cost versus booking them separately." },
  { q: "Do you handle delivery from Tema Port to Accra or beyond?", a: "Yes. Our Tema-based partners provide port-to-door delivery across Greater Accra and can arrange onward haulage to Kumasi, Takoradi, and other major cities." },
  { q: "What is ICUMS and why does it matter?", a: "ICUMS is Ghana's national customs platform, operated by the Ghana Revenue Authority. All imports are processed through it. Correct pre-arrival declarations and accurate documentation are essential — errors lead to holds, physical examinations, and port storage charges. Ellcworth Express manages ICUMS clearance on your behalf." },
  { q: "How do I get a quote?", a: "Use our online quote form or contact us directly via WhatsApp or email. For RoRo we need the vehicle make, model, and year. For FCL or LCL we need cargo dimensions and weight. Quotes are typically returned within 24 hours." },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-4 py-5 text-left">
        <span className="font-semibold text-[#1A2930] text-sm md:text-base">{q}</span>
        <span className="text-[#FFA500] text-xl flex-shrink-0">{open ? "−" : "+"}</span>
      </button>
      {open && <p className="text-gray-600 text-sm leading-relaxed pb-5">{a}</p>}
    </div>
  );
}

const GhanaDestination = () => {
  return (
    <div className="bg-[#EDECEC]">
      <Helmet>
        <title>Shipping to Ghana from the UK | Ellcworth Express Ltd</title>
        <meta name="description" content="Ship to Ghana from the UK with Ellcworth Express. RoRo from £750, FCL from £1,500. Tema Port specialists. Full ICUMS customs clearance handled end-to-end." />
        <link rel="canonical" href="https://www.ellcworth.com/destinations/ghana" />
        <meta property="og:title" content="Shipping to Ghana from the UK | Ellcworth Express Ltd" />
        <meta property="og:description" content="RoRo from £750. FCL from £1,500. Tema Port specialists with full ICUMS customs clearance." />
        <meta property="og:url" content="https://www.ellcworth.com/destinations/ghana" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://www.ellcworth.com/ellc_hero1.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Shipping to Ghana from the UK | Ellcworth Express Ltd" />
        <meta name="twitter:description" content="RoRo from £750. FCL from £1,500. Tema Port specialists with full ICUMS customs clearance." />
      </Helmet>

      <section className="relative w-full bg-[#1A2930] text-white py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,165,0,0.08),transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-4 text-sm text-slate-400">
            <Link to="/" className="hover:text-white transition">Home</Link>
            <span>/</span>
            <span className="text-slate-300">Destinations</span>
            <span>/</span>
            <span className="text-[#FFA500]">Ghana</span>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🇬🇭</span>
            <span className="inline-flex items-center rounded-full border border-[#FFA500] bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-100">West Africa</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight uppercase mb-6">
            Shipping to Ghana<br /><span className="text-[#FFA500]">from the UK</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mb-8">
            Ellcworth Express Ltd moves cargo from the UK to Ghana every week — vehicles via RoRo from £750, containers from £1,500. Sea freight to Tema Port, air freight to Kotoka, customs cleared end-to-end under Ghana's ICUMS system.
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
          <span className="inline-flex items-center rounded-full bg-[#1A2930] text-[#FFA500] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase mb-4">The UK–Ghana Corridor</span>
          <h2 className="text-2xl md:text-3xl font-semibold uppercase text-[#1A2930] mb-6">The most active freight corridor we serve.</h2>
          <div className="prose prose-slate max-w-none text-gray-700 space-y-5 text-base md:text-lg leading-relaxed">
            <p>Ghana is one of the busiest shipping corridors from the UK. Demand comes from four directions: the diaspora community sending vehicles and household goods home; UK exporters supplying Ghanaian retailers and construction projects; institutional buyers procuring equipment for agriculture, mining, and infrastructure; and Ghanaian universities, hospitals, and research institutions sourcing degree certificates, lab equipment, library collections, and IT hardware from UK suppliers.</p>
            <p>Tema Port — Ghana's principal deep-water port on the Atlantic coast, 25km east of Accra — handles the vast majority of containerised and RoRo cargo from the UK. It connects directly to the national road network, making onward delivery to Accra, Kumasi, Takoradi, and beyond straightforward once port formalities are complete.</p>
            <p>Ellcworth Express Ltd has built its West Africa operation around this corridor. We serve individual shippers, commercial exporters, and institutions alike. We manage the full journey: UK collection or depot drop-off, export documentation, sea or air freight booking, Ghana customs clearance under ICUMS, and Tema-to-door delivery through our local agent network. One team. One chain. No handoffs.</p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-[#EDECEC]">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <span className="inline-flex items-center rounded-full bg-[#1A2930] text-[#FFA500] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase mb-4">Shipping Options</span>
          <h2 className="text-2xl md:text-3xl font-semibold uppercase text-[#1A2930] mb-10">Four freight modes. One recommendation.</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  {s.suited.map((tag) => (
                    <span key={tag} className="text-[11px] px-3 py-1 rounded-full bg-[#F9FAFB] border border-gray-200 text-gray-500">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <span className="inline-flex items-center rounded-full bg-[#1A2930] text-[#FFA500] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase mb-4">Most Popular</span>
          <h2 className="text-2xl md:text-3xl font-semibold uppercase text-[#1A2930] mb-6">Shipping a car to Ghana — how RoRo works.</h2>
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div className="text-gray-700 space-y-5 text-base leading-relaxed">
              <p>RoRo (Roll-on/Roll-off) is the industry standard for shipping vehicles to Ghana. Your car, van, or SUV is driven onto a purpose-built vessel at a UK RoRo port — typically Grimsby, Southampton, or Tilbury — and driven off at Tema. No craning, no containerisation, no risk of strapping damage.</p>
              <p>Vessels depart weekly. Transit time from the UK to Tema is typically 15–18 days depending on routing and intermediate ports of call. From the moment the vessel berths at Tema, our Ghanaian agents begin the ICUMS customs clearance process.</p>
              <p>RoRo rates start from £750 per vehicle. The final price depends on vehicle dimensions, departure port, and the sailing schedule at time of booking. We can typically confirm a rate and sailing date within 24 hours of enquiry.</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-[#F9FAFB] px-6 py-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#FFA500] mb-4">What you will need</p>
              <ul className="space-y-3">
                {["Original V5C logbook","Valid passport copy (ID page)","Proof of purchase / commercial invoice","Bill of Lading (once issued)","Vehicle clean inside and out","Fuel tank no more than ¼ full","No personal items left inside the vehicle"].map((item) => (
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

      <section className="py-16 md:py-24 bg-[#EDECEC]">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <span className="inline-flex items-center rounded-full bg-[#1A2930] text-[#FFA500] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase mb-4">Ghana Customs</span>
          <h2 className="text-2xl md:text-3xl font-semibold uppercase text-[#1A2930] mb-4">How ICUMS works — and what it means for your shipment.</h2>
          <p className="text-gray-600 mb-10 text-base leading-relaxed max-w-2xl">ICUMS (Integrated Customs Management System) is the Ghana Revenue Authority's national customs platform. Every import into Ghana is processed through it. Here is what happens to your shipment from the moment it approaches Ghanaian waters.</p>
          <div className="space-y-0">
            {ICUMS_STEPS.map((s, i) => (
              <div key={s.step} className={`flex gap-6 ${i < ICUMS_STEPS.length - 1 ? "pb-8 mb-8 border-b border-gray-200" : ""}`}>
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
          <div className="mt-10 rounded-2xl border border-[#FFA500]/30 bg-white px-6 py-5">
            <p className="text-sm text-gray-700 leading-relaxed">
              <span className="font-semibold text-[#1A2930]">Ellcworth Express Ltd handles ICUMS clearance on your behalf.</span>{" "}We work with licensed customs agents at Tema Port, prepare and submit all required documentation, and manage any GRA examination requests. You are kept informed at every stage.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <span className="inline-flex items-center rounded-full bg-[#1A2930] text-[#FFA500] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase mb-4">Why Ellcworth</span>
          <h2 className="text-2xl md:text-3xl font-semibold uppercase text-[#1A2930] mb-10">What makes this corridor different for us.</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: "🔗", title: "Single point of contact", body: "One team manages your shipment from UK pickup to Ghana delivery. No handoffs, no finger-pointing between multiple parties." },
              { icon: "📋", title: "ICUMS expertise", body: "Customs holds and demurrage charges are almost always avoidable with correct documentation. We prepare everything right the first time." },
              { icon: "📍", title: "Tema agent network", body: "Established relationships with licensed customs agents and logistics partners at Tema Port, built over years of weekly shipments." },
              { icon: "⚡", title: "Weekly sailings", body: "We consolidate cargo across a weekly schedule so your goods move without unnecessary delay. No waiting months for a vessel." },
              { icon: "💬", title: "Real communication", body: "Updates when they matter — vessel departure, Tema arrival, customs clearance, delivery confirmation. No chasing required." },
              { icon: "💷", title: "Transparent pricing", body: "Our quotes cover freight, handling, and standard customs disbursements. No surprise invoices at clearance." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-gray-200 bg-[#F9FAFB] px-6 py-6 flex gap-4">
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <div>
                  <p className="font-semibold text-[#1A2930] mb-1">{item.title}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.body}</p>
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
          <p className="text-gray-600 mb-8">Shipping to Ghana from the UK.</p>
          <div className="rounded-2xl border border-gray-200 bg-white px-6 md:px-8">
            {FAQS.map((faq) => (<FAQItem key={faq.q} {...faq} />))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-[#1A2930] text-white">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold uppercase mb-4">Ready to ship to Ghana?</h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">RoRo from £750. FCL from £1,500 (20ft) or £2,500 (40ft). Full ICUMS customs clearance included. Quote returned within 24 hours.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:cs@ellcworth.com" className="inline-flex items-center justify-center rounded-full bg-[#FFA500] text-black px-8 py-3 text-sm font-semibold tracking-[0.14em] uppercase hover:bg-[#ffb733] transition shadow-md">cs@ellcworth.com</a>
            <a href="/#quote" className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/5 text-white px-8 py-3 text-sm font-semibold tracking-[0.14em] uppercase hover:bg-white/10 transition">Get a Quote</a>
          </div>
        </div>
      </section>

    </div>
  );
};

export default GhanaDestination;
