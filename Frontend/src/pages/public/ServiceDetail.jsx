import { Helmet } from "react-helmet-async";
import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FaShip,
  FaCarSide,
  FaPlaneDeparture,
  FaFileSignature,
  FaBoxes,
  FaRegClipboard,
} from "react-icons/fa";

const SERVICES = [
  {
    id: "container",
    icon: FaShip,
    title: "Container shipping (FCL & LCL)",
    body: "Full and shared containers from the UK to key West African ports.",
  },
  {
    id: "roro",
    icon: FaCarSide,
    title: "RoRo vehicle shipping",
    body: "Cars, vans, 4×4s, trucks and plant on regular RoRo sailings.",
  },
  {
    id: "air",
    icon: FaPlaneDeparture,
    title: "Fast air freight",
    body: "Priority options for urgent cargo that can’t wait for a vessel.",
  },
  {
    id: "documents",
    icon: FaFileSignature,
    title: "Secure document logistics",
    body: "Certificates, cheques and other secure print handled with care.",
  },
  {
    id: "repacking",
    icon: FaBoxes,
    title: "Repacking & consolidation",
    body: "Multiple UK deliveries checked, repacked and shipped as one export.",
  },
  {
    id: "customs",
    icon: FaRegClipboard,
    title: "Export & customs support",
    body: "Practical help with export paperwork, valuations and destination rules.",
  },
];

const SEO = {
  container: {
    title: "Container Shipping UK to West Africa | Ellcworth Express",
    desc: "FCL and LCL container shipping from the UK to Ghana and West Africa. Full and shared containers with milestone tracking.",
  },
  roro: {
    title: "RoRo Vehicle Shipping UK to Ghana | Ellcworth Express",
    desc: "Ship cars, vans, trucks and rolling stock from the UK to Ghana and West Africa via RoRo — reliable sailings and documentation guidance.",
  },
  air: {
    title: "Air Freight UK to West Africa | Ellcworth Express",
    desc: "Urgent air freight from the UK to West Africa. Priority uplift for time-critical cargo with visible progress tracking.",
  },
  documents: {
    title: "Secure Document Shipping UK | Ellcworth Express",
    desc: "Controlled handling for certificates, cheques, and sensitive paperwork. Accountable document logistics from the UK.",
  },
  repacking: {
    title: "Repacking & Consolidation Service UK | Ellcworth Express",
    desc: "Consolidate multiple UK deliveries into one export shipment — checked, repacked, and organised for West Africa.",
  },
};

export default function ServiceDetail() {
  const { id } = useParams();

  const service = useMemo(() => SERVICES.find((s) => s.id === id), [id]);

  if (!service) {
    return (
      <section className="relative -mt-[84px] min-h-[calc(100vh-84px)] bg-[#071013] md:-mt-[150px] md:min-h-[calc(100vh-150px)] lg:-mt-[160px] lg:min-h-[calc(100vh-160px)]">
        <div className="mx-auto max-w-5xl px-4 pt-[104px] pb-12 md:px-6 md:pt-[174px] md:pb-14 lg:px-8 lg:pt-[184px]">
          <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-[#0B1118] p-6 shadow-xl md:p-8">
            <p className="text-lg font-semibold text-white">
              Service not found.
            </p>
            <p className="mt-2 text-sm text-gray-300">
              The service you’re looking for may have moved. Choose a service
              from the list and we’ll guide you through the next steps.
            </p>

            <div className="mt-5">
              <Link
                className="inline-flex items-center gap-2 font-semibold text-[#FFA500] transition hover:opacity-90"
                to="/services"
              >
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
      <Helmet>
        <title>{SEO[id]?.title ?? "Service | Ellcworth Express"}</title>
        <meta name="description" content={SEO[id]?.desc ?? ""} />
        <link
          rel="canonical"
          href={`https://www.ellcworth.com/services/${id}`}
        />
      </Helmet>
      <div className="mx-auto max-w-5xl px-4 pt-[104px] pb-12 md:px-6 md:pt-[174px] md:pb-14 lg:px-8 lg:pt-[184px]">
        <div className="mx-auto max-w-4xl">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 font-semibold text-[#FFA500] transition hover:opacity-90"
          >
            ← Back to Services
          </Link>

          <div className="mt-4 rounded-3xl border border-white/10 bg-[#0B1118] p-6 shadow-xl md:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1A2930] text-[#FFA500]">
                <Icon className="text-[18px]" />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 md:text-xs">
                  Service
                </p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white md:text-3xl">
                  {service.title}
                </h1>
                <p className="mt-2 text-gray-300">{service.body}</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white">
                Next step
              </p>
              <p className="mt-2 text-sm text-gray-300">
                Start with a booking request, or log in to manage an existing
                shipment.
              </p>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/#booking"
                  className="inline-flex justify-center rounded-full bg-[#FFA500] px-5 py-2.5 text-sm font-semibold text-[#1A2930] shadow-md shadow-black/20 transition hover:opacity-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFA500]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1118]"
                >
                  Book a Shipment
                </Link>

                <Link
                  to="/login"
                  className="inline-flex justify-center rounded-full border border-[#FFA500]/70 px-5 py-2.5 text-sm font-semibold text-[#FFA500] transition hover:bg-[#FFA500]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFA500]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1118]"
                >
                  Customer Login
                </Link>
              </div>

              <div className="mt-4 text-xs text-gray-400">
                Prefer a quick assist? Use the contact strip below and we’ll
                guide you on routes, pricing and paperwork.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
