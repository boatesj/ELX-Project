import { assets } from "../assets/assets";
import { FaEnvelope, FaPhone } from "react-icons/fa";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full">
      {/* Top bar */}
      <div className="w-full bg-[#1A2930]">
        <div className="container mx-auto flex h-[72px] items-center justify-between px-4 md:px-8 lg:px-16">
          {/* Logo + brand block */}
          <div className="flex min-w-0 items-center gap-3">
            <img
              src={assets.logo_w}
              alt="Ellcworth Express logo"
              className="h-12 w-auto shrink-0 md:h-14"
            />

            <div className="flex flex-col leading-tight">
              <span className="whitespace-nowrap font-brand text-sm font-bold tracking-[0.18em] text-white sm:text-base md:text-xl">
                ELLCWORTH <span className="text-[#FFA500]">EXPRESS</span>
              </span>

              <span className="mt-1 whitespace-nowrap font-brand text-[0.55rem] uppercase tracking-[0.25em] text-[#FFA500] sm:text-[0.6rem] md:text-[0.6rem]">
                SMART LOGISTICS. SEAMLESS FREIGHT
              </span>
            </div>
          </div>

          {/* Contact info */}
          <div className="hidden items-center gap-7 text-xs font-medium lowercase tracking-[0.12em] text-white md:flex md:text-sm">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <FaEnvelope className="text-[#FFA500]" />
              <a href="mailto:cs@ellcworth.com" className="hover:underline">
                cs@ellcworth.com
              </a>
            </div>

            <div className="flex items-center gap-2 whitespace-nowrap">
              <FaPhone className="text-[#FFA500]" />
              <a href="tel:+442089796054" className="hover:underline">
                +44 20 8979 6054
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main nav bar */}
      <div className="w-full bg-[#FFA500] shadow-sm">
        <div className="container mx-auto flex h-[52px] items-center justify-between px-4 md:px-8 lg:px-16">
          <nav
            className="hidden flex-1 justify-center md:flex"
            aria-label="Main navigation"
          >
            <ul className="flex items-center gap-7 text-xs font-medium capitalize tracking-[0.12em] text-[#1A2930] md:text-sm">
              <li>
                <a
                  href="/#Header"
                  className="cursor-pointer hover:text-gray-800"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/#services"
                  className="cursor-pointer hover:text-gray-800"
                >
                  Our Services
                </a>
              </li>
              <li>
                <a
                  href="/#whyus"
                  className="cursor-pointer hover:text-gray-800"
                >
                  Why Us
                </a>
              </li>
              <li>
                <a
                  href="/#repackaging"
                  className="cursor-pointer hover:text-gray-800"
                >
                  Repack &amp; Consolidation
                </a>
              </li>
              <li>
                <a
                  href="/#booking"
                  className="cursor-pointer hover:text-gray-800"
                >
                  Book a Shipment
                </a>
              </li>
              <li>
                <a
                  href="/#testimonials"
                  className="cursor-pointer hover:text-gray-800"
                >
                  Client Stories
                </a>
              </li>
            </ul>
          </nav>

          <Link to="/login">
            <button className="ml-4 hidden rounded-full bg-[#1A2930] px-6 py-2 text-xs font-semibold capitalize tracking-[0.14em] text-white transition hover:bg-[#121c23] md:block md:text-sm">
              Customer Login
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
