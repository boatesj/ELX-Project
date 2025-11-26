import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PreFooterCTA from "../components/PreFooterCTA";
import { Outlet } from "react-router-dom";

const RootLayout = () => {
  return (
    <>
      <Navbar />
      <main className="pt-[/* match your navbar height if sticky */]">
        <Outlet />
      </main>
      <PreFooterCTA />
      <Footer />
    </>
  );
};

export default RootLayout;
