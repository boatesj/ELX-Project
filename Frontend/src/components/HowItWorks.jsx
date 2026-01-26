// Frontend/src/components/HowItWorks.jsx
import {
  HiOutlineClipboardDocumentCheck,
  HiOutlineCalculator,
  HiOutlineTruck,
  HiOutlineMapPin,
} from "react-icons/hi2";

const STEPS = [
  {
    step: "01",
    title: "Request a Quote",
    description:
      "Tell us what you’re shipping, where it’s going, and your preferred service. Our logistics team reviews every request to ensure accuracy and compliance.",
    icon: HiOutlineCalculator,
  },
  {
    step: "02",
    title: "Confirm & Book",
    description:
      "We issue a clear quotation with timelines and charges. Once approved, your shipment is formally booked and scheduled for movement.",
    icon: HiOutlineClipboardDocumentCheck,
  },
  {
    step: "03",
    title: "Collection & Transit",
    description:
      "Your cargo is collected or received, documented, and shipped via the selected route. We manage handling, port coordination, and carrier liaison.",
    icon: HiOutlineTruck,
  },
  {
    step: "04",
    title: "Tracking & Delivery",
    description:
      "You receive status updates through key milestones until arrival and delivery at destination.",
    icon: HiOutlineMapPin,
  },
];

export default function HowItWorks() {
  return (
    <section className="relative bg-[#F6F7F9] py-20 md:py-24 border-y border-gray-200">
      {/* Subtle corporate texture + separation so it doesn't merge with adjacent sections */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_260px_at_20%_0%,rgba(255,165,0,0.10),transparent_60%),radial-gradient(700px_220px_at_85%_10%,rgba(26,41,48,0.08),transparent_60%)]" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="max-w-2xl mb-12 md:mb-14">
          <p className="text-xs md:text-sm font-semibold tracking-[0.18em] text-[#FFA500] uppercase mb-3">
            How it works
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-[#1A2930] mb-4">
            A clear, professional shipping process
          </h2>
          <p className="text-gray-600 text-base leading-relaxed">
            We follow a structured logistics workflow designed to minimise risk,
            ensure transparency, and keep your shipment moving without
            uncertainty.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {STEPS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="
                  group
                  rounded-2xl
                  border border-gray-200
                  bg-white
                  p-6
                  shadow-[0_10px_30px_-22px_rgba(15,23,42,0.35)]
                  hover:shadow-[0_18px_44px_-26px_rgba(15,23,42,0.45)]
                  hover:border-gray-300
                  transition
                "
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-semibold tracking-[0.18em] text-gray-400">
                    {item.step}
                  </span>

                  <div className="h-10 w-10 rounded-xl bg-[#FFA500]/15 border border-[#FFA500]/25 grid place-items-center">
                    <Icon className="w-6 h-6 text-[#FFA500]" />
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-[#1A2930] mb-3">
                  {item.title}
                </h3>

                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.description}
                </p>

                <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-0 group-hover:opacity-100 transition" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
