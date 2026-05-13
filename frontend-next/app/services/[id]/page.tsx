import type { Metadata } from "next";
import Link from "next/link";
import {
  FaShip, FaCarSide, FaPlaneDeparture, FaFileSignature,
  FaBoxes, FaRegClipboard, FaBolt,
} from "react-icons/fa";

const SERVICES = [
  { id: "container", icon: FaShip, title: "Container shipping (FCL & LCL)", body: "Full and shared containers from the UK to key West African ports." },
  { id: "roro", icon: FaCarSide, title: "RoRo vehicle shipping", body: "Cars, vans, 4×4s, trucks and plant on regular RoRo sailings." },
  { id: "air", icon: FaPlaneDeparture, title: "Fast air freight", body: "Priority options for urgent cargo that can't wait for a vessel." },
  { id: "jit", icon: FaBolt, title: "Just In Time (JIT) Delivery", body: "A dedicated end-to-end logistics solution for time-critical, high-integrity consignments on the UK to Ghana corridor." },
  { id: "documents", icon: FaFileSignature, title: "Secure document logistics", body: "Certificates, cheques and other secure print handled with care." },
  { id: "repacking", icon: FaBoxes, title: "Repacking & consolidation", body: "Multiple UK deliveries checked, repacked and shipped as one export." },
  { id: "customs", icon: FaRegClipboard, title: "Export & customs support", body: "Practical help with export paperwork, valuations and destination rules." },
];

