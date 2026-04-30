import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const cargoTypes = [
  {
    icon: "🎓",
    title: "Blank degree certificates",
    body: "Tamper-proof, time-critical. Collected from UK printers, sealed and delivered to campus before graduation. We have never missed a deadline in 12 years.",
  },
  {
    icon: "🔬",
    title: "Lab & scientific equipment",
    body: "Sensitive instruments requiring export documentation, careful packaging and named customs handling at destination.",
  },
  {
    icon: "📚",
    title: "Library & IT equipment",
    body: "Books, servers, terminals and AV equipment — consolidated at our network near UK ports and shipped on the next available vessel.",
  },
  {
    icon: "🏥",
    title: "Medical & humanitarian supplies",
    body: "NGO and faith-based organisation shipments handled with the documentation discipline that institutional procurement requires.",
  },
  {
    icon: "🏛️",
    title: "Regalia & ceremonial items",
    body: "High-value, low-tolerance cargo that must arrive intact and on schedule. Sealed, insured and tracked from collection to campus.",
  },
  {
    icon: "⚙️",
    title: "Industrial & machinery",
    body: "OOG and heavy-lift assessed on merit. If we can do it well, we will. If not, we will say so and refer you to someone who can.",
  },
];

const whyItems = [
  {
    number: "01",
    title: "Sealed and photographed",
    body: "Every institutional shipment is sealed at the point of loading. Seal number and photographic evidence provided before the container leaves UK shores.",
  },
  {
    number: "02",
    title: "Named account manager",
    body: "Not a ticketing system. A named person who knows your shipment, your deadline and your procurement officer's expectations.",
  },
  {
    number: "03",
    title: "Documentation discipline",
    body: "Export declarations, packing lists, certificates of origin and destination customs pre-clearance — all handled and auditable.",
  },
  {
    number: "04",
    title: "Named clearing partners",
    body: "We work with established, named agents at Tema, Lagos and Mombasa. You know who is handling your cargo at destination, not just that someone is.",
  },
  {
    number: "05",
    title: "Procurement-friendly",
    body: "We issue proper invoices, provide shipment reports, and can work within formal procurement frameworks. No cash-in-hand ambiguity.",
  },
  {
    number: "06",
    title: "Retainer option available",
    body: "Regular shippers can lock in a fortnightly sea-freight slot, priority air access and pre-negotiated rates via a monthly retainer. Ask us about pricing.",
  },
];

const stats = [
  { stat: "12+", label: "Years on the UK–West Africa corridor" },
  { stat: "0", label: "Institutional deadlines missed" },
  { stat: "6+", label: "Ghanaian universities served" },
];

