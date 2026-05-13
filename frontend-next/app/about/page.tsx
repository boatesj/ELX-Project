import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Ellcworth Express | UK to West Africa Freight Specialists",
  description:
    "For over 12 years Ellcworth Express has shipped critical cargo from the UK to West Africa — including blank degree certificates for Ghana's leading universities. Never missed a deadline.",
  alternates: { canonical: "https://www.ellcworth.com/about" },
  openGraph: {
    title: "About Ellcworth Express | UK to West Africa Freight Specialists",
    description:
      "12 years shipping critical cargo from the UK to West Africa — including blank degree certificates for Ghana's leading universities. Never missed a deadline.",
    url: "https://www.ellcworth.com/about",
    type: "website",
    images: [{ url: "https://www.ellcworth.com/ellc_hero1.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Ellcworth Express | UK to West Africa Freight Specialists",
    description:
      "12 years shipping critical cargo from the UK to West Africa — including blank degree certificates for Ghana's leading universities. Never missed a deadline.",
  },
};

export default function AboutPage() {
  return (
    <div className="bg-[#EDECEC]">
      {/* Hero */}
      <section className="relative w-full bg-[#1A2930] text-white py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,165,0,0.08),transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <span className="inline-flex items-center rounded-full border border-[#FFA500] bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-100 mb-6">
            Our Story
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight uppercase mb-6">
            The story behind
            <br />
            <span className="text-[#FFA500]">Ellcworth Express</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl">
            Twelve years of moving critical cargo from the UK to West Africa —
            without ever missing a deadline that mattered.
          </p>
        </div>
      </section>

      {/* Certificate story */}
      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <div className="mb-10">
            <span className="inline-flex items-center rounded-full bg-[#1A2930] text-[#FFA500] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase mb-4">
              The Certificate Story
            </span>
            <h2 className="text-2xl md:text-3xl font-semibold uppercase text-[#1A2930] mb-6">
              When graduation is 7 days away, there is no room for error.
            </h2>
          </div>
          <div className="text-gray-700 space-y-5 text-base md:text-lg leading-relaxed">
            <p>
              For over 12 years, Ellcworth Express has been the quiet
              infrastructure behind some of Ghana's most important graduation
              ceremonies. Every year, the University of Ghana, KNUST, UCC, UDS,
              UHA and others outsource the design and printing of their blank
              degree certificates to specialist printers in the UK.
            </p>
            <p>
              By the time we receive the call, graduation is typically 7 days
              away. The certificates must be collected from the printer,
              packaged tamper-proof, cleared through UK export and Ghana
              customs, and delivered to campus — on time, every time.
            </p>
            <p>In 12 years, we have never let a single institution down.</p>
            <p>
              No delays. No lost consignments. No excuses. Just a track record
              that speaks for itself — and a reason why Ghana's universities
              keep calling us back, year after year.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { stat: "12+", label: "Years serving Ghana's universities" },
              { stat: "0", label: "Deadlines missed in 12 years" },
              { stat: "6+", label: "Major Ghanaian institutions served" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-gray-200 bg-[#F9FAFB] px-6 py-6 text-center"
              >
                <p className="text-4xl font-bold text-[#FFA500] mb-2">
                  {item.stat}
                </p>
                <p className="text-sm text-gray-600">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we ship */}
      <section className="py-16 md:py-24 bg-[#EDECEC]">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <span className="inline-flex items-center rounded-full bg-[#1A2930] text-[#FFA500] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase mb-4">
            What We Ship
          </span>
          <h2 className="text-2xl md:text-3xl font-semibold uppercase text-[#1A2930] mb-10">
            Critical cargo across every category.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: "🎓",
                title: "Educational cargo",
                body: "Blank certificates, books, library collections and academic materials shipped to institutions across Ghana and West Africa.",
              },
              {
                icon: "🚗",
                title: "Vehicles",
                body: "Cars, vans, 4x4s, lorries and trucks shipped by RoRo or container — from UK ports to Tema and beyond.",
              },
              {
                icon: "🔬",
                title: "Lab & hospital equipment",
                body: "Sensitive scientific and medical equipment requiring careful handling, documentation and customs coordination.",
              },
              {
                icon: "📦",
                title: "Repacking & consolidation",
                body: "Supplier deliveries consolidated at our warehouse network near UK ports — checked, photographed and export-ready.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-gray-200 bg-white px-6 py-6 flex gap-4"
              >
                <span className="text-3xl flex-shrink-0">{item.icon}</span>
                <div>
                  <p className="font-semibold text-[#1A2930] mb-1">
                    {item.title}
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How we work */}
      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <span className="inline-flex items-center rounded-full bg-[#1A2930] text-[#FFA500] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase mb-4">
            How We Work
          </span>
          <h2 className="text-2xl md:text-3xl font-semibold uppercase text-[#1A2930] mb-6">
            A warehouse network, not a single building.
          </h2>
          <div className="text-gray-700 space-y-5 text-base md:text-lg leading-relaxed">
            <p>
              We do not operate from a single fixed warehouse. Instead, we work
              through a trusted network of storage and handling facilities
              positioned close to the airports and freight ports we use most —
              including a confirmed facility in <strong>Grays, Essex</strong>,
              near Tilbury port.
            </p>
            <p>
              This model allows us to consolidate cargo close to its supply
              source, reducing handling time and keeping costs lean. When your
              goods are ready, we collect, consolidate and move — without
              unnecessary legs in the chain.
            </p>
          </div>
        </div>
      </section>

      {/* Our corridor */}
      <section className="py-16 md:py-24 bg-[#EDECEC]">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <span className="inline-flex items-center rounded-full bg-[#1A2930] text-[#FFA500] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase mb-4">
            Our Corridor
          </span>
          <h2 className="text-2xl md:text-3xl font-semibold uppercase text-[#1A2930] mb-6">
            12 years on the UK–West Africa route.
          </h2>
          <div className="text-gray-700 space-y-5 text-base md:text-lg leading-relaxed">
            <p>
              Our primary corridor is UK to Ghana — Tilbury, Sheerness and
              Southampton connecting to Tema port in Accra. Ghana accounts for
              the majority of our volume and is where our customs knowledge,
              agent relationships and on-the-ground network are deepest.
            </p>
            <p>
              We also move cargo to Nigeria, Kenya and other West and East
              African destinations. If you are shipping to a destination on the
              continent, speak to us — we will tell you honestly whether we can
              serve it well.
            </p>
          </div>
        </div>
      </section>

      {/* Founder note */}
      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <span className="inline-flex items-center rounded-full bg-[#1A2930] text-[#FFA500] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase mb-4">
            Founder Note
          </span>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-shrink-0 w-32 h-32 rounded-2xl bg-[#1A2930]/10 border border-gray-200 flex items-center justify-center text-4xl">
              👤
            </div>
            <div className="text-gray-700 space-y-4 text-base md:text-lg leading-relaxed">
              <p>
                Ellcworth Express was built on a simple belief: that businesses
                and institutions moving cargo between the UK and West Africa
                deserve a freight partner who understands both sides of the
                corridor — not just the logistics, but the stakes.
              </p>
              <p>
                We are not a large freight broker. We are a specialist. And that
                specialism is what our clients rely on.
              </p>
              <p className="text-sm text-gray-500 italic">
                — Founder, Ellcworth Express
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-[#1A2930] text-white">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold uppercase mb-4">
            Ready to work with us?
          </h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">
            Whether you are shipping certificates, vehicles or anything in
            between — get in touch and we will tell you exactly what we can do.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:cs@ellcworth.com"
              className="inline-flex items-center justify-center rounded-full bg-[#FFA500] text-black px-8 py-3 text-sm font-semibold tracking-[0.14em] uppercase hover:bg-[#ffb733] transition shadow-md"
            >
              cs@ellcworth.com
            </a>
            <Link
              href="/#quote"
              className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/5 text-white px-8 py-3 text-sm font-semibold tracking-[0.14em] uppercase hover:bg-white/10 transition"
            >
              Get a quote
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
