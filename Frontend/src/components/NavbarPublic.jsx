import { useEffect, useMemo, useState, useRef } from "react";
import { assets } from "@/assets/assets";
import {
  FaEnvelope,
  FaPhone,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaUserCircle,
  FaChevronDown,
  FaMapMarkedAlt,
} from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";

const CUSTOMER_SESSION_KEY = "elx_customer_session_v1";
const CUSTOMER_TOKEN_KEY   = "elx_customer_token";
const CUSTOMER_USER_KEY    = "elx_customer_user";

function safeJsonParse(raw) {
  try { return raw ? JSON.parse(raw) : null; }
  catch { return null; }
}

function clearCustomerAuth() {
  localStorage.removeItem(CUSTOMER_SESSION_KEY);
  localStorage.removeItem(CUSTOMER_TOKEN_KEY);
  localStorage.removeItem(CUSTOMER_USER_KEY);
  sessionStorage.removeItem(CUSTOMER_TOKEN_KEY);
  sessionStorage.removeItem(CUSTOMER_USER_KEY);
}

function readCustomerSession() {
  const token =
    localStorage.getItem(CUSTOMER_TOKEN_KEY) ||
    sessionStorage.getItem(CUSTOMER_TOKEN_KEY);
  const session = safeJsonParse(localStorage.getItem(CUSTOMER_SESSION_KEY));
  if (session?.expiresAt) {
    const exp = new Date(session.expiresAt).getTime();
    if (!Number.isNaN(exp) && Date.now() > exp) {
      clearCustomerAuth();
      return { token: null, user: null };
    }
  }
  const userRaw =
    localStorage.getItem(CUSTOMER_USER_KEY) ||
    sessionStorage.getItem(CUSTOMER_USER_KEY);
  const user = safeJsonParse(userRaw) || session?.user || null;
  return { token: token || null, user };
}

const SERVICES_LINKS = [
  {
    group: "Sea Freight",
    items: [
      { label: "FCL Container (20ft / 40ft)", to: "/services/fcl" },
      { label: "LCL Consolidation",           to: "/services/lcl" },
    ],
  },
  {
    group: "Air Freight",
    items: [
      { label: "Air Freight",      to: "/services/air" },
      { label: "JIT Service",      to: "/services/jit" },
      { label: "For Institutions", to: "/institutional" },
    ],
  },
  {
    group: "Vehicle Shipping",
    items: [
      { label: "RoRo Vehicle Shipping", to: "/services/roro" },
    ],
  },
  {
    group: "Repack & Consolidation",
    items: [
      { label: "Repack & Consolidation", to: "/services/repacking" },
    ],
  },
];

const DESTINATION_LINKS = [
  { label: "Ghana (Tema & Accra)",     to: "/destinations/ghana" },
  { label: "Nigeria (Apapa)",          to: "/destinations/nigeria" },
  { label: "Kenya (Mombasa)",          to: "/destinations/kenya" },
  { label: "Sierra Leone (Freetown)",  to: "/destinations/sierra-leone" },
  { label: "Cote d'Ivoire (Abidjan)", to: "/destinations/cote-divoire" },
];

