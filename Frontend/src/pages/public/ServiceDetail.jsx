import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { getServiceById } from "../../data/servicesCatalog";

export default function ServiceDetail() {
  const { id } = useParams();

  const service = useMemo(() => getServiceById(id), [id]);

  if (!service) {
    return (
      <div className="px-4">
        <div className="mx-auto max-w-4xl rounded-3xl bg-[#0B1118] border border-white/10 p-6 md:p-8 shadow-xl">
          <p className="text-white text-lg font-semibold">Service not found.</p>
          <p className="mt-2 text-gray-300 text-sm">
            The service you’re looking for may have moved. Choose a service from
            the list and we’ll guide you through the next steps.
          </p>

          <div className="mt-5">
            <Link
              className="inline-flex items-center gap-2 text-[#FFA500] font-semibold hover:opacity-90 transition"
              to="/services"
            >
              ← Back to Services
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const Icon = service.icon;

  // Deep-link: preserves the service context (works with your service-based quote section)
  const quoteHref = `/?service=${encodeURIComponent(service.id)}#quote`;
  const bookingHref = `/?service=${encodeURIComponent(service.id)}#booking`;

  return (
    <div className="px-4">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/services"
          className="inline-flex items-center gap-2 text-[#FFA500] font-semibold hover:opacity-90 transition"
        >
          ← Back to Services
        </Link>

        <div className="mt-4 rounded-3xl bg-[#0B1118] border border-white/10 p-6 md:p-8 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-[#1A2930] text-[#FFA500] flex items-center justify-center border border-white/10">
              <Icon className="text-[18px]" />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] md:text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                {service.eyebrow}
              </p>
              <h1 className="mt-1 text-white text-2xl md:text-3xl font-semibold tracking-tight">
                {service.title}
              </h1>
              <p className="mt-2 text-gray-300">{service.body}</p>
            </div>
          </div>

          {/* Corporate panels */}
          <div className="mt-7 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
              <p className="text-white font-semibold tracking-[0.14em] uppercase text-xs">
                Best for
              </p>
              <p className="mt-2 text-gray-300 text-sm">{service.bestFor}</p>
            </div>

            <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
              <p className="text-white font-semibold tracking-[0.14em] uppercase text-xs">
                Key highlights
              </p>
              <ul className="mt-2 space-y-2 text-sm text-gray-300">
                {(service.highlights || []).map((h) => (
                  <li key={h} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#FFA500]" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl bg-black/20 border border-white/10 p-5 lg:col-span-1">
              <p className="text-white font-semibold tracking-[0.14em] uppercase text-xs">
                What you’ll need
              </p>
              <ul className="mt-3 space-y-2 text-sm text-gray-300">
                {(service.requirements || []).map((r) => (
                  <li key={r} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-white/40" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-black/20 border border-white/10 p-5 lg:col-span-1">
              <p className="text-white font-semibold tracking-[0.14em] uppercase text-xs">
                Typical documents
              </p>
              <ul className="mt-3 space-y-2 text-sm text-gray-300">
                {(service.docs || []).map((d) => (
                  <li key={d} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-white/40" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-black/20 border border-white/10 p-5 lg:col-span-1">
              <p className="text-white font-semibold tracking-[0.14em] uppercase text-xs">
                How it works
              </p>
              <ol className="mt-3 space-y-2 text-sm text-gray-300 list-decimal list-inside">
                {(service.steps || []).map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </div>
          </div>

          {/* Next steps CTA */}
          <div className="mt-7 rounded-2xl bg-white/5 border border-white/10 p-5">
            <p className="text-white font-semibold tracking-[0.14em] uppercase text-xs">
              Next step
            </p>
            <p className="mt-2 text-gray-300 text-sm">
              Start with a quote request for{" "}
              <span className="text-white font-semibold">{service.title}</span>,
              or log in to manage an existing shipment.
            </p>

            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <Link
                to={quoteHref}
                className="inline-flex justify-center rounded-full bg-[#FFA500] text-[#1A2930] px-5 py-2.5 text-sm font-semibold shadow-md shadow-black/20 hover:opacity-95 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFA500]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1118]"
              >
                {service.cta?.label || "Request a Quote"}
              </Link>

              <Link
                to={bookingHref}
                className="inline-flex justify-center rounded-full border border-[#FFA500]/70 text-[#FFA500] px-5 py-2.5 text-sm font-semibold hover:bg-[#FFA500]/10 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFA500]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1118]"
              >
                Go to booking
              </Link>

              <Link
                to="/login"
                className="inline-flex justify-center rounded-full border border-white/10 text-white/80 px-5 py-2.5 text-sm font-semibold hover:bg-white/10 transition"
              >
                Customer Login
              </Link>
            </div>

            <div className="mt-4 text-xs text-gray-400">
              Prefer a quick assist?{" "}
              <a
                href="/#contact"
                className="text-[#FFA500] font-semibold hover:opacity-90 transition"
              >
                Use the contact strip below
              </a>{" "}
              and we’ll guide you on routes, pricing and paperwork.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
