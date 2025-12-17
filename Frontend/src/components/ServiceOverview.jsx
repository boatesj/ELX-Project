import { Link } from "react-router-dom";
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

const ServiceOverview = () => {
  return (
    <section
      id="services"
      className="
        w-full
        bg-[#E5E7EB]
        py-12 md:py-16
        border-t border-gray-300
      "
    >
      {/* Back-compat anchor (in case anything links to the old id) */}
      <span id="services-overview" className="block relative -top-[140px]" />

      <div className="mx-auto w-full max-w-6xl px-4 md:px-6 lg:px-8">
        <div
          className="
            relative
            overflow-hidden
            rounded-3xl
            bg-gradient-to-r from-[#1A2930] via-[#1A2930] to-[#FFA500]
            px-5 py-8
            md:px-8 md:py-10
            text-white
            shadow-[0_18px_40px_rgba(15,23,42,0.45)]
          "
        >
          <div className="absolute inset-y-0 right-0 w-24 bg-[#FFA500]/10 blur-3xl pointer-events-none" />

          <div className="relative max-w-3xl">
            <h2 className="text-2xl md:text-[2.1rem] font-semibold tracking-tight mb-3 uppercase">
              Deliveries with Added Value.
            </h2>
            <p className="text-sm md:text-base text-slate-100/90 leading-relaxed">
              Whether it&apos;s a single vehicle, a full container, secure
              documents or a consolidated shipment, every service is built
              around guidance, communication and careful handling from booking
              to delivery.
            </p>
          </div>

          <div
            className="
              relative
              mt-7 md:mt-8
              rounded-2xl
              bg-[#F9FAFB]
              border border-[#9A9EAB]/60
              px-4 py-4
            "
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <p className="text-[11px] md:text-xs font-semibold uppercase tracking-[0.18em] text-[#9A9EAB]">
                Ellcworth service range
              </p>

              {/* ✅ New route entry-point (does not affect landing page) */}
              <Link
                to="/services"
                className="text-[11px] md:text-xs font-semibold tracking-[0.14em] uppercase text-[#1A2930] hover:opacity-80"
              >
                View all →
              </Link>
            </div>

            <div className="grid gap-3 md:gap-4 md:grid-cols-3">
              {SERVICES.map((service) => {
                const Icon = service.icon;
                return (
                  <Link
                    key={service.id}
                    to={`/services/${service.id}`}
                    className="
                      flex items-start gap-3
                      rounded-2xl
                      bg-white/95
                      border border-[#9A9EAB]/50
                      px-3.5 py-3
                      shadow-sm
                      hover:border-[#FFA500]/80
                      hover:shadow-md
                      transition
                    "
                  >
                    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-[#1A2930] text-[#FFA500]">
                      <Icon className="text-sm" />
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-semibold text-[#111827] leading-snug">
                        {service.title}
                      </p>
                      <p className="mt-0.5 text-[11px] md:text-xs text-gray-600 leading-snug">
                        {service.body}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceOverview;
