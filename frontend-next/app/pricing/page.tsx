import type { Metadata } from "next";
import Link from "next/link";
import PricingClient from "./PricingClient";

export const metadata: Metadata = {
  title: "UK to West Africa Shipping Costs & Rates | Container, RoRo & Air Freight | Ellcworth Express",
  description: "Transparent shipping rates from the UK to Ghana, Nigeria, Kenya, Sierra Leone and Côte d'Ivoire. FCL 20ft from £1,500, FCL 40ft from £2,500, RoRo from £750, air freight quoted per kg.",
  alternates: { canonical: "https://www.ellcworth.com/pricing" },
  openGraph: {
    title: "UK to West Africa Shipping Costs & Rates | Ellcworth Express",
    description: "Transparent shipping rates from the UK to Ghana, Nigeria, Kenya, Sierra Leone and Côte d'Ivoire. FCL, RoRo, LCL and air freight.",
    url: "https://www.ellcworth.com/pricing",
    siteName: "Ellcworth Express",
    type: "website",
    images: [{ url: "https://www.ellcworth.com/ellc_hero1.png" }],
  },
  twitter: { card: "summary_large_image", title: "UK to West Africa Shipping Rates | Ellcworth Express", description: "FCL 20ft from £1,500. RoRo from £750. Air freight quoted per kg. Ghana, Nigeria, Kenya and more." },
};

const FAQS = [
  { q: "How much does it cost to ship a 20ft container from the UK to Ghana?", a: "FCL 20ft container shipping from the UK to Tema Port, Ghana starts from £1,500. The final rate depends on cargo type, collection point, and the sailing schedule at time of booking. Transit time is typically 15–21 days." },
  { q: "How much does it cost to ship a 40ft container from the UK to Ghana?", a: "FCL 40ft container shipping from the UK to Tema Port, Ghana starts from £2,500. Rates are confirmed at booking and depend on cargo type and sailing schedule." },
  { q: "How much does it cost to ship a car to Ghana by RoRo?", a: "RoRo vehicle shipping to Tema Port, Ghana starts from £750 per vehicle. Rates depend on vehicle dimensions and the sailing at time of booking. Transit time is typically 14–18 days from UK ports." },
  { q: "How much does air freight from the UK to Ghana cost?", a: "Air freight to Accra International Airport (ACC) is quoted per kg and depends on chargeable weight, dimensions, and urgency. We confirm rates within 24 hours of enquiry. Transit time is typically 3–5 days door-to-door." },
  { q: "What is included in the shipping rate?", a: "Our rates cover port-to-port freight. Export documentation, ICUMS customs clearance (Ghana), destination port handling, and last-mile delivery are available as additional services. We provide a full breakdown at the quoting stage so there are no surprises." },
  { q: "Do you offer door-to-door shipping to Ghana?", a: "Yes. We offer door-to-port and door-to-door options. Collection from anywhere in the UK, export clearance, sea or air freight, destination customs clearance, and delivery to the final address in Ghana — all coordinated through one point of contact." },
];

export default function PricingPage() {
  return (
    <main className="bg-white text-[#1A2930]">
      {/* Hero */}
      <section className="bg-[#1A2930] text-white py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 md:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FFA500] mb-4">Shipping rates</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">UK to West Africa — shipping costs</h1>
          <p className="text-lg text-gray-300 leading-relaxed max-w-2xl">Live indicative rates for container shipping, RoRo vehicle shipping, LCL groupage and air freight from the UK to Ghana, Nigeria, Kenya, Sierra Leone and Côte d'Ivoire.</p>
        </div>
      </section>

      {/* Live rates */}
      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-5xl px-4 md:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-2">Current rates by destination</h2>
          <p className="text-sm text-gray-500 mb-8">Select a destination to see indicative rates. All rates are from UK ports and confirmed at booking.</p>
          <PricingClient />
        </div>
      </section>

      {/* What affects price */}
      <section className="bg-[#F9FAFB] border-t border-gray-100 py-14 md:py-20">
        <div className="mx-auto max-w-5xl px-4 md:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-8">What affects the final price?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "Cargo type and volume", body: "FCL rates are fixed per container. LCL is priced per CBM. RoRo is per vehicle unit. Air freight is per chargeable kg — whichever is greater between actual and volumetric weight." },
              { title: "Collection point", body: "Cargo collected from your UK premises incurs a collection charge based on distance. Cargo delivered directly to the port or our Grays, Essex depot avoids this." },
              { title: "Sailing schedule", body: "Rates fluctuate with vessel availability. Booking 2–4 weeks ahead of your required sailing typically secures the best rate. Late bookings on high-demand sailings cost more." },
              { title: "Destination customs", body: "Import duties, port handling fees, and customs clearance costs at the destination are separate from the freight rate. We provide a full landed cost estimate at the quoting stage." },
              { title: "Insurance", body: "Marine cargo insurance is strongly recommended and quoted separately. Rates typically range from 0.5%–1.5% of cargo value depending on commodity and mode." },
              { title: "Special cargo", body: "Hazardous goods, oversized cargo, refrigerated units, and vehicles with modifications attract surcharges. Flag these at the enquiry stage for an accurate quote." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-gray-200 bg-white px-6 py-5">
                <p className="font-semibold mb-2">{item.title}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-5xl px-4 md:px-6 lg:px-8">
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
        <div className="mx-auto max-w-5xl px-4 md:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 mb-4">Destination guides</p>
          <div className="flex flex-wrap gap-3">
            {[
              ["Ghana", "/destinations/ghana"],
              ["Nigeria", "/destinations/nigeria"],
              ["Kenya", "/destinations/kenya"],
              ["Sierra Leone", "/destinations/sierra-leone"],
              ["Côte d'Ivoire", "/destinations/cote-divoire"],
              ["Benin", "/destinations/benin"],
            ].map(([label, href]) => (
              <Link key={href} href={href} className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-[#1A2930] hover:border-[#FFA500] hover:text-[#FFA500] transition">{label} →</Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-[#1A2930] text-white">
        <div className="mx-auto max-w-5xl px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready for a confirmed quote?</h2>
          <p className="text-gray-300 mb-8">Indicative rates are a starting point. Get a confirmed quote with full cost breakdown within one business day.</p>
          <Link href="/#quote" className="inline-flex items-center gap-2 rounded-full bg-[#FFA500] px-8 py-4 text-sm font-bold text-black uppercase tracking-widest hover:brightness-110 transition">Get a Quote →</Link>
        </div>
      </section>
    </main>
  );
}
