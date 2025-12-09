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

function Menu() {
  const navigate = useNavigate();

  const baseItem =
    "flex items-center text-[18px] cursor-pointer mt-[20px] transition-colors";
  const inactiveItem = "text-[#D7D7D7] hover:text-[#FFA500]";
  const activeItem = "text-[#FFA500]";

  const linkClass = ({ isActive }) =>
    `${baseItem} ${isActive ? activeItem : inactiveItem}`;

  const handleLogout = () => {
    // Make sure we clear the same key the rest of the app uses
    localStorage.removeItem("token");
    localStorage.removeItem("ellcworth_token"); // safety, in case some parts still use this
    navigate("/login");
  };

  return (
    <div className="h-[90vh] shadow-xl bg-[#1A2930]">
      <ul className="flex flex-col items-start justify-center ml-[20px]">
        {/* TOP: HOME + PROFILE */}
        <NavLink to="/" className={linkClass} end>
          <FaHome className="mr-[15px] text-[20px]" />
          Home
        </NavLink>

        <NavLink to="/profile" className={linkClass}>
          <FaUser className="mr-[15px] text-[20px]" />
          Profile
        </NavLink>

        <hr className="h-[20px]" />

        {/* SHIPMENTS / USERS / ORDERS */}
        <NavLink to="/shipments" className={linkClass}>
          <FaShippingFast className="mr-[15px] text-[20px]" />
          Shipments
        </NavLink>

        <NavLink to="/users" className={linkClass}>
          <FaUsers className="mr-[15px] text-[20px]" />
          Users
        </NavLink>

        <NavLink to="/orders" className={linkClass}>
          <FaFileInvoice className="mr-[15px] text-[20px]" />
          Orders
        </NavLink>

        <hr className="h-[20px]" />

        {/* SYSTEM / CONFIG */}
        <NavLink to="/elements" className={linkClass}>
          <FaElementor className="mr-[15px] text-[20px]" />
          Elements
        </NavLink>

        <NavLink to="/settings" className={linkClass}>
          <FaCog className="mr-[15px] text-[20px]" />
          Settings
        </NavLink>

        <NavLink to="/backups" className={linkClass}>
          <FaHdd className="mr-[15px] text-[20px]" />
          Backups
        </NavLink>

        <hr className="h-[20px]" />

        {/* ANALYTICS / LOGS / CALENDAR */}
        <NavLink to="/charts" className={linkClass}>
          <FaChartBar className="mr-[15px] text-[20px]" />
          Charts
        </NavLink>

        <NavLink to="/logs" className={linkClass}>
          <FaClipboard className="mr-[15px] text-[20px]" />
          All logs
        </NavLink>

        <NavLink to="/calendar" className={linkClass}>
          <FaCalendarAlt className="mr-[15px] text-[20px]" />
          Calendar
        </NavLink>

        <hr className="h-[20px]" />

        {/* LOGOUT */}
        <button
          type="button"
          onClick={handleLogout}
          className="mt-[20px] mb-[10px] text-[14px] text-red-300 hover:text-red-500"
        >
          Logout
        </button>
      </ul>
    </div>
  );
}

export default Menu;
