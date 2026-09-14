import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shipping to Benin from the UK | RoRo & Container Freight | Ellcworth Express",
  description: "RoRo vehicle shipping and container freight from the UK to Benin. Cotonou Port is a direct RoRo call on regular West Africa sailings. Full customs clearance end-to-end.",
  alternates: { canonical: "https://www.ellcworth.com/destinations/benin" },
  openGraph: {
    title: "Shipping to Benin from the UK | RoRo & Container Freight | Ellcworth Express",
    description: "RoRo vehicle shipping and container freight from the UK to Benin. Cotonou Port is a direct RoRo call on regular West Africa sailings. Full customs clearance end-to-end.",
    url: "https://www.ellcworth.com/destinations/benin",
    siteName: "Ellcworth Express",
    type: "website",
    images: [{ url: "https://www.ellcworth.com/ellc_hero1.png" }],
  },
  twitter: { card: "summary_large_image", title: "Shipping to Benin from the UK | Ellcworth Express", description: "RoRo vehicle shipping and container freight UK to Benin. Cotonou Port direct call. Full customs clearance." },
};

const SERVICES = [
  { icon: "\u{1F6A2}", title: "RoRo Vehicle Shipping to Benin", price: "From \u00a3850", description: "Cotonou Port Autonome is a direct RoRo call on regular West Africa sailings from Grimsby, Tilbury or Southampton. You deliver the vehicle to your nearest departure port using the shipping note we issue \u2014 the port team drives it onto the vessel and off again at Cotonou. No containerisation costs, no crane fees.", suited: ["Cars & SUVs", "Vans & pickups", "Agricultural machinery", "Construction equipment"] },
  { icon: "\u{1F4E6}", title: "Container Shipping to Benin", price: "20ft from \u00a31,600 \u00b7 40ft from \u00a32,800", description: "FCL containers from UK ports to Cotonou \u2014 Benin\u2019s principal deep-water port and a key transit gateway for landlocked Niger, Burkina Faso and northern Nigeria.", suited: ["Commercial goods", "Industrial equipment", "Retail stock", "NGO supplies"] },
  { icon: "\u{1F91D}", title: "LCL \u2014 Groupage", price: "Quoted per CBM", description: "Share container space with other shippers moving cargo to Cotonou. We consolidate at our UK depot under a single bill of lading.", suited: ["Small commercial loads", "Single pallets", "Samples", "Personal effects"] },
];

const CUSTOMS = [
  { step: "01", title: "ECOWAS Import Documentation", body: "Benin applies ECOWAS Common External Tariff rates. All commercial imports require a customs declaration lodged through the SYDONIA system operated by the Direction G\u00e9n\u00e9rale des Douanes et Droits Indirects (DGDDI). Our Cotonou agents prepare and lodge the declaration before arrival." },
  { step: "02", title: "Pre-Shipment Inspection (Cotecna)", body: "Commercial imports above the threshold value require inspection and a Certificate of Conformity from Cotecna before goods leave the UK. We coordinate the inspection as part of the export process, ensuring the certificate is in place before the vessel or aircraft departs." },
  { step: "03", title: "Customs Assessment & Duty Payment", body: "Import duty is assessed on CIF value. Benin applies ECOWAS tariff bands of 0%, 5%, 10%, or 20% depending on the product category. Duty is paid through the SIGIF treasury payment system. Our local agents manage assessment, payment, and release." },
  { step: "04", title: "Port Release & Delivery", body: "A release order is issued once duty is paid authorising removal from the Port Autonome de Cotonou. Our Cotonou-based partners confirm clearance and arrange onward delivery across Cotonou and upcountry destinations." },
];

const FAQS = [
  { q: "Is Cotonou a direct RoRo port from the UK?", a: "Yes. Cotonou Port Autonome is a direct call on regular West Africa RoRo sailings from Grimsby, Tilbury and Southampton. Transit time from UK ports to Cotonou is typically 16\u201320 days. There is no transhipment." },
  { q: "How much does it cost to ship a car to Benin?", a: "RoRo rates to Cotonou start from \u00a3850 per vehicle. The final price depends on vehicle dimensions and the sailing schedule at time of booking. We can usually confirm a rate and sailing date within 24 hours of enquiry." },
  { q: "Can I use Cotonou as a gateway to Niger or Burkina Faso?", a: "Yes. Cotonou is the principal transit port for landlocked Niger and Burkina Faso, and a secondary gateway for northern Nigeria. We can arrange port-to-port shipping to Cotonou with your nominated inland agent handling onward movement." },
];

export default function BeninPage() {
  return (
    <main className="bg-white text-[#1A2930]">
      <section className="bg-[#1A2930] text-white py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FFA500] mb-4">Destination \u00b7 Benin</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Shipping to Benin from the UK</h1>
          <p className="text-lg text-gray-300 leading-relaxed max-w-2xl">RoRo vehicle shipping and container freight to Cotonou Port \u2014 a direct call on regular West Africa sailings. Gateway to Niger, Burkina Faso and northern Nigeria.</p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link href="/#quote" className="inline-flex items-center gap-2 rounded-full bg-[#FFA500] px-6 py-3 text-sm font-bold text-black uppercase tracking-widest hover:brightness-110 transition">Get a Quote →</Link>
            <Link href="/destinations/ghana" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:border-white/50 transition">Also shipping to Ghana →</Link>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-100 py-10">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "From \u00a3850", label: "RoRo per vehicle" },
              { value: "16\u201320 days", label: "Transit to Cotonou" },
              { value: "Direct", label: "Port call \u2014 no transhipment" },
              { value: "15+ years", label: "West Africa experience" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-xl font-bold text-[#FFA500]">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-8">Shipping services to Benin</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {SERVICES.map((s) => (
              <div key={s.title} className="rounded-2xl border border-gray-200 bg-white px-6 py-6 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-2xl">{s.icon}</span>
                  <span className="text-xs font-bold text-[#FFA500] bg-[#FFA500]/10 px-3 py-1 rounded-full whitespace-nowrap">{s.price}</span>
                </div>
                <h3 className="font-semibold text-[#1A2930] text-base">{s.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{s.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {s.suited.map((tag) => <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{tag}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#1A2930] text-white py-14 md:py-20">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-8">Customs clearance in Benin</h2>
          <div className="space-y-6">
            {CUSTOMS.map((s) => (
              <div key={s.step} className="flex gap-5">
                <span className="text-[#FFA500] font-bold text-sm shrink-0 mt-0.5">{s.step}</span>
                <div>
                  <p className="font-semibold mb-1">{s.title}</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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

      <section className="py-10 bg-[#EDECEC] border-t border-gray-200">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 mb-4">Also shipping to</p>
          <div className="flex flex-wrap gap-3">
            {[
              ["Ghana", "/destinations/ghana"],
              ["Nigeria", "/destinations/nigeria"],
              ["Côte d'Ivoire", "/destinations/cote-divoire"],
              ["Kenya", "/destinations/kenya"],
              ["Sierra Leone", "/destinations/sierra-leone"],
            ].map(([label, href]) => (
              <Link key={href} href={href} className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-[#1A2930] hover:border-[#FFA500] hover:text-[#FFA500] transition">{label} →</Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-[#1A2930] text-white">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to ship to Benin?</h2>
          <p className="text-gray-300 mb-8">Get a quote within one business day. RoRo, container and groupage options available.</p>
          <Link href="/#quote" className="inline-flex items-center gap-2 rounded-full bg-[#FFA500] px-8 py-4 text-sm font-bold text-black uppercase tracking-widest hover:brightness-110 transition">Get a Quote →</Link>
        </div>
      </section>
    </main>
  );
}
