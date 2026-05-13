import Link from "next/link";
import { FaEnvelope, FaPhoneAlt, FaWhatsapp } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="w-full bg-[#0B141A] text-slate-200 border-t border-slate-800">
      <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8 py-10 md:py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <img
                src="/Logo_w.svg"
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

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="text-[11px] px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                RoRo &amp; Containers
              </span>
              <span className="text-[11px] px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                Air Freight
              </span>
              <span className="text-[11px] px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                Secure Documents
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400 mb-3">
              Services
            </h3>
            <ul className="space-y-2 text-sm md:text-[15px]">
              <li>
                <Link href="/about" className="hover:text-[#FFA500] transition">
                  About Ellcworth
                </Link>
              </li>
              <li>
                <Link
                  href="/#quote"
                  className="hover:text-[#FFA500] transition"
                >
                  Get a shipping quote
                </Link>
              </li>
              <li>
                <Link
                  href="/#destinations"
                  className="hover:text-[#FFA500] transition"
                >
                  Destinations &amp; services
                </Link>
              </li>
              <li>
                <Link
                  href="/#stories"
                  className="hover:text-[#FFA500] transition"
                >
                  Customer stories
                </Link>
              </li>
            </ul>
          </div>

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
                  href="tel:+442089796054"
                  className="hover:text-[#FFA500] transition"
                >
                  +44 (0) 20 8979 6054
                </a>
              </li>

              <li className="flex items-center gap-2">
                <FaWhatsapp className="text-[#FFA500]" />
                <a
                  href="https://wa.me/447776234234?text=Hello%20Ellcworth%2C%20I%20have%20a%20shipping%20enquiry."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Chat with us on WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <p className="text-xs md:text-sm text-slate-500">
            © {new Date().getFullYear()} Ellcworth Express Ltd. All rights
            reserved.
          </p>

          <div className="flex flex-wrap gap-4 text-xs md:text-sm text-slate-500">
            <Link href="/terms" className="hover:text-[#FFA500] transition">
              Terms &amp; conditions
            </Link>
            <Link href="/privacy" className="hover:text-[#FFA500] transition">
              Privacy policy
            </Link>
            <Link href="/cookies" className="hover:text-[#FFA500] transition">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
