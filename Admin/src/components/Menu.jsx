import {
  FaShippingFast,
  FaHome,
  FaUser,
  FaUsers,
  FaFileInvoice,
  FaElementor,
  FaCog,
  FaHdd,
  FaChartBar,
  FaClipboard,
  FaCalendarAlt,
} from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";

function Menu({ onNavigate }) {
  const navigate = useNavigate();

  const baseItem =
    "flex items-center gap-3 px-4 py-2.5 rounded-r-full text-[14px] font-medium cursor-pointer transition-colors duration-150";
  const inactiveItem = "text-[#D7D7D7] hover:text-[#FFA500] hover:bg-white/5";
  const activeItem =
    "text-[#FFA500] bg-[#0F1720] border-l-4 border-[#FFA500] pl-3";

  const linkClass = ({ isActive }) =>
    `${baseItem} ${isActive ? activeItem : inactiveItem}`;

  const handleLogout = () => {
    // Clear any auth tokens we might have used
    localStorage.removeItem("token");
    localStorage.removeItem("ellcworth_token");
    onNavigate?.(); // close drawer if we're on mobile
    navigate("/login");
  };

  // Close drawer after clicking a nav link (safe no-op on desktop)
  const handleNavClick = () => onNavigate?.();

  return (
    <aside className="h-full min-h-[100dvh] lg:min-h-0 bg-[#1A2930] shadow-xl flex flex-col">
      {/* Brand / Top padding */}
      <div className="px-4 pt-6 pb-2">
        <p className="text-[11px] tracking-[0.22em] uppercase text-gray-400">
          Ellcworth
        </p>
        <p className="text-sm font-semibold text-white tracking-[0.16em]">
          EXPRESS <span className="text-[#FFA500]">ADMIN</span>
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto">
        <ul className="flex flex-col gap-1 mt-4 pb-6">
          {/* SECTION: MAIN */}
          <li className="px-4 mt-2 mb-1 text-[11px] uppercase tracking-[0.18em] text-gray-400">
            Main
          </li>

          <li>
            <NavLink to="/" className={linkClass} end onClick={handleNavClick}>
              <FaHome className="text-[18px]" />
              <span>Home</span>
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/profile"
              className={linkClass}
              onClick={handleNavClick}
            >
              <FaUser className="text-[18px]" />
              <span>Profile</span>
            </NavLink>
          </li>

          {/* SECTION: OPERATIONS */}
          <li className="px-4 mt-4 mb-1 text-[11px] uppercase tracking-[0.18em] text-gray-400">
            Operations
          </li>

          <li>
            <NavLink
              to="/shipments"
              className={linkClass}
              onClick={handleNavClick}
            >
              <FaShippingFast className="text-[18px]" />
              <span>Shipments</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/users" className={linkClass} onClick={handleNavClick}>
              <FaUsers className="text-[18px]" />
              <span>Users</span>
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/orders"
              className={linkClass}
              onClick={handleNavClick}
            >
              <FaFileInvoice className="text-[18px]" />
              <span>Orders</span>
            </NavLink>
          </li>

          {/* SECTION: SYSTEM */}
          <li className="px-4 mt-4 mb-1 text-[11px] uppercase tracking-[0.18em] text-gray-400">
            System
          </li>

          <li>
            <NavLink
              to="/elements"
              className={linkClass}
              onClick={handleNavClick}
            >
              <FaElementor className="text-[18px]" />
              <span>Elements</span>
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/settings"
              className={linkClass}
              onClick={handleNavClick}
            >
              <FaCog className="text-[18px]" />
              <span>Settings</span>
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/backups"
              className={linkClass}
              onClick={handleNavClick}
            >
              <FaHdd className="text-[18px]" />
              <span>Backups</span>
            </NavLink>
          </li>

          {/* SECTION: INSIGHTS */}
          <li className="px-4 mt-4 mb-1 text-[11px] uppercase tracking-[0.18em] text-gray-400">
            Insights
          </li>

          <li>
            <NavLink
              to="/charts"
              className={linkClass}
              onClick={handleNavClick}
            >
              <FaChartBar className="text-[18px]" />
              <span>Charts</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/logs" className={linkClass} onClick={handleNavClick}>
              <FaClipboard className="text-[18px]" />
              <span>All logs</span>
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/calendar"
              className={linkClass}
              onClick={handleNavClick}
            >
              <FaCalendarAlt className="text-[18px]" />
              <span>Calendar</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* LOGOUT pinned at bottom */}
      <div className="px-4 pb-5 pt-3 border-t border-white/5">
        <button
          type="button"
          onClick={handleLogout}
          className="text-[13px] text-red-300 hover:text-red-500 transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Menu;
