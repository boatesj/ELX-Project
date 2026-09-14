import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Door to Door Shipping from the UK to Ghana | Ellcworth Express",
  description: "Door to door shipping from the UK to Ghana — collection from your UK address, export clearance, sea or air freight, ICUMS customs clearance, and delivery to your Ghana address. One contact. One invoice.",
  alternates: { canonical: "https://www.ellcworth.com/services/door-to-door-ghana" },
  openGraph: {
    title: "Door to Door Shipping UK to Ghana | Ellcworth Express",
    description: "Full door to door shipping from the UK to Ghana. Collection, export docs, sea or air freight, ICUMS customs clearance, last-mile delivery. From £750 RoRo, £1,500 FCL 20ft.",
    url: "https://www.ellcworth.com/services/door-to-door-ghana",
    siteName: "Ellcworth Express",
    type: "website",
    images: [{ url: "https://www.ellcworth.com/ellc_hero1.png" }],
  },
  twitter: { card: "summary_large_image", title: "Door to Door Shipping UK to Ghana | Ellcworth Express", description: "Collection, export clearance, sea or air freight, ICUMS customs, last-mile delivery. One contact, one invoice." },
};

const STEPS = [
  {
    step: "01",
    title: "Collection from your UK address",
    body: "We collect from your home, business, or supplier anywhere in the UK. If your cargo is coming from multiple suppliers, we consolidate at our Grays, Essex depot before export. Alternatively you can deliver directly to the depot or a UK port.",
  },
  {
    step: "02",
    title: "Export documentation",
    body: "We prepare all UK export paperwork — HMRC export declaration, commercial invoice review, packing list, EORI verification, and any certificates of origin. For vehicles, we handle the V5C, DVLA export notification, and port booking. Nothing leaves the UK without the correct paperwork in place.",
  },
  {
    step: "03",
    title: "Sea or air freight to Ghana",
    body: "We book and manage the freight leg. Container shipping (FCL or LCL) to Tema Port takes 15–21 days from UK ports. Air freight to Accra International Airport (ACC) takes 3–5 days. RoRo vehicle shipping to Tema takes 14–18 days. We confirm vessel or flight details and provide tracking updates throughout.",
  },
  {
    step: "04",
    title: "ICUMS customs clearance at Tema or Accra",
    body: "Our in-country agents handle the full ICUMS pre-arrival declaration, customs examination, duty assessment, and gate pass. Ghana Customs Service duty is paid through the GRA e-payment portal. You receive confirmation when your shipment is cleared and ready for release — typically 3–5 working days after vessel berthing.",
  },
  {
    step: "05",
    title: "Last-mile delivery in Ghana",
    body: "Once cleared, our Accra-based partners arrange delivery to your nominated Ghana address — home, business, warehouse, or campus. We confirm delivery with photographic evidence and a signed delivery note. You do not need to be present at the port at any stage.",
  },
];

const SERVICES = [
  { mode: "FCL 20ft container", price: "From £1,500", transit: "15–21 days", suited: "Commercial stock, household effects, retail goods" },
  { mode: "FCL 40ft container", price: "From £2,500", transit: "15–21 days", suited: "Large volume cargo, machinery, furniture" },
  { mode: "LCL groupage", price: "Quoted per CBM", transit: "18–25 days", suited: "Smaller loads, shared container space" },
  { mode: "RoRo vehicle shipping", price: "From £750", transit: "14–18 days", suited: "Cars, vans, SUVs, trucks, plant" },
  { mode: "Air freight", price: "Quoted per kg", transit: "3–5 days", suited: "Urgent cargo, documents, high-value goods" },
];

const FAQS = [
  { q: "What does door to door shipping from the UK to Ghana include?", a: "Our door to door service covers: collection from your UK address, export documentation and HMRC customs declaration, sea or air freight to Ghana, ICUMS pre-arrival declaration, Ghana Customs Service clearance at Tema Port or Accra Airport, and last-mile delivery to your Ghana address. Everything is coordinated through one point of contact at Ellcworth Express." },
  { q: "How long does door to door shipping from the UK to Ghana take?", a: "By sea, the total door to door transit is typically 21–30 days — 15–21 days ocean freight plus 3–5 working days for ICUMS customs clearance and last-mile delivery. By air, total door to door is typically 5–8 days including Accra customs clearance and delivery." },
  { q: "How much does door to door shipping to Ghana cost?", a: "Door to door costs depend on the freight mode and cargo volume. A 20ft FCL container starts from £1,500 for the sea freight leg, with export documentation, ICUMS clearance, and last-mile delivery quoted additionally. Air freight is quoted per kg. We provide a full landed cost breakdown at the quoting stage — no hidden charges." },
  { q: "Do I need to go to the port in Ghana to collect my shipment?", a: "No. Our Accra-based agents manage the full port clearance process on your behalf. Your cargo is delivered directly to your Ghana address once cleared. You receive photographic confirmation of delivery." },
  { q: "Can you collect from multiple UK addresses or suppliers?", a: "Yes. We can collect from multiple UK addresses and consolidate at our Grays, Essex depot before export. This is useful when buying from several UK suppliers who will ship directly to us on your behalf." },
  { q: "Do you offer door to door shipping to other West African countries?", a: "Yes. We offer door to door shipping from the UK to Nigeria (Apapa Port, Lagos), Kenya (Mombasa), Sierra Leone (Freetown), Côte d'Ivoire (Abidjan), and Benin (Cotonou). Contact us for a quote on any of these destinations." },
];

