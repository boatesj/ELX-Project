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

  return (
    <div
      className={`min-h-screen flex flex-col ${
        isCustomerRoute ? "bg-[#1A2930]" : "bg-[#EDECEC]"
      }`}
    >
      {isCustomerRoute ? <NavbarCustomer /> : <NavbarPublic />}

      <main
        className={`flex-1 ${
          isHome ? "" : "pt-[84px] md:pt-[150px] lg:pt-[160px]"
        } ${isCustomerRoute ? "bg-[#1A2930]" : ""}`}
      >
        <Outlet />
      </main>

      {!isCustomerRoute ? <PreFooterCTA /> : null}

      <Footer />
    </div>
  );
};

export default RootLayout;
