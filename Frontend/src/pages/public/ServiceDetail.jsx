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

export default function ServiceDetail() {
  const { id } = useParams();

  const service = useMemo(() => SERVICES.find((s) => s.id === id), [id]);

  if (!service) {
    return (
      <div className="pt-[120px] md:pt-[150px] lg:pt-[160px] px-4">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6">
          <p className="text-[#1A2930] font-semibold">Service not found.</p>
          <Link className="text-[#FFA500] font-semibold" to="/services">
            Back to Services →
          </Link>
        </div>
      </div>
    );
  }

  const Icon = service.icon;

  return (
    <div className="pt-[120px] md:pt-[150px] lg:pt-[160px] px-4">
      <div className="mx-auto max-w-4xl">
        <Link to="/services" className="text-[#FFA500] font-semibold">
          ← Back to Services
        </Link>

        <div className="mt-4 rounded-3xl bg-[#0B1118] border border-white/10 p-6 md:p-8 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-[#1A2930] text-[#FFA500] flex items-center justify-center">
              <Icon />
            </div>
            <div>
              <h1 className="text-white text-2xl md:text-3xl font-semibold">
                {service.title}
              </h1>
              <p className="mt-2 text-gray-300">{service.body}</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-white/5 border border-white/10 p-5">
            <p className="text-white font-semibold tracking-[0.14em] uppercase text-xs">
              Next step
            </p>
            <p className="mt-2 text-gray-300 text-sm">
              Use “Book a Shipment” on the homepage, or log in to manage an
              existing booking.
            </p>

            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <a
                href="/#booking"
                className="inline-flex justify-center rounded-full bg-[#FFA500] text-[#1A2930] px-5 py-2 text-sm font-semibold"
              >
                Book a Shipment
              </a>
              <Link
                to="/login"
                className="inline-flex justify-center rounded-full border border-[#FFA500]/70 text-[#FFA500] px-5 py-2 text-sm font-semibold"
              >
                Customer Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
