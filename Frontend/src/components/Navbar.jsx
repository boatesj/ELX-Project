import { assets } from "../assets/assets";
import { FaEnvelope, FaPhone } from "react-icons/fa";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="w-full z-10 fixed top-0 left-0">
      {/* Top bar */}
      <div className="w-full bg-[#1A2930] text-white">
        <div className="container mx-auto flex justify-between items-center py-2 px-4 md:px-8 lg:px-16">
          {/* Logo + brand block */}
          <div className="flex items-center gap-3">
            <img
              src={assets.logo_w}
              alt="Ellcworth Express logo"
              className="w-12 h-auto md:w-14"
            />

            <div className="flex flex-col leading-tight">
              {/* COMPANY NAME */}
              <span className="font-brand text-sm sm:text-base md:text-xl font-bold tracking-[0.18em] text-white">
                ELLCWORTH <span className="text-[#FFA500]">EXPRESS</span>
              </span>

              {/* TAGLINE */}
              <span
                className="
                  font-brand
                  text-[0.55rem]
                  sm:text-[0.6rem]
                  md:text-[0.6rem]
                  tracking-[0.25em]
                  uppercase
                  text-[#FFA500]
                  mt-1
                "
              >
                SMART LOGISTICS. SEAMLESS FREIGHT
              </span>
            </div>
          </div>

          {/* Contact info */}
          <div className="hidden md:flex items-center gap-7 text-xs md:text-sm font-medium text-white tracking-[0.12em] lowercase">
            <div className="flex items-center gap-2">
              <FaEnvelope className="text-[#FFA500]" />
              <a href="mailto:cs@ellcworth.com" className="hover:underline">
                cs@ellcworth.com
              </a>
            </div>
            <div className="flex items-center gap-2">
              <FaPhone className="text-[#FFA500]" />
              <a href="tel:0208414800" className="hover:underline">
                +44 20 8979 6054
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main nav bar */}
      <div className="w-full bg-[#FFA500]">
        <div className="container mx-auto flex items-center justify-between py-3 px-4 md:px-8 lg:px-16">
          {/* Centered menu links */}
          <div className="flex-1 hidden md:flex justify-center">
            <ul className="flex gap-7 text-xs md:text-sm font-medium text-[#1A2930] tracking-[0.12em] capitalize">
              <a href="#Header" className="cursor-pointer hover:text-gray-800">
                Home
              </a>
              <a
                href="#services"
                className="cursor-pointer hover:text-gray-800"
              >
                Our Services
              </a>
              <a href="#whyus" className="cursor-pointer hover:text-gray-800">
                Why Us
              </a>
              <a
                href="#repackaging"
                className="cursor-pointer hover:text-gray-800"
              >
                Repack &amp; Consolidation
              </a>
              <a href="#booking" className="cursor-pointer hover:text-gray-800">
                Book a Shipment
              </a>
              <a
                href="#testimonials"
                className="cursor-pointer hover:text-gray-800"
              >
                Client Stories
              </a>
            </ul>
          </div>

          {/* Button on the right */}
          <Link to="/login">
            <button className="hidden md:block bg-[#1A2930] text-white px-6 py-2 rounded-full text-xs md:text-sm font-semibold tracking-[0.14em] capitalize hover:bg-[#121c23] transition ml-4">
              Customer Login
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
