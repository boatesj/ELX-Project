import { useState, useEffect } from "react";

const slides = [
  {
    image: "/ellc_hero1.png",
    imageMobile: "/ellc_hero1-mobile.png",
    alt: "Container vessel at sea carrying stacked shipping containers",
    position: "center 40%",
    mobilePosition: "center 55%",
    badge: "Container Shipping · UK to Africa",
    title: "There’s a smarter way to handle your container shipments.",
    subtitle: "One point of contact for FCL and LCL moves",
    body: "Share what you’re shipping and where it’s going, and we’ll coordinate carriers, paperwork and schedules—then keep you updated so there are no surprises at loading or arrival.",
    ctaLabel: "Plan a container shipment",
    ctaHref: "#quote",
  },
  {
    image: "/ellc_hero2.png",
    imageMobile: "/ellc_hero2-mobile.png",
    alt: "Air cargo aircraft in flight over the clouds",
    position: "center 45%",
    mobilePosition: "center 55%",
    badge: "Time-Critical Air Freight",
    title: "Need it there fast? We make it happen.",
    subtitle: "Priority air options when every day counts",
    body: "We secure space on trusted airlines, monitor each milestone and help your shipment clear quickly at destination—so your urgent cargo arrives when your team or customer expects it.",
    ctaLabel: "Book priority air freight",
    ctaHref: "#quote",
  },
  {
    image: "/ellc_hero3.png",
    imageMobile: "/ellc_hero3-mobile.png",
    alt: "Vehicles being loaded onto a RoRo vessel at the port",
    position: "center 40%",
    mobilePosition: "center 55%",
    badge: "RoRo Vehicle Shipping",
    title: "Exporting your vehicle shouldn’t be the stressful part.",
    subtitle: "RoRo sailings for cars, vans, 4x4s, lorries and trucks",
    body: "You deliver the vehicle to port; we handle the rest—export paperwork, RoRo bookings and shipment updates until it’s safely discharged at the African destination port.",
    ctaLabel: "Get a RoRo vehicle quote",
    ctaHref: "#quote",
  },
  {
    image: "/ellc_hero4.png",
    imageMobile: "/ellc_hero4-mobile.png",
    alt: "Pallet of secure document boxes labelled for global destinations",
    position: "center 45%",
    mobilePosition: "center 55%",
    badge: "Secure Document Logistics",
    title: "Your secure documents stay protected end-to-end.",
    subtitle: "For certificates, cheques and other secure print",
    body: "We work alongside specialist printers and institutions to move high-value documents in tamper-evident packaging, with tracked, signed-for delivery from the print room to the final office.",
    ctaLabel: "Talk to our document team",
    ctaHref: "#contact",
  },
  {
    image: "/ellc_hero5.png",
    imageMobile: "/ellc_hero5-mobile.png",
    alt: "Warehouse team repacking and consolidating cargo on a work table",
    position: "center 45%",
    mobilePosition: "center 55%",
    badge: "Repacking & Consolidation",
    title: "Protect your cargo with export-ready packing.",
    subtitle: "Consolidation and repacking before shipment",
    body: "Send supplier deliveries and online purchases to our warehouse; we’ll check, photograph, repack and consolidate them into a single, secure export so you ship once instead of many times.",
    ctaLabel: "Arrange repacking support",
    ctaHref: "#contact",
  },
];

