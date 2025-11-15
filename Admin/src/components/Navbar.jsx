import { Link } from "react-router-dom";

function Navbar() {
  return (
    <div className="h-[100px] bg-gradient-to-r from-[#1A2930] to-[#FFA500] flex items-center justify-between px-10">
      {/* Logo + Brand Name */}
      <div className="flex items-center space-x-3">
        <Link to="/">
          <img
            src="/Logo_elx.png"
            alt="Ellcworth Logo"
            className="w-16 h-auto"
        />
        </Link>
          <span className="text-white text-lg font-bold tracking-wide">
            ELLCWORTH <span className="text-[#FFA500]">EXPRESS</span>
          </span>
      </div>

      {/* Logout Button */}
      <button className="text-white font-semibold hover:text-white transition duration-300">
        Logout
      </button>
    </div>
  );
}

export default Navbar;
