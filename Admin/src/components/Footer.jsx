import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-[#050A11] text-[#d9d9d9] font-montserrat border-t border-white/5">
      {/* Orange Accent Strip */}
      <div className="h-[3px] w-full bg-gradient-to-r from-[#FFA500] via-[#ffb84d] to-[#FFA500]" />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-10">
          {/* BRAND SECTION */}
          <div className="flex items-center gap-4">
            <Link to="/">
              <img
                src="/Logo_elx.png"
                alt="Ellcworth Logo"
                className="w-14 h-auto opacity-90 hover:opacity-100 transition"
              />
            </Link>

            <div>
              <span className="text-white text-xl font-semibold tracking-wide">
                ELLCWORTH <span className="text-[#FFA500]">EXPRESS</span>
              </span>
              <p className="text-xs text-gray-400 tracking-widest uppercase mt-1">
                UK → Africa Logistics
              </p>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div className="flex flex-col text-center md:text-left space-y-1">
            <h4 className="text-xs tracking-widest text-gray-400 uppercase mb-1">
              Quick Links
            </h4>
            <Link
              to="/shipments"
              className="text-sm hover:text-[#FFA500] transition"
            >
              Admin Dashboard
            </Link>
            <Link to="/" className="text-sm hover:text-[#FFA500] transition">
              Main Website
            </Link>
            <Link
              to="/contact"
              className="text-sm hover:text-[#FFA500] transition"
            >
              Contact Support
            </Link>
          </div>

          {/* LEGAL / COPYRIGHT */}
          <div className="text-center md:text-right">
            <p className="text-sm">
              © {new Date().getFullYear()} Ellcworth Express Ltd.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              All rights reserved · Secure Admin Portal
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
