import { Link } from "react-router-dom";
import { FaEnvelope, FaPhoneAlt, FaWhatsapp } from "react-icons/fa";
import { assets } from "../assets/assets";

const Footer = () => {
  return (
    <footer className="w-full bg-[#0B141A] text-slate-200 border-t border-slate-800">
      <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8 py-10 md:py-12">
        {/* Top row */}
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img
                src={assets.logo_w}
                alt="Ellcworth Express Logo"
                className="w-12 h-auto"
              />
              <span className="text-lg md:text-xl font-semibold tracking-tight">
                ELLCWORTH <span className="text-[#FFA500]">EXPRESS</span>
              </span>
            </Link>
            <p className="text-sm md:text-[15px] text-slate-300 max-w-md leading-relaxed">
              UK–Africa shipping support for containers, vehicles, air freight
              and secure documentation – with clear communication from booking
              to delivery.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400 mb-3">
              Services
            </h3>
            <ul className="space-y-2 text-sm md:text-[15px]">
              <li>
                <a href="#quote" className="hover:text-[#FFA500] transition">
                  Get a shipping quote
                </a>
              </li>
              <li>
                <a
                  href="#destinations"
                  className="hover:text-[#FFA500] transition"
                >
                  Destinations & services
                </a>
              </li>
              <li>
                <a href="#stories" className="hover:text-[#FFA500] transition">
                  Customer stories
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400 mb-3">
              Contact
            </h3>
            <ul className="space-y-2 text-sm md:text-[15px]">
              <li className="flex items-center gap-2">
                <FaEnvelope className="text-[#FFA500]" />
                <a
                  href="mailto:info@ellcworth.com"
                  className="hover:text-[#FFA500] transition"
                >
                  info@ellcworth.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <FaPhoneAlt className="text-[#FFA500]" />
                <a
                  href="tel:+44XXXXXXXXXX"
                  className="hover:text-[#FFA500] transition"
                >
                  +44 (0) __ __ __ __ __
                </a>
              </li>
              <li className="flex items-center gap-2">
                <FaWhatsapp className="text-[#FFA500]" />
                <span>WhatsApp support coming soon</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-8 border-t border-slate-800 pt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <p className="text-xs md:text-sm text-slate-500">
            © {new Date().getFullYear()} Ellcworth Express Ltd. All rights
            reserved.
          </p>
          <div className="flex flex-wrap gap-4 text-xs md:text-sm text-slate-500">
            <button className="hover:text-[#FFA500] transition" type="button">
              Terms &amp; conditions
            </button>
            <button className="hover:text-[#FFA500] transition" type="button">
              Privacy policy
            </button>
            <button className="hover:text-[#FFA500] transition" type="button">
              Cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
