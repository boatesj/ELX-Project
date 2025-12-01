import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PreFooterCTA from "../components/PreFooterCTA";
import { Outlet, useLocation } from "react-router-dom";

const RootLayout = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen flex flex-col bg-[#1A2930]">
      <Navbar />

      {/* Only push non-home pages down below the fixed navbar */}
      <main
        className={`flex-1 ${
          isHome ? "" : "pt-[120px] md:pt-[150px] lg:pt-[160px]"
        }`}
      >
        <Outlet />
        <PreFooterCTA />
      </main>

      <Footer />
    </div>
  );
};

export default RootLayout;