function Dropdown({ label, items, mapLink }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <li className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 hover:text-black/70 transition"
        aria-expanded={open}
      >
        {label}
        <FaChevronDown
          className={"text-[10px] transition-transform duration-200 " + (open ? "rotate-180" : "")}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 z-50 min-w-[230px] rounded-2xl bg-[#0B141A] border border-white/10 shadow-[0_16px_48px_rgba(0,0,0,0.5)] overflow-hidden">
          <ul className="py-2">
            {items[0]?.group ? (
              items.map((group) => (
                <li key={group.group}>
                  <p className="px-4 pt-3 pb-1 text-[10px] font-bold tracking-[0.2em] uppercase text-[#FFA500]/80">
                    {group.group}
                  </p>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item.label}>
                        <Link
                          to={item.to}
                          onClick={() => setOpen(false)}
                          className="block px-4 py-2 text-xs font-semibold tracking-[0.12em] text-white/85 hover:text-white hover:bg-white/8 transition"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))
            ) : (
              items.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-2.5 text-xs font-semibold tracking-[0.12em] text-white/85 hover:text-white hover:bg-white/8 transition"
                  >
                    {item.label}
                  </Link>
                </li>
              ))
            )}
            {mapLink && (
              <>
                <li><div className="mx-4 my-1.5 border-t border-white/10" /></li>
                <li>
                  <Link
                    to="/map"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold tracking-[0.12em] text-[#FFA500] hover:bg-[#FFA500]/10 transition"
                  >
                    <FaMapMarkedAlt className="shrink-0" />
                    View Shipment Network Map
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </li>
  );
}

const NavbarPublic = () => {
  const [menuOpen, setMenuOpen]             = useState(false);
  const [servicesOpen, setServicesOpen]     = useState(false);
  const [destOpen, setDestOpen]             = useState(false);
  const [customerAuth, setCustomerAuth]     = useState(() => readCustomerSession());

  const location = useLocation();
  const navigate  = useNavigate();
  const isHome    = location.pathname === "/";

  const isCustomerSignedIn = useMemo(() => {
    if (!customerAuth?.token) return false;
    return String(customerAuth?.user?.role || "").toLowerCase().trim() !== "admin";
  }, [customerAuth]);

  const customerName =
    customerAuth?.user?.fullname ||
    customerAuth?.user?.accountHolderName ||
    customerAuth?.user?.email ||
    "My Account";

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const onStorage = () => setCustomerAuth(readCustomerSession());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => { if (e.key === "Escape") closeMenu(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const goToSection = (hash) => {
    closeMenu();
    if (isHome) {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    navigate("/#" + hash);
  };

  useEffect(() => {
    if (!isHome) return;
    const hash = location.hash?.replace("#", "");
    if (!hash) return;
    const raf = requestAnimationFrame(() => {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(raf);
  }, [isHome, location.hash]);

  const handleCustomerLogout = () => {
    clearCustomerAuth();
    setCustomerAuth(readCustomerSession());
    closeMenu();
    navigate("/login", { replace: true });
  };

  return (
    <header className="w-full z-20 fixed top-0 left-0">

      {/* Top bar */}
      <div className="w-full bg-[#1A2930] text-white border-b border-white/10">
        <div className="container mx-auto flex justify-between items-center py-2.5 px-4 md:px-8 lg:px-16">
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

          <div className="hidden md:flex items-center gap-7 text-xs md:text-sm font-medium tracking-[0.12em] text-white/90">
            <div className="flex items-center gap-2">
              <FaEnvelope className="text-[#FFA500]" />
              <a href="mailto:cs@ellcworth.com" className="hover:text-white">cs@ellcworth.com</a>
            </div>
            <div className="flex items-center gap-2">
              <FaPhone className="text-[#FFA500]" />
              <a href="tel:+442089796054" className="hover:text-white">+44 20 8979 6054</a>
            </div>
            {isCustomerSignedIn && (
              <div className="hidden lg:flex items-center gap-2 text-white/85">
                <FaUserCircle className="text-[#FFA500]" />
                <span className="text-[12px] tracking-[0.12em] uppercase">{customerName}</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition"
            aria-label="Open menu"
          >
            <FaBars />
          </button>
        </div>
      </div>

      {/* Main nav bar — desktop */}
      <div className="w-full bg-[#FFA500] hidden md:block border-b border-black/10">
        <div className="container mx-auto flex items-center justify-between py-3 px-4 md:px-8 lg:px-16">
          <ul className="flex gap-6 text-xs md:text-sm font-semibold text-[#1A2930] tracking-[0.12em] capitalize items-center">
            <li>
              <button type="button" onClick={() => goToSection("Header")} className="hover:text-black/70 transition">
                Home
              </button>
            </li>
            <Dropdown label="Services" items={SERVICES_LINKS} />
            <Dropdown label="Key Destinations" items={DESTINATION_LINKS} mapLink />
            <li>
              <Link to="/about" className="hover:text-black/70 transition">About</Link>
            </li>
            <li>
              <Link to="/insights" className="hover:text-black/70 transition">Insights</Link>
            </li>
          </ul>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => goToSection("quote")}
              className="bg-[#1A2930] text-[#FFA500] px-5 py-2 rounded-full text-xs font-bold tracking-[0.14em] uppercase hover:bg-[#121c23] transition shadow-[0_8px_18px_rgba(0,0,0,0.18)]"
            >
              Get a Quote →
            </button>

            {isCustomerSignedIn ? (
              <>
                <Link to="/myshipments">
                  <button className="bg-white/20 text-[#1A2930] px-5 py-2 rounded-full text-xs font-semibold tracking-[0.14em] hover:bg-white/30 transition">
                    My Shipments
                  </button>
                </Link>
                <button
                  type="button"
                  onClick={handleCustomerLogout}
                  className="inline-flex items-center gap-2 rounded-full border border-[#1A2930]/40 bg-black/10 px-4 py-2 text-xs font-semibold tracking-[0.14em] text-[#1A2930] hover:bg-black/15 transition"
                  aria-label="Logout"
                >
                  <FaSignOutAlt />
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login">
                <button className="bg-white/20 text-[#1A2930] border border-[#1A2930]/20 px-5 py-2 rounded-full text-xs font-semibold tracking-[0.14em] hover:bg-white/30 transition">
                  Customer Login
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button aria-label="Close menu overlay" onClick={closeMenu} className="absolute inset-0 bg-black/60" />
          <div className="absolute top-0 right-0 h-full w-[88%] max-w-[380px] bg-[#0B1118] border-l border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.75)] flex flex-col">

            <div className="px-5 py-5 border-b border-white/10 bg-gradient-to-b from-[#0E1B20] to-[#0B1118]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] tracking-[0.22em] uppercase text-white/60">Ellcworth Express</p>
                  <p className="text-white font-semibold tracking-[0.16em]">
                    MENU <span className="text-[#FFA500]">→</span>
                  </p>
                  {isCustomerSignedIn && (
                    <p className="mt-2 text-[11px] text-white/70 tracking-[0.16em] uppercase">
                      Signed in: <span className="text-[#FFA500] font-semibold">{customerName}</span>
                    </p>
                  )}
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
                <a href="mailto:cs@ellcworth.com" className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/90 hover:bg-white/10 transition">
                  <span className="text-[#FFA500] font-semibold">Email</span>
                  <div className="mt-1 text-[11px] text-white/70">cs@ellcworth.com</div>
                </a>
                <a href="tel:+442089796054" className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/90 hover:bg-white/10 transition">
                  <span className="text-[#FFA500] font-semibold">Call</span>
                  <div className="mt-1 text-[11px] text-white/70">+44 20 8979 6054</div>
                </a>
              </div>
            </div>

            <nav className="px-5 py-6 overflow-y-auto flex-1">
              <button
                type="button"
                onClick={() => goToSection("quote")}
                className="w-full mb-4 rounded-2xl bg-[#FFA500] text-[#1A2930] px-4 py-3 text-sm font-bold tracking-[0.14em] uppercase hover:opacity-90 transition"
              >
                Get a Quote →
              </button>

              <button
                type="button"
                onClick={() => goToSection("Header")}
                className="w-full text-left rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold tracking-[0.14em] uppercase text-white/90 hover:bg-white/10 transition mb-2"
              >
                Home
              </button>

              {/* Services accordion */}
              <div className="mb-2">
                <button
                  type="button"
                  onClick={() => setServicesOpen((o) => !o)}
                  className="w-full flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold tracking-[0.14em] uppercase text-white/90 hover:bg-white/10 transition"
                >
                  Services
                  <FaChevronDown className={"text-[10px] text-[#FFA500] transition-transform duration-200 " + (servicesOpen ? "rotate-180" : "")} />
                </button>
                {servicesOpen && (
                  <div className="mt-1 ml-3 space-y-1">
                    {SERVICES_LINKS.map((group) => (
                      <div key={group.group}>
                        <p className="px-2 pt-2 pb-1 text-[10px] font-bold tracking-[0.2em] uppercase text-[#FFA500]/80">
                          {group.group}
                        </p>
                        {group.items.map((item) => (
                          <Link key={item.label} to={item.to} onClick={closeMenu}
                            className="block rounded-xl border border-white/8 bg-white/3 px-4 py-2.5 text-xs font-semibold tracking-[0.12em] uppercase text-white/80 hover:bg-white/10 transition mb-1">
                            {item.label} →
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Key Destinations accordion */}
              <div className="mb-2">
                <button
                  type="button"
                  onClick={() => setDestOpen((o) => !o)}
                  className="w-full flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold tracking-[0.14em] uppercase text-white/90 hover:bg-white/10 transition"
                >
                  Key Destinations
                  <FaChevronDown className={"text-[10px] text-[#FFA500] transition-transform duration-200 " + (destOpen ? "rotate-180" : "")} />
                </button>
                {destOpen && (
                  <div className="mt-1 ml-3 space-y-1">
                    {DESTINATION_LINKS.map((item) => (
                      <Link key={item.label} to={item.to} onClick={closeMenu}
                        className="block rounded-xl border border-white/8 bg-white/3 px-4 py-2.5 text-xs font-semibold tracking-[0.12em] uppercase text-white/80 hover:bg-white/10 transition">
                        {item.label} →
                      </Link>
                    ))}
                    <Link to="/map" onClick={closeMenu}
                      className="flex items-center gap-2 rounded-xl border border-[#FFA500]/30 bg-[#FFA500]/10 px-4 py-2.5 text-xs font-bold tracking-[0.12em] uppercase text-[#FFA500] hover:bg-[#FFA500]/15 transition">
                      <FaMapMarkedAlt className="shrink-0" />
                      View Shipment Network Map →
                    </Link>
                  </div>
                )}
              </div>

              <Link to="/about" onClick={closeMenu}
                className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold tracking-[0.14em] uppercase text-white/90 hover:bg-white/10 transition mb-2">
                About →
              </Link>

              <Link to="/insights" onClick={closeMenu}
                className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold tracking-[0.14em] uppercase text-white/90 hover:bg-white/10 transition mb-2">
                Insights →
              </Link>

              <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                {isCustomerSignedIn ? (
                  <>
                    <Link to="/myshipments" onClick={closeMenu}>
                      <div className="rounded-2xl bg-white/10 text-white px-4 py-3 text-sm font-semibold text-center tracking-[0.14em] uppercase hover:bg-white/15 transition">
                        My Shipments
                      </div>
                    </Link>
                    <button type="button" onClick={handleCustomerLogout}
                      className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-center tracking-[0.14em] uppercase text-white/90 hover:bg-white/10 transition inline-flex items-center justify-center gap-2">
                      <FaSignOutAlt /> Logout
                    </button>
                  </>
                ) : (
                  <Link to="/login" onClick={closeMenu}>
                    <div className="rounded-2xl bg-white/10 text-white px-4 py-3 text-sm font-semibold text-center tracking-[0.14em] uppercase hover:bg-white/15 transition">
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
