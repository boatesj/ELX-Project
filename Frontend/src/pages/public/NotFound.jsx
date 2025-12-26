import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="bg-[#1A2930] min-h-[60vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-xl border border-[#9A9EAB]/40 px-8 py-10 max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold text-[#1A2930] mb-2">
          Page not found
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
          Use the links below to get back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/login">
            <button className="w-full sm:w-auto px-4 py-2 rounded-full text-sm font-semibold bg-[#1A2930] text-white hover:bg-[#FFA500] hover:text-[#1A2930] transition">
              Customer Login
            </button>
          </Link>

          <Link to="/">
            <button className="w-full sm:w-auto px-4 py-2 rounded-full text-sm font-semibold border border-[#1A2930] text-[#1A2930] hover:border-[#FFA500] hover:text-[#FFA500] transition">
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