export default function DoorToDoorGhanaPage() {
  return (
    <main className="bg-white text-[#1A2930]">
      {/* Hero */}
      <section className="bg-[#1A2930] text-white py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FFA500] mb-4">Service · UK to Ghana</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Door to door shipping from the UK to Ghana</h1>
          <p className="text-lg text-gray-300 leading-relaxed max-w-2xl">Collection from your UK address to delivery at your Ghana door. Export documentation, sea or air freight, ICUMS customs clearance and last-mile delivery — one contact, one invoice, 15+ years on this corridor.</p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link href="/#quote" className="inline-flex items-center gap-2 rounded-full bg-[#FFA500] px-6 py-3 text-sm font-bold text-black uppercase tracking-widest hover:brightness-110 transition">Get a Quote →</Link>
            <Link href="/destinations/ghana" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:border-white/50 transition">Ghana shipping guide →</Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-gray-100 py-10">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "15+", label: "Years UK–Ghana" },
              { value: "5", label: "Steps, one contact" },
              { value: "0", label: "Deadlines missed" },
              { value: "3–5 days", label: "Air freight transit" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-xl font-bold text-[#FFA500]">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-2">How door to door shipping works</h2>
          <p className="text-sm text-gray-500 mb-10">Every step managed by Ellcworth Express from your UK postcode to your Ghana address.</p>
          <div className="space-y-8">
            {STEPS.map((s, i) => (
              <div key={s.step} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[#FFA500] text-black font-bold text-sm flex items-center justify-center shrink-0">{s.step}</div>
                  {i < STEPS.length - 1 && <div className="w-px flex-1 bg-gray-200 my-2" />}
                </div>
                <div className="pb-8">
                  <p className="font-semibold text-[#1A2930] mb-2">{s.title}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rates */}
      <section className="bg-[#F9FAFB] border-t border-gray-100 py-14 md:py-20">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-2">Door to door rates — UK to Ghana</h2>
          <p className="text-sm text-gray-500 mb-8">Freight rates shown. Export documentation, customs clearance, and last-mile delivery quoted additionally at the enquiry stage.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-[#1A2930]">
                  <th className="text-left py-3 pr-6 font-semibold text-[#1A2930]">Mode</th>
                  <th className="text-left py-3 pr-6 font-semibold text-[#1A2930]">From</th>
                  <th className="text-left py-3 pr-6 font-semibold text-[#1A2930]">Transit</th>
                  <th className="text-left py-3 font-semibold text-[#1A2930]">Best for</th>
                </tr>
              </thead>
              <tbody>
                {SERVICES.map((s, i) => (
                  <tr key={s.mode} className={i % 2 === 0 ? "bg-white" : "bg-[#F9FAFB]"}>
                    <td className="py-3 pr-6 font-semibold">{s.mode}</td>
                    <td className="py-3 pr-6 text-[#FFA500] font-bold">{s.price}</td>
                    <td className="py-3 pr-6 text-gray-500">{s.transit}</td>
                    <td className="py-3 text-gray-500">{s.suited}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-4">All rates from UK ports or depot. Confirmed at booking. Rates reviewed regularly.</p>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-8">Frequently asked questions</h2>
          <div className="space-y-6">
            {FAQS.map((f) => (
              <div key={f.q} className="border-b border-gray-100 pb-6 last:border-0">
                <p className="font-semibold mb-2">{f.q}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{f.a}</p>
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
            {[
              ["Ghana full guide", "/destinations/ghana"],
              ["Nigeria", "/destinations/nigeria"],
              ["Kenya", "/destinations/kenya"],
              ["Sierra Leone", "/destinations/sierra-leone"],
              ["Pricing & rates", "/pricing"],
            ].map(([label, href]) => (
              <Link key={href} href={href} className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-[#1A2930] hover:border-[#FFA500] hover:text-[#FFA500] transition">{label} →</Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-[#1A2930] text-white">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to ship door to door?</h2>
          <p className="text-gray-300 mb-8">Tell us what you need to move and where. We respond within one business day with a full cost breakdown.</p>
          <Link href="/#quote" className="inline-flex items-center gap-2 rounded-full bg-[#FFA500] px-8 py-4 text-sm font-bold text-black uppercase tracking-widest hover:brightness-110 transition">Get a Quote →</Link>
        </div>
      </section>
    </main>
  );
}