const Header = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile vs desktop for object-position and general behaviour
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mq = window.matchMedia("(max-width: 768px)");
    const handleChange = (e) => setIsMobile(e.matches);

    handleChange(mq); // initial
    mq.addEventListener("change", handleChange);

    return () => mq.removeEventListener("change", handleChange);
  }, []);

  // Auto-advance every 15 seconds
  useEffect(() => {
    if (!slides.length) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 15000);

    return () => clearInterval(timer);
  }, []);

  if (!slides.length) return null;

  const goToSlide = (index) => setCurrentIndex(index);
  const currentSlide = slides[currentIndex];

  return (
    <section
      id="Header"
      className="
        relative
        w-full
        min-h-[85vh]          /* mobile */
        md:min-h-[110vh]      /* desktop/tablet */
        pt-[120px]
        md:pt-[160px]
        lg:pt-[180px]
        pb-10
        overflow-hidden
        text-white
        scroll-mt-[120px] md:scroll-mt-[160px]
      "
      aria-label="Ellcworth Express hero"
    >
      {/* BACKGROUND SLIDES – full hero area */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`
              absolute inset-0
              transition-opacity duration-1000 ease-in-out
              ${
                index === currentIndex
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              }
            `}
            aria-hidden={index !== currentIndex}
          >
            <picture>
              {slide.imageMobile ? (
                <source srcSet={slide.imageMobile} media="(max-width: 768px)" />
              ) : null}

              <img
                src={slide.image}
                alt={slide.alt}
                className="h-full w-full object-cover"
                style={{
                  objectPosition:
                    (isMobile ? slide.mobilePosition : slide.position) ||
                    "center",
                }}
              />
            </picture>

            {/* Gradient overlay for text contrast */}
            <div
              className="
                absolute inset-0
                bg-gradient-to-b from-black/85 via-black/60 to-black/20
                md:bg-gradient-to-r md:from-black/85 md:via-black/60 md:to-[#FFA500]/10
              "
            />
          </div>
        ))}
      </div>

      {/* FOREGROUND CONTENT */}
      <div className="relative z-0 flex min-h-[60vh] items-center">
        <div className="mx-auto flex w-full max-w-6xl flex-col justify-center px-4 md:px-6 lg:px-8">
          {/* Text block */}
          <div className="max-w-2xl space-y-5">
            {currentSlide.badge ? (
              <span className="inline-flex items-center rounded-full border border-[#FFA500] bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-100">
                {currentSlide.badge}
              </span>
            ) : null}

            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-[2.20rem] font-semibold leading-tight lg:leading-snug uppercase">
              {currentSlide.title}
            </h1>

            {currentSlide.subtitle ? (
              <p className="text-base md:text-xl font-medium text-gray-200">
                {currentSlide.subtitle}
              </p>
            ) : null}

            <p className="text-base md:text-lg text-gray-200">
              {currentSlide.body}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <a
                href={currentSlide.ctaHref}
                className="
                  inline-flex items-center justify-center
                  rounded-full
                  border border-[#FFA500]
                  bg-[#FFA500]
                  px-6 py-2.5
                  text-sm font-semibold text-black
                  shadow-md shadow-black/40
                  transition
                  hover:bg-[#ffb733]
                  focus:outline-none
                  focus:ring-2 focus:ring-[#FFA500]/80
                  focus:ring-offset-2 focus:ring-offset-black/60
                "
              >
                {currentSlide.ctaLabel}
              </a>
            </div>
          </div>

          {/* Controls row */}
          <div className="mt-8 flex max-w-2xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Dots */}
            <div className="flex items-center gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => goToSlide(index)}
                  className={`
                    h-2.5 rounded-full transition-all
                    ${
                      index === currentIndex
                        ? "w-6 bg-[#FFA500]"
                        : "w-2.5 bg-white/35"
                    }
                  `}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-pressed={index === currentIndex}
                />
              ))}
            </div>

            {/* Prev / Next */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setCurrentIndex(
                    (prev) => (prev - 1 + slides.length) % slides.length
                  )
                }
                className="
                  inline-flex h-9 w-9 items-center justify-center
                  rounded-full border border-white/30 bg-black/40
                  text-[15px] font-semibold text-gray-100
                  backdrop-blur-sm
                  transition
                  hover:bg-black/70 hover:text-white
                  focus:outline-none focus:ring-2 focus:ring-white/70
                "
                aria-label="Previous slide"
              >
                ‹
              </button>

              <button
                type="button"
                onClick={() =>
                  setCurrentIndex((prev) => (prev + 1) % slides.length)
                }
                className="
                  inline-flex h-9 w-9 items-center justify-center
                  rounded-full border border-white/30 bg-black/40
                  text-[15px] font-semibold text-gray-100
                  backdrop-blur-sm
                  transition
                  hover:bg-black/70 hover:text-white
                  focus:outline-none focus:ring-2 focus:ring-white/70
                "
                aria-label="Next slide"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Header;
