import { HiOutlineClipboardDocumentCheck } from "react-icons/hi2";
import { HiOutlineCalculator } from "react-icons/hi2";
import { HiOutlineTruck } from "react-icons/hi2";
import { HiOutlineMapPin } from "react-icons/hi2";

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
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="max-w-2xl mb-14">
          <p className="text-sm font-semibold tracking-wide text-[#FFA500] uppercase mb-2">
            How it works
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A2930] mb-4">
            A clear, professional shipping process
          </h2>
          <p className="text-gray-600 text-base leading-relaxed">
            We follow a structured logistics workflow designed to minimise risk,
            ensure transparency, and keep your shipment moving without
            uncertainty.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {STEPS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-semibold text-gray-400">
                    {item.step}
                  </span>
                  <Icon className="w-8 h-8 text-[#FFA500]" />
                </div>

                <h3 className="text-lg font-semibold text-[#1A2930] mb-3">
                  {item.title}
                </h3>

                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