const Institutional = () => {
  return (
    <div className="bg-[#EDECEC]">
      <Helmet>
        <title>Institutional Shipping Services | Ellcworth Express</title>
        <meta
          name="description"
          content="Ellcworth Express ships for universities, NGOs and UK exporters to Africa — sealed, documented, on time. Book a 15-minute call to discuss your institutional shipping needs."
        />
        <link rel="canonical" href="https://www.ellcworth.com/institutional" />
        <meta property="og:title" content="Institutional Shipping Services | Ellcworth Express" />
        <meta property="og:description" content="Ellcworth Express ships for universities, NGOs and UK exporters to Africa — sealed, documented, on time. 12 years. Zero institutional deadlines missed." />
        <meta property="og:url" content="https://www.ellcworth.com/institutional" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://www.ellcworth.com/ellc_hero1.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Institutional Shipping Services | Ellcworth Express" />
        <meta name="twitter:description" content="Ellcworth Express ships for universities, NGOs and UK exporters to Africa — sealed, documented, on time. 12 years. Zero institutional deadlines missed." />
      </Helmet>

      {/* ── Hero ── */}
      <section className="relative w-full bg-[#1A2930] text-white py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,165,0,0.08),transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <span className="inline-flex items-center rounded-full border border-[#FFA500] bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-100 mb-6">
            For Institutions
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight uppercase mb-6">
            When the cargo matters,
            <br />
            <span className="text-[#FFA500]">the carrier matters.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mb-10">
            Ellcworth Express works with universities, NGOs and UK exporters who
            cannot afford a shipment that goes wrong. Sealed. Documented. On
            time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="https://calendly.com/ellcworth/15min"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-[#FFA500] text-black px-8 py-3 text-sm font-semibold tracking-[0.14em] uppercase hover:bg-[#ffb733] transition shadow-md"
            >
              Book a 15-minute call
            </a>
            <a
              href="mailto:cs@ellcworth.com"
              className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/5 text-white px-8 py-3 text-sm font-semibold tracking-[0.14em] uppercase hover:bg-white/10 transition"
            >
              Email us directly
            </a>
          </div>
        </div>
      </section>

      {/* ── Certificate proof strip ── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <span className="inline-flex items-center rounded-full bg-[#1A2930] text-[#FFA500] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase mb-4">
            Track Record
          </span>
          <h2 className="text-2xl md:text-3xl font-semibold uppercase text-[#1A2930] mb-6">
            Graduation is 7 days away.
            <br />
            There is no room for error.
          </h2>
          <div className="text-gray-700 space-y-5 text-base md:text-lg leading-relaxed mb-12">
            <p>
              For over 12 years, Ellcworth Express has been the logistics
              partner behind some of Ghana's most important graduation
              ceremonies. Each year, universities across Ghana — including the
              University of Ghana, KNUST, UCC and UDS — outsource the printing
              of their blank degree certificates to specialist printers in the
              UK.
            </p>
            <p>
              By the time we receive the call, graduation is typically 7 days
              away. The certificates must be collected, packaged tamper-proof,
              cleared through UK export and Ghana customs, and delivered to
              campus before the ceremony begins.
            </p>
            <p className="font-semibold text-[#1A2930]">
              In 12 years, we have never let a single institution down.
            </p>
            <p>
              That track record is not an accident. It is the result of a
              logistics process built around institutional requirements — not
              adapted from a consumer model.
            </p>
          </div>

          {/* Stat strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {stats.map((item) => (
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

      {/* ── Why Ellcworth ── */}
      <section className="py-16 md:py-24 bg-[#EDECEC]">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <span className="inline-flex items-center rounded-full bg-[#1A2930] text-[#FFA500] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase mb-4">
            How We Work
          </span>
          <h2 className="text-2xl md:text-3xl font-semibold uppercase text-[#1A2930] mb-10">
            What institutional clients get that others don't.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {whyItems.map((item) => (
              <div
                key={item.number}
                className="rounded-2xl border border-gray-200 bg-white px-6 py-6 flex gap-5"
              >
                <span className="text-[#FFA500] font-bold text-sm tracking-widest flex-shrink-0 pt-1">
                  {item.number}
                </span>
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

      {/* ── Cargo types ── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <span className="inline-flex items-center rounded-full bg-[#1A2930] text-[#FFA500] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase mb-4">
            What We Ship
          </span>
          <h2 className="text-2xl md:text-3xl font-semibold uppercase text-[#1A2930] mb-10">
            Cargo we specialise in for institutional clients.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cargoTypes.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-gray-200 bg-[#F9FAFB] px-6 py-6 flex gap-4"
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

      {/* ── Retainer callout ── */}
      <section className="py-16 md:py-20 bg-[#EDECEC]">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <div className="rounded-2xl bg-[#1A2930] px-8 py-10 md:px-12 md:py-12 flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1">
              <span className="inline-flex items-center rounded-full border border-[#FFA500]/40 bg-white/5 px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase text-[#FFA500] mb-4">
                Retainer Option
              </span>
              <h2 className="text-xl md:text-2xl font-semibold uppercase text-white mb-3">
                Ship regularly? Lock in a monthly retainer.
              </h2>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                Universities, NGOs and exporters with regular volumes can move
                to a monthly retainer — a guaranteed fortnightly sea-freight
                slot, priority air access, pre-negotiated rates and a named
                account manager. No competitor on this corridor offers this. Ask
                us about it on the call.
              </p>
            </div>
            <div className="flex-shrink-0 flex items-center">
              <a
                href="https://calendly.com/ellcworth/15min"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-[#FFA500] text-black px-7 py-3 text-sm font-semibold tracking-[0.14em] uppercase hover:bg-[#ffb733] transition shadow-md whitespace-nowrap"
              >
                Book a call
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Destinations ── */}
      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <span className="inline-flex items-center rounded-full bg-[#1A2930] text-[#FFA500] px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase mb-4">
            Destinations
          </span>
          <h2 className="text-2xl md:text-3xl font-semibold uppercase text-[#1A2930] mb-6">
            Where we ship for institutions.
          </h2>
          <div className="text-gray-700 space-y-5 text-base md:text-lg leading-relaxed mb-8">
            <p>
              Our primary corridor is UK to Ghana — weekly sailings from Tilbury
              and Southampton to Tema, with established customs agents at the
              port. Ghana is where our knowledge and relationships are deepest.
            </p>
            <p>
              We also serve Nigeria, Kenya and a range of West and East African
              destinations. If you are shipping to an institution on the
              continent, talk to us. We will tell you honestly whether we can
              serve it well.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {["Ghana", "Nigeria", "Kenya", "Other Africa"].map((dest) => (
              <div
                key={dest}
                className="rounded-xl border border-gray-200 bg-[#F9FAFB] px-4 py-4 text-center"
              >
                <p className="font-semibold text-[#1A2930] text-sm">{dest}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-16 md:py-20 bg-[#1A2930] text-white">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold uppercase mb-4">
            Let's talk about your shipment.
          </h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">
            A 15-minute call is enough to understand your requirements, your
            destination and your timeline. No obligation. No sales script.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://calendly.com/ellcworth/15min"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-[#FFA500] text-black px-8 py-3 text-sm font-semibold tracking-[0.14em] uppercase hover:bg-[#ffb733] transition shadow-md"
            >
              Book a 15-minute call
            </a>
            <a
              href="mailto:cs@ellcworth.com"
              className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/5 text-white px-8 py-3 text-sm font-semibold tracking-[0.14em] uppercase hover:bg-white/10 transition"
            >
              cs@ellcworth.com
            </a>
          </div>
          <p className="text-gray-500 text-xs mt-6">
            Prefer to read first?{" "}
            <Link
              to="/about"
              className="text-gray-400 underline hover:text-white transition"
            >
              Read our story
            </Link>{" "}
            or{" "}
            <Link
              to="/#quote"
              className="text-gray-400 underline hover:text-white transition"
            >
              request a quote
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
};

export default Institutional;
