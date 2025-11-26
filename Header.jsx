import { useState, useEffect } from "react";

// Full slide data: image + text + optional focal point
const slides = [
  {
    image: "/ellc_hero.png",
    alt: "Vehicle being loaded for RoRo shipment",
    position: "center 35%", // tweak framing per image
    badge: "RoRo & Containers",
    title: "UK → Africa, made simple.",
    subtitle: "RoRo, containers & air freight",
    body: "Book secure shipments for vehicles, documents and cargo with clear pricing and proactive updates.",
    ctaLabel: "Get a shipping quote",
    ctaHref: "#quote",
  },
  {
    image: "/h-2.png",
    alt: "Secure documents being prepared for shipment",
    position: "center 40%",
    badge: "Secure Documents",
    title: "Secure document logistics.",
    subtitle: "For banks, universities & institutions",
    body: "We handle certificates, cheques and sensitive paperwork with tamper-aware packaging and tracked delivery.",
    ctaLabel: "Talk to our team",
    ctaHref: "#contact",
  },
  {
    image: "/h-3.png",
    alt: "Customer receiving vehicle shipment in Africa",
    position: "center 40%",
    badge: "Tracking & Updates",
    title: "Reliable delivery, every sailing.",
    subtitle: "Transparent schedules & updates",
    body: "From port drop-off to final destination, we keep you informed at each step of the journey.",
    ctaLabel: "View routes",
    ctaHref: "#routes",
  },
  {
    image: "/h-4.png",
    alt: "Container ship at sea at sunset",
    position: "center 40%",
    badge: "Container Freight",
    title: "Container freight without the headache.",
    subtitle: "Full support from booking to clearance",
    body: "We work with trusted carriers to move your containers efficiently while keeping customs paperwork under control.",
    ctaLabel: "Discuss a shipment",
    ctaHref: "#contact",
  },
  {
    image: "/h-5.png",
    alt: "Air freight cargo being loaded",
    position: "center 45%",
    badge: "Air Freight",
    title: "When speed matters most.",
    subtitle: "Time-sensitive air freight",
    body: "For urgent documents and high-value shipments, our air-freight options connect UK and Africa at speed.",
    ctaLabel: "Explore air options",
    ctaHref: "#quote",
  },
];

const Header = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance every 6 seconds
  useEffect(() => {
    if (!slides.length) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000);

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
        h-[95vh]              /* hero height */
        mt-[150px]            /* push whole hero down below navbar */
        md:mt-[120px]
        lg:mt-[130px]
        overflow-hidden
        text-white
      "
      aria-label="Ellcworth Express hero"
    >
      {/* BACKGROUND SLIDES – fill entire hero area */}
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
            <img
              src={slide.image}
              alt={slide.alt}
              className="w-full h-full object-cover"
              style={{
                objectPosition: slide.position || "center",
              }}
            />

            {/* Gradient overlay for text contrast */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/70" />
          </div>
        ))}
      </div>

      {/* FOREGROUND CONTENT – centered vertically so it doesn’t hug the top */}
      <div className="relative z-10 flex h-full">
        <div className="mx-auto flex h-full max-w-6xl flex-col gap-10 px-4 pb-12 pt-10 md:flex-row md:items-center">
          {/* LEFT: Text from current slide */}
          <div className="flex-1 space-y-4">
            {currentSlide.badge && (
              <span className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-wide">
                {currentSlide.badge}
              </span>
            )}

            <h1 className="text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
              {currentSlide.title}
            </h1>

            {currentSlide.subtitle && (
              <p className="text-lg text-gray-200">{currentSlide.subtitle}</p>
            )}

            <p className="max-w-xl text-sm text-gray-200 md:text-base">
              {currentSlide.body}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <a
                href={currentSlide.ctaHref}
                className="
                  inline-flex items-center justify-center
                  rounded-full
                  border border-transparent
                  bg-[#FFA500]
                  px-5 py-2
                  text-sm font-semibold text-black
                  shadow-md
                  transition
                  hover:bg-[#ffb733]
                  focus:outline-none
                  focus:ring-2 focus:ring-[#FFA500]/80
                  focus:ring-offset-2 focus:ring-offset-black/40
                "
              >
                {currentSlide.ctaLabel}
              </a>

              <span className="text-xs text-gray-300 md:text-sm">
                Logistics. Freight. RoRo.
              </span>
            </div>
          </div>

          {/* RIGHT: controls & indicators (kept light) */}
          <div className="mt-6 flex flex-1 flex-col items-start gap-4 md:mt-0 md:items-end">
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
                        : "w-2.5 bg-white/40"
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
                  text-sm font-semibold text-gray-100
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
                  text-sm font-semibold text-gray-100
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
