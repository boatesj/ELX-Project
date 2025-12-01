import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="h-[200px] bg-gradient-to-r from-[#1A2930] to-[#FFA500] flex items-center justify-between px-10">
      {/* Logo + Brand */}
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

      {/* Footer Text */}
      <p className="text-white text-sm">
        © {new Date().getFullYear()} Ellcworth Express. All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;