const SEO: Record<string, { title: string; desc: string }> = {
  container: {
    title: "Container Shipping UK to West Africa | Ellcworth Express",
    desc: "FCL and LCL container shipping from the UK to Ghana and West Africa. Full and shared containers with milestone tracking.",
  },
  roro: {
    title: "RoRo Vehicle Shipping UK to Ghana | Ellcworth Express",
    desc: "Ship cars, vans, trucks and rolling stock from the UK to Ghana and West Africa via RoRo — reliable sailings and documentation guidance.",
  },
  air: {
    title: "Air Freight UK to Ghana & West Africa | Ellcworth Express",
    desc: "Urgent air freight from the UK to Ghana and West Africa. Academic certificate runs, medical supplies, IT equipment — tight deadlines handled professionally.",
  },
  documents: {
    title: "Secure Document Shipping UK | Ellcworth Express",
    desc: "Controlled handling for certificates, cheques, and sensitive paperwork. Accountable document logistics from the UK.",
  },
  repacking: {
    title: "Repacking & Consolidation Service UK | Ellcworth Express",
    desc: "Consolidate multiple UK deliveries into one export shipment — checked, repacked, and organised for West Africa.",
  },
  jit: {
    title: "Just In Time (JIT) Delivery UK to Ghana | Ellcworth Express",
    desc: "Dedicated time-critical air freight for graduation certificates and high-integrity cargo. 12 years. Zero failures. UK to Ghana.",
  },
  customs: {
    title: "Export & Customs Support UK to West Africa | Ellcworth Express",
    desc: "Practical guidance on export paperwork, valuations and destination customs rules for Ghana and West Africa.",
  },
};

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const seo = SEO[id];
  if (!seo) return { title: "Service | Ellcworth Express" };
  return {
    title: seo.title,
    description: seo.desc,
    alternates: { canonical: `https://www.ellcworth.com/services/${id}` },
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { id } = await params;

  // ── JIT full-page render ──
  if (id === "jit") {
    return (
      <section className="relative -mt-[84px] min-h-[calc(100vh-84px)] bg-[#071013] md:-mt-[150px] md:min-h-[calc(100vh-150px)] lg:-mt-[160px] lg:min-h-[calc(100vh-160px)]">
        <div className="mx-auto max-w-5xl px-4 pt-[104px] pb-16 md:px-6 md:pt-[174px] lg:px-8 lg:pt-[184px]">
          <div className="mx-auto max-w-4xl">
            <Link href="/services" className="inline-flex items-center gap-2 font-semibold text-[#FFA500] transition hover:opacity-90">
              ← Back to Services
            </Link>

            <div className="mt-6 rounded-3xl border border-[#FFA500]/30 bg-[#0B1118] p-6 shadow-xl md:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#FFA500]/10 border border-[#FFA500]/30 text-[#FFA500]">
                  <FaBolt className="text-[18px]" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FFA500]">Air Freight · Critical Tier</p>
                  <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white md:text-3xl">Just In Time (JIT) Delivery</h1>
                  <p className="mt-2 text-gray-300">UK to Ghana · Time-Critical Cargo</p>
                </div>
              </div>
              <div className="mt-8 border-t border-white/10 pt-8">
                <p className="text-lg font-semibold text-white md:text-xl">
                  When the production window has closed and the deadline has not — JIT absorbs the gap.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-3xl border border-white/10 bg-[#0B1118] p-6 md:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FFA500] mb-4">The Problem</p>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>Graduation is fixed. The venue is booked. The families have travelled. There is no version of events in which the ceremony is postponed because certificates did not arrive.</p>
                <p>And yet the production process does not always cooperate. Printers run late. Approvals take longer than expected. Design revisions go to the wire. By the time blank certificates are ready for collection, the window that once seemed manageable has compressed into something that looks, on paper, impossible.</p>
                <p>The procurement director does not need a freight company that will try its best. They need one that will not fail.</p>
              </div>
            </div>

            <div className="mt-4 rounded-3xl border border-white/10 bg-[#0B1118] p-6 md:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FFA500] mb-4">How JIT Came About</p>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>Ellcworth Express has been handling exactly this consignment — for exactly this deadline — for over 12 years. What began as a single urgent assignment became a repeat engagement. Then a pattern. Then a process refined over a decade of not once missing a graduation deadline.</p>
                <p>JIT was not designed in a boardroom. It was built in the field, shaped by the real pressures procurement directors face every year — and by our absolute refusal to let any one of them down.</p>
                <p>When you hand a JIT consignment to Ellcworth, the deadline transfers with it. It becomes our problem to solve — and our record to protect.</p>
              </div>
            </div>

            <div className="mt-4 rounded-3xl border border-[#FFA500]/30 bg-[#0B1118] p-6 md:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FFA500] mb-6">What Every JIT Consignment Includes</p>
              <div className="space-y-4">
                {[
                  { title: "Immediate assessment", body: "We confirm viability and commit within the hour. No waiting. No ambiguity." },
                  { title: "Direct collection", body: "From your UK printer or supplier — we come to them, on your timeline." },
                  { title: "Tamper-evident packaging", body: "Full chain-of-custody documentation from collection to delivery confirmation." },
                  { title: "Priority air freight", body: "Carrier space confirmed before your consignment moves. No standby. No compromise." },
                  { title: "ICUMS customs clearance", body: "Managed by in-country agents who know the Ghana customs system — not generalists learning it at your expense." },
                  { title: "Last-mile delivery", body: "To campus or your nominated Ghana address — confirmed and photographed on arrival." },
                  { title: "Single point of contact", body: "Reachable and accountable from collection to delivery. You will always know where your consignment is." },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4 items-start border-b border-white/5 pb-4 last:border-0 last:pb-0">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#FFA500]/10 border border-[#FFA500]/30 flex items-center justify-center mt-0.5">
                      <FaBolt className="text-[#FFA500] text-[10px]" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{item.title}</p>
                      <p className="mt-1 text-sm text-gray-400 leading-relaxed">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-3xl border border-white/10 bg-[#0B1118] p-6 md:p-8">
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { stat: "12+", label: "Years on this corridor" },
                  { stat: "0", label: "Deadlines missed" },
                  { stat: "100%", label: "Consignment integrity" },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-3xl md:text-4xl font-bold text-[#FFA500]">{item.stat}</p>
                    <p className="mt-1 text-xs text-gray-400 uppercase tracking-[0.14em]">{item.label}</p>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-center text-sm text-gray-400 italic">
                Not because we got lucky — because we built a process that does not leave room for luck.
              </p>
            </div>

            <div className="mt-4 rounded-3xl border border-[#FFA500]/30 bg-[#FFA500]/5 p-6 md:p-8">
              <p className="text-white font-semibold text-lg mb-2">If your deadline is already close — contact us now.</p>
              <p className="text-gray-400 text-sm mb-6">
                JIT is available to universities, examination bodies, secure print houses and organisations moving time-critical cargo between the UK and West Africa.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="mailto:cs@ellcworth.com" className="inline-flex justify-center rounded-full bg-[#FFA500] px-6 py-3 text-sm font-semibold text-[#1A2930] hover:opacity-95 transition">
                  Contact our JIT team
                </a>
                <Link href="/#booking" className="inline-flex justify-center rounded-full border border-[#FFA500]/60 px-6 py-3 text-sm font-semibold text-[#FFA500] hover:bg-[#FFA500]/10 transition">
                  Book a shipment
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const service = SERVICES.find((s) => s.id === id);

  if (!service) {
    return (
      <section className="relative -mt-[84px] min-h-[calc(100vh-84px)] bg-[#071013] md:-mt-[150px] md:min-h-[calc(100vh-150px)] lg:-mt-[160px] lg:min-h-[calc(100vh-160px)]">
        <div className="mx-auto max-w-5xl px-4 pt-[104px] pb-12 md:px-6 md:pt-[174px] md:pb-14 lg:px-8 lg:pt-[184px]">
          <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-[#0B1118] p-6 shadow-xl md:p-8">
            <p className="text-lg font-semibold text-white">Service not found.</p>
            <p className="mt-2 text-sm text-gray-300">The service you're looking for may have moved. Choose a service from the list and we'll guide you through the next steps.</p>
            <div className="mt-5">
              <Link href="/services" className="inline-flex items-center gap-2 font-semibold text-[#FFA500] transition hover:opacity-90">
                ← Back to Services
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const Icon = service.icon;

  return (
    <section className="relative -mt-[84px] min-h-[calc(100vh-84px)] bg-[#071013] md:-mt-[150px] md:min-h-[calc(100vh-150px)] lg:-mt-[160px] lg:min-h-[calc(100vh-160px)]">
      <div className="mx-auto max-w-5xl px-4 pt-[104px] pb-12 md:px-6 md:pt-[174px] md:pb-14 lg:px-8 lg:pt-[184px]">
        <div className="mx-auto max-w-4xl">
          <Link href="/services" className="inline-flex items-center gap-2 font-semibold text-[#FFA500] transition hover:opacity-90">
            ← Back to Services
          </Link>

          <div className="mt-4 rounded-3xl border border-white/10 bg-[#0B1118] p-6 shadow-xl md:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1A2930] text-[#FFA500]">
                <Icon className="text-[18px]" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 md:text-xs">Service</p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white md:text-3xl">{service.title}</h1>
                <p className="mt-2 text-gray-300">{service.body}</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white">Next step</p>
              <p className="mt-2 text-sm text-gray-300">Start with a booking request, or log in to manage an existing shipment.</p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Link href="/#booking" className="inline-flex justify-center rounded-full bg-[#FFA500] px-5 py-2.5 text-sm font-semibold text-[#1A2930] shadow-md shadow-black/20 transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFA500]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1118]">
                  Book a Shipment
                </Link>
                <Link href="/login" className="inline-flex justify-center rounded-full border border-[#FFA500]/70 px-5 py-2.5 text-sm font-semibold text-[#FFA500] transition hover:bg-[#FFA500]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFA500]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1118]">
                  Customer Login
                </Link>
              </div>
              <div className="mt-4 text-xs text-gray-400">
                Prefer a quick assist? Use the contact strip below and we'll guide you on routes, pricing and paperwork.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
