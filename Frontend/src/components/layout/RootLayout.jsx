import NavbarPublic from "@/components/NavbarPublic";
import NavbarCustomer from "@/components/NavbarCustomer";
import Footer from "@/components/Footer";
import PreFooterCTA from "@/components/PreFooterCTA";
import { Outlet, useLocation } from "react-router-dom";

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
    </div>
  );
};

export default RootLayout;
