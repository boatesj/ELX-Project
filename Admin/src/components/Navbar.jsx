import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults(null);
      setOpen(false);
      return;
    }
    setLoading(true);
    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/api/v1/search?q=${encodeURIComponent(debouncedQuery)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setResults(data);
        setOpen(true);
      })
      .catch(() => setResults(null))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (path) => {
    setQuery("");
    setResults(null);
    setOpen(false);
    navigate(path);
  };

  const hasResults = results && (results.shipments?.length > 0 || results.users?.length > 0);
  const isEmpty = results && !hasResults;

  return (
    <div ref={containerRef} className="relative hidden md:block">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => hasResults && setOpen(true)}
          placeholder="Search shipments, customers…"
          className="bg-white/8 border border-white/10 rounded-full pl-8 pr-4 py-1.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FFA500]/50 w-56 transition"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border border-[#FFA500] border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {open && (
        <div className="absolute top-full mt-2 right-0 w-80 bg-[#111C24] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
          {isEmpty && (
            <p className="px-4 py-3 text-xs text-gray-500">No results for &ldquo;{query}&rdquo;</p>
          )}

          {results?.shipments?.length > 0 && (
            <div>
              <p className="px-4 pt-3 pb-1 text-[10px] font-bold tracking-[0.2em] uppercase text-[#FFA500]">
                Shipments
              </p>
              {results.shipments.map((s) => (
                <button
                  key={s._id}
                  onClick={() => handleSelect(`/shipments/${s._id}`)}
                  className="w-full text-left px-4 py-2.5 hover:bg-white/5 transition flex items-center justify-between gap-3 group"
                >
                  <div>
                    <p className="text-white text-xs font-semibold group-hover:text-[#FFA500] transition">
                      {s.referenceNo}
                    </p>
                    <p className="text-gray-400 text-[11px]">{s.shipper?.name}</p>
                  </div>
                  <span className="text-[10px] text-gray-500 capitalize shrink-0">
                    {s.status?.replace(/_/g, " ")}
                  </span>
                </button>
              ))}
            </div>
          )}

          {results?.users?.length > 0 && (
            <div className={results?.shipments?.length > 0 ? "border-t border-white/8" : ""}>
              <p className="px-4 pt-3 pb-1 text-[10px] font-bold tracking-[0.2em] uppercase text-[#FFA500]">
                Customers
              </p>
              {results.users.map((u) => (
                <button
                  key={u._id}
                  onClick={() => handleSelect(`/users/${u._id}`)}
                  className="w-full text-left px-4 py-2.5 hover:bg-white/5 transition flex items-center justify-between gap-3 group"
                >
                  <div>
                    <p className="text-white text-xs font-semibold group-hover:text-[#FFA500] transition">
                      {u.fullname || u.company || u.email}
                    </p>
                    <p className="text-gray-400 text-[11px]">{u.email}</p>
                  </div>
                  <span className="text-[10px] text-gray-500 capitalize shrink-0">
                    {u.status}
                  </span>
                </button>
              ))}
            </div>
          )}

          {hasResults && (
            <div className="border-t border-white/8 px-4 py-2">
              <p className="text-[10px] text-gray-600">Press Enter or click a result to navigate</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Navbar({ onMenuClick }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/Logo_elx.png"
              alt="Ellcworth Express"
              className="h-10 w-auto sm:h-11 transition-transform duration-150 group-hover:scale-[1.03]"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-[11px] tracking-[0.28em] uppercase text-gray-300">Ellcworth</span>
              <span className="text-sm sm:text-base font-semibold tracking-[0.16em] text-white">
                EXPRESS <span className="text-[#FFA500]">ADMIN</span>
              </span>
              <span className="hidden text-[10px] text-gray-400 sm:block">UK–Africa shipping portal</span>
            </div>
          </Link>
        </div>

        {/* Right: Nav links + Search + Logout */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Primary nav (desktop only) */}
          <div className="hidden md:flex items-center gap-2 text-xs font-medium">
            <NavLink to="/" className={({ isActive }) => `${baseLink} ${isActive ? activeLink : ""}`}>Dashboard</NavLink>
            <NavLink to="/shipments" className={({ isActive }) => `${baseLink} ${isActive ? activeLink : ""}`}>Shipments</NavLink>
            <NavLink to="/newshipment" className={({ isActive }) => `${baseLink} ${isActive ? activeLink : ""}`}>New shipment</NavLink>
            <NavLink to="/users" className={({ isActive }) => `${baseLink} ${isActive ? activeLink : ""}`}>Customers</NavLink>
          </div>

          <GlobalSearch />

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
