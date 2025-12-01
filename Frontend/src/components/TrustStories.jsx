import {
  FaUserTie,
  FaUniversity,
  FaCarSide,
  FaCheckCircle,
  FaStar,
} from "react-icons/fa";

const testimonials = [
  {
    id: 1,
    icon: <FaUniversity className="text-lg" />,
    label: "Higher education",
    title: "Secure documents for an African university",
    quote:
      "Ellcworth handled our degree certificates with care from the UK printer to our campus. The updates were clear, and the handover documentation helped us maintain full control at every stage.",
    name: "Mrs. Nyarko",
    role: "Registry, Presbyterian University",
    rating: 5,
  },
  {
    id: 2,
    icon: <FaCarSide className="text-lg" />,
    label: "Vehicle trader",
    title: "RoRo shipment for a vehicle dealer",
    quote:
      "They confirmed sailing options, guided us on port delivery and issued documents our buyers in Tema can rely on. It’s now straightforward to quote delivery dates with confidence.",
    name: "Kofi Mensah",
    role: "Vehicle trader, Accra",
    rating: 5,
  },
  {
    id: 3,
    icon: <FaUserTie className="text-lg" />,
    label: "Family shipper",
    title: "Personal effects, consolidated and tracked",
    quote:
      "Instead of sending multiple parcels, we shipped everything through Ellcworth. They checked and consolidated our boxes, so we had one shipment, one bill and full visibility until delivery.",
    name: "Ama Boateng",
    role: "Family shipper, Kumasi",
    rating: 5,
  },
];

const renderStars = (rating = 5) => {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <FaStar
          key={index}
          className={index < rating ? "text-[#FFA500]" : "text-gray-300"}
        />
      ))}
    </div>
  );
};

const TrustStories = () => {
  return (
    <section
      id="stories"
      className="
        w-full
        bg-[#F9FAFB]
        py-16 md:py-20
        border-t border-gray-200
      "
    >
      <div className="mx-auto w-full max-w-6xl px-4 md:px-6 lg:px-8">
        {/* Heading + rating summary */}
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full bg-[#1A2930] text-[#FFA500] px-3 py-1 text-[11px] md:text-xs font-semibold tracking-[0.16em] uppercase mb-3">
              Read our reviews
            </span>
            <h2 className="text-3xl md:text-[2.5rem] font-semibold tracking-tight text-[#111827] mb-3 uppercase">
              Real feedback from real shippers.
            </h2>
            <p className="text-base md:text-lg text-gray-700">
              Universities, traders and families trust Ellcworth to move
              sensitive, time-critical cargo between the UK and Africa.
              Here&rsquo;s what a few of them say about working with us.
            </p>
          </div>

          <div className="rounded-2xl border border-[#9A9EAB]/40 bg-white p-4 md:p-5 shadow-sm max-w-xs">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9A9EAB] mb-1">
              Customer satisfaction
            </p>
            <div className="flex items-center gap-3 mb-2">
              {renderStars(5)}
              <span className="text-sm font-semibold text-[#111827]">
                4.9 / 5
              </span>
            </div>
            <p className="text-xs md:text-sm text-gray-600">
              Based on repeat shippers for{" "}
              <span className="font-medium">UK–Africa</span> routes and secure
              document movements.
            </p>
          </div>
        </div>

        {/* Trust pillars (kept, but tightened) */}
        <div className="mb-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-[#9A9EAB]/40 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9A9EAB] mb-2">
              Communication
            </p>
            <h3 className="text-sm md:text-base font-semibold text-[#111827] mb-1">
              Clear updates at key milestones
            </h3>
            <p className="text-sm md:text-[15px] text-gray-700 leading-relaxed">
              From booking and port delivery to vessel departure and arrival, we
              keep you informed so you&rsquo;re never guessing where your
              shipment is.
            </p>
          </div>

          <div className="rounded-2xl border border-[#9A9EAB]/40 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9A9EAB] mb-2">
              Focus
            </p>
            <h3 className="text-sm md:text-base font-semibold text-[#111827] mb-1">
              UK–Africa routes, every day
            </h3>
            <p className="text-sm md:text-[15px] text-gray-700 leading-relaxed">
              Our work is centred on UK exports into African ports, so we know
              the vessels, routes and paperwork your shipment depends on.
            </p>
          </div>

          <div className="rounded-2xl border border-[#9A9EAB]/40 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9A9EAB] mb-2">
              Care
            </p>
            <h3 className="text-sm md:text-base font-semibold text-[#111827] mb-1">
              Extra attention for sensitive cargo
            </h3>
            <p className="text-sm md:text-[15px] text-gray-700 leading-relaxed">
              Whether it&rsquo;s secure documents, a non-runner vehicle or
              personal effects, we take time to understand what&rsquo;s
              important about your shipment.
            </p>
          </div>
        </div>

        {/* Testimonials */}
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((story) => (
            <article
              key={story.id}
              className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A2930] text-[#FFA500]">
                  {story.icon}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9A9EAB]">
                    {story.label}
                  </p>
                  <p className="text-sm font-semibold text-[#111827]">
                    {story.title}
                  </p>
                </div>
              </div>

              <p className="text-sm md:text-[15px] text-gray-700 leading-relaxed mb-4">
                “{story.quote}”
              </p>

              <div className="mt-auto flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-[#111827]">
                      {story.name}
                    </span>
                    <span className="text-xs md:text-sm text-gray-500">
                      {story.role}
                    </span>
                  </div>
                  {renderStars(story.rating)}
                </div>

                <p className="text-[11px] md:text-xs text-gray-500 flex items-center gap-1.5">
                  <FaCheckCircle className="text-[#FFA500]" />
                  <span>Verified Ellcworth shipper.</span>
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustStories;
