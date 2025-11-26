import {
  FaUserTie,
  FaUniversity,
  FaCarSide,
  FaCheckCircle,
} from "react-icons/fa";

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
        {/* Heading */}
        <div className="mb-10 max-w-3xl">
          <span className="inline-flex items-center rounded-full bg-[#1A2930] text-[#FFA500] px-3 py-1 text-[11px] md:text-xs font-semibold tracking-[0.16em] uppercase mb-3">
            Why shippers trust Ellcworth
          </span>
          <h2 className="text-3xl md:text-[2.5rem] font-semibold tracking-tight text-[#111827] mb-3 uppercase">
            Built around real customers, not just cargo.
          </h2>
          <p className="text-base md:text-lg text-gray-700">
            Behind every shipment is a university, a trader or a family with a
            deadline. We design our service around their reality, with clear
            updates and careful handling from booking to delivery.
          </p>
        </div>

        {/* Top row — Trust pillars */}
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
              let you know what&rsquo;s happening so you&rsquo;re never
              guessing.
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
              Our work is centred on UK exports into African ports, so
              we&rsquo;re familiar with the routes, sailings and paperwork our
              customers rely on.
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

        {/* Bottom row — User stories */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Story 1 */}
          <article className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A2930] text-[#FFA500]">
                <FaUniversity className="text-lg" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9A9EAB]">
                  User story
                </p>
                <p className="text-sm font-semibold text-[#111827]">
                  Secure documents for an African university
                </p>
              </div>
            </div>
            <p className="text-sm md:text-[15px] text-gray-700 leading-relaxed mb-4">
              A UK secure printer sends degree certificates to our warehouse. We
              check cartons, apply tamper-evident seals and arrange tracked
              export to the university campus, with signed proof at handover.
            </p>
            <p className="mt-auto text-xs md:text-sm text-gray-500 flex items-center gap-1.5">
              <FaCheckCircle className="text-[#FFA500]" />
              <span>Designed for registrars and examination offices.</span>
            </p>
          </article>

          {/* Story 2 */}
          <article className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A2930] text-[#FFA500]">
                <FaCarSide className="text-lg" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9A9EAB]">
                  User story
                </p>
                <p className="text-sm font-semibold text-[#111827]">
                  RoRo shipment for a vehicle trader
                </p>
              </div>
            </div>
            <p className="text-sm md:text-[15px] text-gray-700 leading-relaxed mb-4">
              A UK trader buys vehicles at auction. We confirm sailing options,
              book RoRo space, guide them on port delivery and issue shipping
              documents their buyers can trust at the destination port.
            </p>
            <p className="mt-auto text-xs md:text-sm text-gray-500 flex items-center gap-1.5">
              <FaCheckCircle className="text-[#FFA500]" />
              <span>Clear expectations on costs, timing and documents.</span>
            </p>
          </article>

          {/* Story 3 */}
          <article className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 md:p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A2930] text-[#FFA500]">
                <FaUserTie className="text-lg" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9A9EAB]">
                  User story
                </p>
                <p className="text-sm font-semibold text-[#111827]">
                  Family consolidating personal effects
                </p>
              </div>
            </div>
            <p className="text-sm md:text-[15px] text-gray-700 leading-relaxed mb-4">
              A family orders items from several UK retailers. Instead of
              shipping each parcel separately, they send everything to our
              warehouse. We check, photograph and consolidate into a single
              export shipment.
            </p>
            <p className="mt-auto text-xs md:text-sm text-gray-500 flex items-center gap-1.5">
              <FaCheckCircle className="text-[#FFA500]" />
              <span>Fewer shipments, better control over total cost.</span>
            </p>
          </article>
        </div>
      </div>
    </section>
  );
};

export default TrustStories;
