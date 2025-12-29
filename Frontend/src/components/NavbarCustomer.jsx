import { useEffect, useMemo, useState } from "react";
import { FaBars, FaTimes, FaUser, FaSignOutAlt } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";

// ✅ Customer-only keys (must match CustomerLogin.jsx)
const CUSTOMER_SESSION_KEY = "elx_customer_session_v1";
const CUSTOMER_TOKEN_KEY = "elx_customer_token";
const CUSTOMER_USER_KEY = "elx_customer_user";

// (Optional) If your CustomerLogin remembers the last email, add that key here.
// Keeping this list small + safe: we only remove if present.
const POSSIBLE_REMEMBER_KEYS = [
  "elx_customer_login_email",
  "elx_customer_remember_email",
  "elx_login_email",
  "elx_remember_email",
  "elx_customer_login_email_v1",
];

function safeJsonParse(raw) {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearCustomerAuth() {
  localStorage.removeItem(CUSTOMER_SESSION_KEY);
  localStorage.removeItem(CUSTOMER_TOKEN_KEY);
  localStorage.removeItem(CUSTOMER_USER_KEY);
  sessionStorage.removeItem(CUSTOMER_TOKEN_KEY);
  sessionStorage.removeItem(CUSTOMER_USER_KEY);
}

// ✅ Clears "remembered" device state (localStorage) but does NOT touch sessionStorage.
// Use-case: stop auto-filled/remembered credentials from sticking on this device.
function clearRememberedOnDevice() {
  localStorage.removeItem(CUSTOMER_SESSION_KEY);
  localStorage.removeItem(CUSTOMER_TOKEN_KEY);
  localStorage.removeItem(CUSTOMER_USER_KEY);
  POSSIBLE_REMEMBER_KEYS.forEach((k) => localStorage.removeItem(k));
}

function readCustomerUser() {
  const userRaw =
    localStorage.getItem(CUSTOMER_USER_KEY) ||
    sessionStorage.getItem(CUSTOMER_USER_KEY);

  const session = safeJsonParse(localStorage.getItem(CUSTOMER_SESSION_KEY));

  const user = safeJsonParse(userRaw) || session?.user || null;
  const token =
    localStorage.getItem(CUSTOMER_TOKEN_KEY) ||
    sessionStorage.getItem(CUSTOMER_TOKEN_KEY);

  // Fail closed: if no token, treat as logged out
  if (!token) return { token: null, user: null };

  // Extra safety: customer portal must never treat admin as authenticated
  const role = String(user?.role || "").toLowerCase();
  if (role === "admin") {
    clearCustomerAuth();
    return { token: null, user: null };
  }

  return { token, user };
}

export default function NavbarCustomer() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [auth, setAuth] = useState(() => readCustomerUser());

  const location = useLocation();
  const navigate = useNavigate();

  const closeDrawer = () => setDrawerOpen(false);

  const accountName = useMemo(() => {
    if (!auth?.user) return "Account";
    return (
      auth.user.accountHolderName ||
      auth.user.fullname ||
      auth.user.email ||
      "Account"
    );
  }, [auth]);

  // Keep auth in sync (refresh if login/logout happens in another tab)
  useEffect(() => {
    const onStorage = () => setAuth(readCustomerUser());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Lock body scroll when drawer open
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  // Close on ESC
  useEffect(() => {
    if (!drawerOpen && !accountOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setDrawerOpen(false);
        setAccountOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, accountOpen]);

  // Close menus on route change
  useEffect(() => {
    setAccountOpen(false);
    closeDrawer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleLogout = () => {
    clearCustomerAuth();
    setAuth({ token: null, user: null });
    setAccountOpen(false);
    closeDrawer();
    navigate("/login", { replace: true });
  };

  const handleClearRemembered = () => {
    // Clears "remember me" device state. We also log out for clarity.
    clearRememberedOnDevice();
    clearCustomerAuth();
    setAuth({ token: null, user: null });
    setAccountOpen(false);
    closeDrawer();
    navigate("/login", { replace: true });
  };

  // ✅ Customer portal nav must not expose internal routes
  const navLinks = [{ label: "My Shipments", to: "/myshipments" }];

  return (
    <header className="w-full z-20 fixed top-0 left-0">
      {/* Top band */}
      <div className="w-full bg-[#1A2930] text-white border-b border-white/10">
        <div className="container mx-auto flex justify-between items-center py-3 px-4 md:px-8 lg:px-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex flex-col leading-tight">
              <span className="font-brand text-sm sm:text-base md:text-xl font-bold tracking-[0.18em] text-white">
                ELLCWORTH <span className="text-[#FFA500]">EXPRESS</span>
              </span>
              <span className="font-brand text-[0.55rem] sm:text-[0.6rem] tracking-[0.25em] uppercase text-[#FFA500] mt-1">
                Customer Portal
              </span>
            </div>
          </Link>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-4">
            <nav className="flex items-center gap-3">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="text-xs md:text-sm font-semibold tracking-[0.12em] text-white/85 hover:text-white transition"
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Account dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen((p) => !p)}
                className="
                  inline-flex items-center gap-2
                  rounded-full bg-white/5 border border-white/10
                  px-3 py-2
                  text-xs md:text-sm
                  font-semibold tracking-[0.08em]
                  text-white/90
                  hover:bg-white/10 transition
                "
                aria-haspopup="menu"
                aria-expanded={accountOpen}
              >
                <span className="h-8 w-8 rounded-full bg-[#FFA500]/10 text-[#FFA500] flex items-center justify-center">
                  <FaUser />
                </span>
                <span className="max-w-[220px] truncate">{accountName}</span>
              </button>

              {accountOpen ? (
                <div
                  className="
                    absolute right-0 mt-2 w-72
                    rounded-2xl bg-[#0B1118]
                    border border-white/10
                    shadow-[0_24px_80px_rgba(0,0,0,0.55)]
                    overflow-hidden
                  "
                  role="menu"
                >
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-white/55">
                      Signed in
                    </p>
                    <p className="text-sm text-white/85 mt-1 truncate">
                      {auth?.user?.email || "Customer session"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleClearRemembered}
                    className="w-full text-left px-4 py-3 text-sm font-semibold text-white/85 hover:bg-white/5 transition flex items-center gap-2 border-b border-white/10"
                    role="menuitem"
                    title="Clears stored/remembered customer login on this device"
                  >
                    {/* reuse icon container style */}
                    <span className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/80">
                      <FaUser />
                    </span>
                    Clear remembered login on this device
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm font-semibold text-[#BF2918] hover:bg-white/5 transition flex items-center gap-2"
                    role="menuitem"
                  >
                    <FaSignOutAlt />
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition"
            aria-label="Open menu"
          >
            <FaBars />
          </button>
        </div>
      </div>

      {/* Secondary band (optional brand accent) */}
      <div className="w-full bg-[#FFA500] hidden md:block border-b border-black/10">
        <div className="container mx-auto py-2 px-4 md:px-8 lg:px-16">
          <p className="text-[11px] tracking-[0.22em] uppercase text-[#1A2930] font-semibold">
            Track milestones · Manage shipments · Corporate visibility
          </p>
        </div>
      </div>

      {/* Mobile drawer */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            aria-label="Close menu overlay"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-black/60"
          />

          <div
            className="
              absolute top-0 right-0 h-full w-[88%] max-w-[380px]
              bg-[#0B1118]
              border-l border-white/10
              shadow-[0_24px_80px_rgba(0,0,0,0.75)]
            "
          >
            <div className="px-5 py-5 border-b border-white/10 bg-gradient-to-b from-[#0E1B20] to-[#0B1118]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] tracking-[0.22em] uppercase text-white/60">
                    Customer Portal
                  </p>
                  <p className="text-white font-semibold tracking-[0.16em]">
                    ACCOUNT <span className="text-[#FFA500]">MENU</span>
                  </p>
                  <p className="mt-2 text-sm text-white/75 truncate">
                    {auth?.user?.email || "Customer session"}
                  </p>
                </div>

                <button
                  onClick={() => setDrawerOpen(false)}
                  className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition"
                  aria-label="Close menu"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            <nav className="px-5 py-6 space-y-3">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={closeDrawer}
                  className="
                    block
                    rounded-2xl border border-white/10
                    bg-white/5
                    px-4 py-3
                    text-sm font-semibold
                    tracking-[0.14em] uppercase
                    text-white/90
                    hover:bg-white/10 transition
                  "
                >
                  {l.label}
                </Link>
              ))}

              <button
                type="button"
                onClick={handleClearRemembered}
                className="
                  w-full text-left
                  rounded-2xl border border-white/10
                  bg-white/5
                  px-4 py-3
                  text-sm font-semibold
                  tracking-[0.12em]
                  text-white/85
                  hover:bg-white/10 transition
                  flex items-center gap-2
                "
                title="Clears stored/remembered customer login on this device"
              >
                <FaUser />
                Clear remembered login
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="
                  w-full text-left
                  rounded-2xl border border-[#BF2918]/30
                  bg-[#BF2918]/10
                  px-4 py-3
                  text-sm font-semibold
                  tracking-[0.14em] uppercase
                  text-[#BF2918]
                  hover:bg-[#BF2918]/15 transition
                  flex items-center gap-2
                "
              >
                <FaSignOutAlt />
                Logout
              </button>
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
