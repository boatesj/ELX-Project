import { useEffect, useMemo, useState } from "react";
import { assets } from "@/assets/assets";
import { FaEnvelope, FaPhone, FaBars, FaTimes } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";

// ✅ Customer-only keys (same as CustomerLogin.jsx)
const CUSTOMER_TOKEN_KEY = "elx_customer_token";
const CUSTOMER_USER_KEY = "elx_customer_user";

function safeJsonParse(raw) {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function isCustomerSignedIn() {
  const token =
    localStorage.getItem(CUSTOMER_TOKEN_KEY) ||
    sessionStorage.getItem(CUSTOMER_TOKEN_KEY);

  const userRaw =
    localStorage.getItem(CUSTOMER_USER_KEY) ||
    sessionStorage.getItem(CUSTOMER_USER_KEY);

  const user = safeJsonParse(userRaw);

  if (!token || !user) return false;

  const role = String(user.role || "").toLowerCase();
  if (role === "admin") return false;

  // Accept "user" or "customer"
  return role === "user" || role === "customer";
}

const NavbarPublic = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [customerAuthed, setCustomerAuthed] = useState(() =>
    isCustomerSignedIn()
  );

  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === "/";

  const links = useMemo(
    () => [
      { label: "Home", hash: "Header" },
      { label: "Our Services", hash: "services" },
      { label: "Why Us", hash: "whyus" },
      { label: "Repack & Consolidation", hash: "repackaging" },
      { label: "Book a Shipment", hash: "booking" },
      { label: "Client Stories", hash: "testimonials" },
    ],
    []
  );

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const onStorage = () => setCustomerAuthed(isCustomerSignedIn());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Corporate UX: lock body scroll when drawer is open
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  // Close on ESC
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // Hybrid navigation:
  const goToSection = (hash) => {
    closeMenu();

    if (isHome) {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    navigate(`/#${hash}`);
  };

  // When landing on "/#something", perform the scroll after route loads.
  useEffect(() => {
    if (!isHome) return;
    const hash = location.hash?.replace("#", "");
    if (!hash) return;

    const t = setTimeout(() => {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);

    return () => clearTimeout(t);
  }, [isHome, location.hash]);

  const loginCta = customerAuthed ? (
    <Link to="/myshipments">
      <button className="bg-[#1A2930] text-white px-6 py-2 rounded-full text-xs font-semibold tracking-[0.14em] hover:bg-[#121c23] transition shadow-[0_8px_18px_rgba(0,0,0,0.18)]">
        My Shipments
      </button>
    </Link>
  ) : (
    <Link to="/login">
      <button className="bg-[#1A2930] text-white px-6 py-2 rounded-full text-xs font-semibold tracking-[0.14em] hover:bg-[#121c23] transition shadow-[0_8px_18px_rgba(0,0,0,0.18)]">
        Customer Login
      </button>
    </Link>
  );

  return (
    <header className="w-full z-20 fixed top-0 left-0">
      {/* ===== Top bar ===== */}
      <div className="w-full bg-[#1A2930] text-white border-b border-white/10">
        <div className="container mx-auto flex justify-between items-center py-2.5 px-4 md:px-8 lg:px-16">
          {/* Logo + brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={assets.logo_w}
              alt="Ellcworth Express logo"
              className="w-11 h-auto md:w-14 transition-transform duration-150 group-hover:scale-[1.02]"
            />

            <div className="flex flex-col leading-tight">
              <span className="font-brand text-sm sm:text-base md:text-xl font-bold tracking-[0.18em] text-white">
                ELLCWORTH <span className="text-[#FFA500]">EXPRESS</span>
              </span>
              <span className="font-brand text-[0.55rem] sm:text-[0.6rem] tracking-[0.25em] uppercase text-[#FFA500] mt-1">
                Smart logistics. Seamless freight
              </span>
            </div>
          </Link>

          {/* Contact info (desktop only) */}
          <div className="hidden md:flex items-center gap-7 text-xs md:text-sm font-medium tracking-[0.12em] text-white/90">
            <div className="flex items-center gap-2">
              <FaEnvelope className="text-[#FFA500]" />
              <a href="mailto:cs@ellcworth.com" className="hover:text-white">
                cs@ellcworth.com
              </a>
            </div>
            <div className="flex items-center gap-2">
              <FaPhone className="text-[#FFA500]" />
              <a href="tel:+442089796054" className="hover:text-white">
                +44 20 8979 6054
              </a>
            </div>
          </div>

          {/* Burger (mobile only) */}
          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition"
            aria-label="Open menu"
          >
            <FaBars />
          </button>
        </div>
      </div>

      {/* ===== Main nav (desktop) ===== */}
      <div className="w-full bg-[#FFA500] hidden md:block border-b border-black/10">
        <div className="container mx-auto flex items-center justify-between py-3 px-4 md:px-8 lg:px-16">
          <ul className="flex gap-7 text-xs md:text-sm font-semibold text-[#1A2930] tracking-[0.12em] capitalize">
            {links.map((l) => (
              <button
                key={l.hash}
                type="button"
                onClick={() => goToSection(l.hash)}
                className="hover:text-black/70 transition"
              >
                {l.label}
              </button>
            ))}
          </ul>

          {loginCta}
        </div>
      </div>

      {/* ===== Mobile menu overlay ===== */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* overlay */}
          <button
            aria-label="Close menu overlay"
            onClick={closeMenu}
            className="absolute inset-0 bg-black/60"
          />

          {/* drawer */}
          <div
            className="
              absolute top-0 right-0 h-full w-[88%] max-w-[380px]
              bg-[#0B1118]
              border-l border-white/10
              shadow-[0_24px_80px_rgba(0,0,0,0.75)]
            "
          >
            {/* drawer header */}
            <div className="px-5 py-5 border-b border-white/10 bg-gradient-to-b from-[#0E1B20] to-[#0B1118]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] tracking-[0.22em] uppercase text-white/60">
                    Ellcworth Express
                  </p>
                  <p className="text-white font-semibold tracking-[0.16em]">
                    PUBLIC SITE <span className="text-[#FFA500]">MENU</span>
                  </p>
                </div>

                <button
                  onClick={closeMenu}
                  className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition"
                  aria-label="Close menu"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <a
                  href="mailto:cs@ellcworth.com"
                  className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/90 hover:bg-white/10 transition"
                >
                  <span className="text-[#FFA500] font-semibold">Email</span>
                  <div className="mt-1 text-[11px] text-white/70">
                    cs@ellcworth.com
                  </div>
                </a>
                <a
                  href="tel:+442089796054"
                  className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/90 hover:bg-white/10 transition"
                >
                  <span className="text-[#FFA500] font-semibold">Call</span>
                  <div className="mt-1 text-[11px] text-white/70">
                    +44 20 8979 6054
                  </div>
                </a>
              </div>
            </div>

            {/* drawer body */}
            <nav className="px-5 py-6">
              <div className="space-y-2">
                {links.map((l) => (
                  <button
                    key={l.hash}
                    type="button"
                    onClick={() => goToSection(l.hash)}
                    className="
                      w-full text-left
                      rounded-2xl
                      border border-white/10
                      bg-white/5
                      px-4 py-3
                      text-sm font-semibold
                      tracking-[0.14em] uppercase
                      text-white/90
                      hover:bg-white/10 transition
                    "
                  >
                    {l.label}
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <Link to="/services" onClick={closeMenu}>
                  <div className="rounded-2xl border border-[#FFA500]/30 bg-[#FFA500]/10 px-4 py-3 text-sm font-semibold text-[#FFA500] tracking-[0.14em] uppercase hover:bg-[#FFA500]/15 transition">
                    View Services Directory →
                  </div>
                </Link>

                {customerAuthed ? (
                  <Link to="/myshipments" onClick={closeMenu}>
                    <div className="mt-3 rounded-2xl bg-[#FFA500] text-[#1A2930] px-4 py-3 text-sm font-semibold text-center tracking-[0.14em] uppercase hover:opacity-90 transition">
                      My Shipments
                    </div>
                  </Link>
                ) : (
                  <Link to="/login" onClick={closeMenu}>
                    <div className="mt-3 rounded-2xl bg-[#FFA500] text-[#1A2930] px-4 py-3 text-sm font-semibold text-center tracking-[0.14em] uppercase hover:opacity-90 transition">
                      Customer Login
                    </div>
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default NavbarPublic;
