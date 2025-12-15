import { Link } from "react-router-dom";
import { FaShip, FaRoute, FaBoxes } from "react-icons/fa";

function Elements() {
  const cards = [
    {
      id: "ports",
      to: "/elements/ports",
      icon: FaShip,
      title: "Ports",
      body: "Manage origin/destination ports used in your shipments.",
    },
    {
      id: "service-types",
      to: "/elements/service-types",
      icon: FaRoute,
      title: "Service types",
      body: "Configure services such as sea freight, RoRo, air freight, and documents.",
    },
    {
      id: "cargo-categories",
      to: "/elements/cargo-categories",
      icon: FaBoxes,
      title: "Cargo categories",
      body: "Define cargo types like vehicles, containers, LCL, and documents.",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A2930]">Elements</h1>
          <p className="mt-1 text-sm text-gray-500">
            Master data powering your bookings, rates and reporting.
          </p>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map(({ id, to, icon: Icon, title, body }) => (
          <Link
            key={id}
            to={to}
            className="group rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#FFA500]/10">
                <Icon className="text-[#FFA500]" />
              </span>
              <h2 className="text-sm font-semibold text-[#1A2930]">{title}</h2>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">{body}</p>
            <span className="mt-3 inline-flex text-[11px] font-semibold uppercase tracking-[0.16em] text-[#FFA500]">
              Manage
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Elements;
