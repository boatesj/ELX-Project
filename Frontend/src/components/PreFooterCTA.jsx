import { FaPhoneAlt, FaEnvelope } from "react-icons/fa";

const PreFooterCTA = () => {
  return (
    <section
      className="
        w-full
        bg-[#FFA500]
        text-[#1A2930]
        py-6 md:py-8
        border-t border-[#9A9EAB]/30
      "
    >
      <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Message */}
        <div className="text-center md:text-left">
          <h3 className="text-lg md:text-xl font-bold tracking-tight uppercase">
            Need help with a shipment?
          </h3>
          <p className="text-sm md:text-[15px] text-[#1A2930] mt-1">
            We’re here to guide you with routes, pricing and paperwork.
          </p>
        </div>

        {/* CTA buttons */}
        <div className="flex items-center gap-4 flex-wrap justify-center">
          {/* EMAIL BUTTON — now dark bg, orange text */}
          <a
            href="mailto:info@ellcworth.com"
            className="
                  inline-flex items-center gap-2
                  rounded-full
                  bg-[#1A2930]
                  text-[#FFA500]
                  px-5 py-2.5
                  text-sm md:text-base font-semibold
                  shadow-md shadow-black/30
                  transition
                  hover:bg-[#121c23]
                "
          >
            <FaEnvelope className="text-[15px] text-[#FFA500]" />
            Email us
          </a>

          {/* CALL BUTTON — now orange bg, dark text */}
          <a
            href="tel:+442089796054"
            className="
                  inline-flex items-center gap-2
                  rounded-full
                  bg-[#FFA500]
                  text-[#1A2930]
                  px-5 py-2.5
                  text-sm md:text-base font-semibold
                  shadow-md shadow-black/30
                  transition
                  border-[1px]
                  hover:bg-[#ffb733]
                "
          >
            <FaPhoneAlt className="text-[15px] text-[#1A2930]" />
            Call us
          </a>
        </div>
      </div>
    </section>
  );
};

export default PreFooterCTA;
