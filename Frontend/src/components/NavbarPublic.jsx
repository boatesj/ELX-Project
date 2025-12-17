import { useState } from "react";
import { assets } from "@/assets/assets";
import { FaEnvelope, FaPhone, FaBars, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";

const NavbarPublic = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="w-full z-20 fixed top-0 left-0">
      {/* ===== Top bar ===== */}
      <div className="w-full bg-[#1A2930] text-white">
        <div className="container mx-auto flex justify-between items-center py-2 px-4 md:px-8 lg:px-16">
          {/* Logo + brand */}
          <div className="flex items-center gap-3">
            <img
              src={assets.logo_w}
              alt="Ellcworth Express logo"
              className="w-12 h-auto md:w-14"
            />

            <div className="flex flex-col leading-tight">
              <span className="font-brand text-sm sm:text-base md:text-xl font-bold tracking-[0.18em] text-white">
                ELLCWORTH <span className="text-[#FFA500]">EXPRESS</span>
              </span>
              <span className="font-brand text-[0.55rem] sm:text-[0.6rem] tracking-[0.25em] uppercase text-[#FFA500] mt-1">
                Smart logistics. Seamless freight
              </span>
            </div>
          </div>

          {/* Contact info (desktop only) */}
          <div className="hidden md:flex items-center gap-7 text-xs md:text-sm font-medium tracking-[0.12em]">
            <div className="flex items-center gap-2">
              <FaEnvelope className="text-[#FFA500]" />
              <a href="mailto:cs@ellcworth.com">cs@ellcworth.com</a>
            </div>
            <div className="flex items-center gap-2">
              <FaPhone className="text-[#FFA500]" />
              <a href="tel:+442089796054">+44 20 8979 6054</a>
            </div>
          </div>

          {/* Burger (mobile only) */}
          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden text-white text-xl"
            aria-label="Open menu"
          >
            <FaBars />
          </button>
        </div>
      </div>

      {/* ===== Main nav (desktop) ===== */}
      <div className="w-full bg-[#FFA500] hidden md:block">
        <div className="container mx-auto flex items-center justify-between py-3 px-4 md:px-8 lg:px-16">
          <ul className="flex gap-7 text-xs md:text-sm font-medium text-[#1A2930] tracking-[0.12em] capitalize">
            <a href="#Header">Home</a>
            <a href="#services">Our Services</a>
            <a href="#whyus">Why Us</a>
            <a href="#repackaging">Repack &amp; Consolidation</a>
            <a href="#booking">Book a Shipment</a>
            <a href="#testimonials">Client Stories</a>
          </ul>

          <Link to="/login">
            <button className="bg-[#1A2930] text-white px-6 py-2 rounded-full text-xs font-semibold tracking-[0.14em] hover:bg-[#121c23] transition">
              Customer Login
            </button>
          </Link>
        </div>
      </div>

      {/* ===== Mobile menu overlay ===== */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 md:hidden">
          <div className="absolute top-0 right-0 h-full w-[85%] bg-[#1A2930] p-6 shadow-xl">
            <div className="flex justify-between items-center mb-8">
              <span className="text-white font-bold tracking-[0.18em]">
                MENU
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                className="text-white text-xl"
                aria-label="Close menu"
              >
                <FaTimes />
              </button>
            </div>

            <nav className="flex flex-col gap-6 text-white text-sm tracking-[0.14em] uppercase">
              <a onClick={() => setMenuOpen(false)} href="#Header">
                Home
              </a>
              <a onClick={() => setMenuOpen(false)} href="#services">
                Our Services
              </a>
              <a onClick={() => setMenuOpen(false)} href="#whyus">
                Why Us
              </a>
              <a onClick={() => setMenuOpen(false)} href="#repackaging">
                Repack &amp; Consolidation
              </a>
              <a onClick={() => setMenuOpen(false)} href="#booking">
                Book a Shipment
              </a>
              <a onClick={() => setMenuOpen(false)} href="#testimonials">
                Client Stories
              </a>

              <Link to="/login" onClick={() => setMenuOpen(false)}>
                <span className="inline-block mt-6 bg-[#FFA500] text-[#1A2930] px-6 py-3 rounded-full text-center font-semibold">
                  Customer Login
                </span>
              </Link>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavbarPublic;
