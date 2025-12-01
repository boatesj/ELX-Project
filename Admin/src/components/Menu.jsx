import {FaShippingFast, FaHome, FaUser, FaUsers, FaFileInvoice, FaElementor, FaCog, FaHdd, FaChartBar, FaClipboard, FaCalendarAlt } from "react-icons/fa"
import { Link } from "react-router-dom";


function Menu() {
  return (
    <div className="h-[90vh] shadow-xl">
      <ul className="flex flex-col items-start justify-center ml-[20px]">
        <Link to="/">
          <li className="flex items-center text-[#D7D7D7] text-[18px] hover:text-[#FFA500] cursor-pointer mt-[20px]">
            <FaHome className="mr-[15px] text-[20px]" />
            Home
          </li>
        </Link>

        <li className="flex items-center text-[#D7D7D7] text-[18px] hover:text-[#FFA500] cursor-pointer mt-[20px]">
          <FaUser className="mr-[15px] text-[20px]" />
          Profile
        </li>
        <hr className="h-[20px]" />
        <Link to="/shipments">
          <li className="flex items-center text-[#D7D7D7] text-[18px] hover:text-[#FFA500] cursor-pointer mt-[20px]">
            <FaShippingFast className="mr-[15px] text-[20px] " />
            Shipments
          </li>
        </Link>
        <Link to="/users">
          <li className="flex items-center text-[#D7D7D7] text-[18px] hover:text-[#FFA500] cursor-pointer mt-[20px]">
            <FaUsers className="mr-[15px] text-[20px]" />
            Users
          </li>
        </Link>
        <li className="flex items-center text-[#D7D7D7] text-[18px] hover:text-[#FFA500] cursor-pointer mt-[20px]">
          <FaFileInvoice className="mr-[15px] text-[20px]" />
          Orders
        </li>
        <hr className="h-[20px]" />
        <li className="flex items-center text-[#D7D7D7] text-[18px] hover:text-[#FFA500] cursor-pointer mt-[20px]">
          <FaElementor className="mr-[15px] text-[20px]" />
          Elements
        </li>
        <li className="flex items-center text-[#D7D7D7] text-[18px] hover:text-[#FFA500] cursor-pointer mt-[20px]">
          <FaCog className="mr-[15px] text-[20px]" />
          Settings
        </li>
        <li className="flex items-center text-[#D7D7D7] text-[18px] hover:text-[#FFA500] cursor-pointer mt-[20px]">
          <FaHdd className="mr-[15px] text-[20px]" />
          Backups
        </li>
        <hr className="h-[20px]" />
        <li className="flex items-center text-[#D7D7D7] text-[18px] hover:text-[#FFA500] cursor-pointer mt-[20px]">
          <FaChartBar className="mr-[15px] text-[20px]" />
          Charts
        </li>
        <li className="flex items-center text-[#D7D7D7] text-[18px] hover:text-[#FFA500] cursor-pointer mt-[20px]">
          <FaClipboard className="mr-[15px] text-[20px]" />
          All logs
        </li>
        <li className="flex items-center text-[#D7D7D7] text-[18px] hover:text-[#FFA500] cursor-pointer mt-[20px]">
          <FaCalendarAlt className="mr-[15px] text-[20px]" />
          Calendar
        </li>
      </ul>
    </div>
  );
}

export default Menu