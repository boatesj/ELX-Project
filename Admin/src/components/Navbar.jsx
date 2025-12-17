import { Link, NavLink, useNavigate } from "react-router-dom";

function Navbar({ onMenuClick }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // ✅ Standardised auth key is "token"
    localStorage.removeItem("token");

    // ✅ Optional cleanup for any legacy key you used before
    localStorage.removeItem("ellcworth_token");

    navigate("/login");
  };

  const baseLink =
    "text-gray-200 hover:text-white transition-colors px-2 py-1 rounded-full text-xs font-medium";
  const activeLink = "bg-white/10 text-white";

  return (
    <header className="bg-[#1A2930] border-b border-[#FFA500]/40 shadow-sm">
      <nav className="mx-auto flex h-[80px] max-w-7xl items-center justify-between px-4 sm:px-8 font-montserrat">
        {/* Left: Burger + Logo + Brand */}
        <div className="flex items-center gap-3">
          {/* Mobile burger */}
          <button
            type="button"
            onClick={onMenuClick}
            className="
              inline-flex md:hidden
              h-10 w-10 items-center justify-center
              rounded-xl border border-white/10
              bg-white/5 hover:bg-white/10
              transition
              focus:outline-none focus:ring-2 focus:ring-[#FFA500]/60
            "
            aria-label="Open menu"
            aria-controls="mobile-drawer"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="text-white"
              aria-hidden="true"
            >
              <path
                d="M4 6h16M4 12h16M4 18h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/Logo_elx.png"
              alt="Ellcworth Express"
              className="h-10 w-auto sm:h-11 transition-transform duration-150 group-hover:scale-[1.03]"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-[11px] tracking-[0.28em] uppercase text-gray-300">
                Ellcworth
              </span>
              <span className="text-sm sm:text-base font-semibold tracking-[0.16em] text-white">
                EXPRESS <span className="text-[#FFA500]">ADMIN</span>
              </span>
              <span className="hidden text-[10px] text-gray-400 sm:block">
                UK–Africa shipping portal
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Nav links + Logout */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Primary nav (desktop only) */}
          <div className="hidden md:flex items-center gap-2 text-xs font-medium">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `${baseLink} ${isActive ? activeLink : ""}`
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/shipments"
              className={({ isActive }) =>
                `${baseLink} ${isActive ? activeLink : ""}`
              }
            >
              Shipments
            </NavLink>

            <NavLink
              to="/newshipment"
              className={({ isActive }) =>
                `${baseLink} ${isActive ? activeLink : ""}`
              }
            >
              New shipment
            </NavLink>

            <NavLink
              to="/users"
              className={({ isActive }) =>
                `${baseLink} ${isActive ? activeLink : ""}`
              }
            >
              Customers
            </NavLink>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="
              inline-flex items-center
              rounded-full border border-[#FFA500]/70
              px-3 sm:px-4 py-1.5
              text-[11px] sm:text-xs
              font-semibold uppercase tracking-[0.16em]
              text-[#FFA500]
              hover:bg-[#FFA500] hover:text-[#1A2930]
              transition-colors
            "
          >
            Logout
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
