import NavbarPublic from "@/components/NavbarPublic";
import NavbarCustomer from "@/components/NavbarCustomer";
import Footer from "@/components/Footer";
import PreFooterCTA from "@/components/PreFooterCTA";
import { Outlet, useLocation } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";

const RootLayout = () => {
  const location = useLocation();

  const isHome = location.pathname === "/";

  const isCustomerRoute =
    location.pathname.startsWith("/myshipments") ||
    location.pathname.startsWith("/shipmentdetails") ||
    location.pathname.startsWith("/allshipments") ||
    location.pathname.startsWith("/editbooking") ||
    location.pathname.startsWith("/newbooking");

  const headerOffsetClass = isHome
    ? ""
    : isCustomerRoute
      ? "pt-[68px] md:pt-[72px] lg:pt-[72px]"
      : "pt-[64px] md:pt-[122px] lg:pt-[122px]";

  return (
    <div
      className={`min-h-screen flex flex-col ${
        isCustomerRoute ? "bg-[#1A2930]" : "bg-[#EDECEC]"
      }`}
    >
      {isCustomerRoute ? <NavbarCustomer /> : <NavbarPublic />}

      <main
        className={`flex-1 ${headerOffsetClass} ${
          isCustomerRoute ? "bg-[#1A2930]" : "bg-[#EDECEC]"
        }`}
      >
        <Outlet />
      </main>

      {!isCustomerRoute ? <PreFooterCTA /> : null}

      <Footer />

      {/* Floating WhatsApp button — hidden on auth and customer pages */}
      {!isCustomerRoute && location.pathname !== "/login" && (
        <a
          href="https://wa.me/447776234234?text=Hello%20Ellcworth%2C%20I%20have%20a%20shipping%20enquiry."
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with Ellcworth on WhatsApp"
          className="
            fixed bottom-6 right-5
            z-50
            flex h-14 w-14 items-center justify-center
            rounded-full
            bg-[#25D366]
            text-white
            shadow-lg shadow-black/30
            transition hover:bg-[#1ebe5d]
            focus:outline-none focus:ring-2 focus:ring-[#25D366]/80
          "
        >
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-30" />
          <FaWhatsapp className="relative z-10 text-3xl" />
        </a>
      )}
    </div>
  );
};

export default RootLayout;
