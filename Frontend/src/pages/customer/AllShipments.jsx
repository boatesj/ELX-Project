import { useEffect, useMemo, useState } from "react";
import { FaArrowLeft, FaSearch } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { shipments } from "@/assets/shipments";

/**
 * SECURITY NOTE (LOCKED):
 * "All Shipments" is an INTERNAL operational view.
 * Customers must NEVER be able to see shipments that are not theirs.
 *
 * This file is kept to avoid breaking imports / historical links,
 * but it hard-gates access and redirects customers to /myshipments.
 */

// ✅ Customer-only keys (must match CustomerLogin.jsx / MyShipments.jsx)
const CUSTOMER_SESSION_KEY = "elx_customer_session_v1";
const CUSTOMER_TOKEN_KEY = "elx_customer_token";
const CUSTOMER_USER_KEY = "elx_customer_user";

// Legacy keys (read-only fallback so older sessions don’t explode)
const LEGACY_TOKEN_KEY = "elx_token";
const LEGACY_USER_KEY = "elx_user";

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

function readCustomerAuth() {
  const token =
    localStorage.getItem(CUSTOMER_TOKEN_KEY) ||
    sessionStorage.getItem(CUSTOMER_TOKEN_KEY) ||
    // legacy fallback (read-only)
    localStorage.getItem(LEGACY_TOKEN_KEY) ||
    sessionStorage.getItem(LEGACY_TOKEN_KEY);

  const session = safeJsonParse(localStorage.getItem(CUSTOMER_SESSION_KEY));

  // expiry enforcement (customer session only)
  if (session?.expiresAt) {
    const exp = new Date(session.expiresAt).getTime();
    if (!Number.isNaN(exp) && Date.now() > exp) {
      clearCustomerAuth();
      return { token: null, user: null };
    }
  }

  const userRaw =
    localStorage.getItem(CUSTOMER_USER_KEY) ||
    sessionStorage.getItem(CUSTOMER_USER_KEY) ||
    // legacy fallback (read-only)
    localStorage.getItem(LEGACY_USER_KEY) ||
    sessionStorage.getItem(LEGACY_USER_KEY);

  const user = safeJsonParse(userRaw) || session?.user || null;

  return { token: token || null, user };
}

/* ------------------------------------------
   REUSABLE OPERATIONS TABLE
------------------------------------------- */
const ShipmentsTable = ({ rows }) => {
  const [sortConfig, setSortConfig] = useState({
    key: "reference",
    direction: "asc",
  });

  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const PAGE_SIZE = 5;

  const handleSort = (columnKey) => {
    setSortConfig((prev) =>
      prev.key === columnKey
        ? {
            key: columnKey,
            direction: prev.direction === "asc" ? "desc" : "asc",
          }
        : { key: columnKey, direction: "asc" }
    );
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const renderSortIndicator = (columnKey) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === "asc" ? " ▲" : " ▼";
  };

  // 1) FILTER BY STATUS + SEARCH
  const filteredRows = rows.filter((row) => {
    const matchesStatus =
      statusFilter === "All" ? true : row.status === statusFilter;

    const query = searchTerm.trim().toLowerCase();
    if (!query) return matchesStatus;

    const haystack = [
      row.reference,
      row.consignee,
      row.from,
      row.destination,
      row.modeLabel,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = haystack.includes(query);

    return matchesStatus && matchesSearch;
  });

  // 2) SORT
  const sortedRows = [...filteredRows].sort((a, b) => {
    const { key, direction } = sortConfig;
    const aStr = String(a[key] ?? "").toLowerCase();
    const bStr = String(b[key] ?? "").toLowerCase();
    if (aStr < bStr) return direction === "asc" ? -1 : 1;
    if (aStr > bStr) return direction === "asc" ? 1 : -1;
    return 0;
  });

  // 3) PAGINATION
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pageRows = sortedRows.slice(startIndex, startIndex + PAGE_SIZE);

  const showingFrom = sortedRows.length === 0 ? 0 : startIndex + 1;
  const showingTo = startIndex + pageRows.length;

  const headerBaseClasses =
    "px-4 py-3 text-left cursor-pointer select-none whitespace-nowrap";

  const goToPage = (page) => setCurrentPage(page);

  return (
    <div className="space-y-3">
      {/* TOP CONTROL BAR */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-xs text-slate-400">
          Showing{" "}
          <span className="font-semibold">
            {showingFrom}-{showingTo}
          </span>{" "}
          of <span className="font-semibold">{sortedRows.length}</span>{" "}
          shipments
        </p>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 uppercase tracking-[0.16em]">
              Search:
            </span>
            <div className="flex items-center gap-2 border border-[#9A9EAB]/60 rounded-full bg-white px-3 py-1.5">
              <FaSearch className="text-[#9A9EAB] text-xs" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Ref, consignee, route…"
                className="text-xs text-[#1A2930] bg-transparent focus:outline-none w-40 sm:w-56"
              />
            </div>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 uppercase tracking-[0.16em]">
              Status:
            </span>
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="border border-[#9A9EAB]/60 rounded-full bg-white px-3 py-1.5 text-xs text-[#1A2930] focus:outline-none focus:ring-2 focus:ring-[#FFA500]/60"
            >
              <option value="All">All</option>
              <option value="Booked">Booked</option>
              <option value="Loaded">Loaded</option>
              <option value="Arrived">Arrived</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-lg shadow-md border border-[#9A9EAB]/40">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-[#1A2930] text-white text-xs uppercase tracking-[0.12em]">
              <th
                className={headerBaseClasses}
                onClick={() => handleSort("reference")}
              >
                Reference{renderSortIndicator("reference")}
              </th>
              <th
                className={headerBaseClasses}
                onClick={() => handleSort("consignee")}
              >
                Consignee{renderSortIndicator("consignee")}
              </th>
              <th
                className={headerBaseClasses}
                onClick={() => handleSort("from")}
              >
                From{renderSortIndicator("from")}
              </th>
              <th
                className={headerBaseClasses}
                onClick={() => handleSort("destination")}
              >
                Destination{renderSortIndicator("destination")}
              </th>
              <th
                className={headerBaseClasses}
                onClick={() => handleSort("status")}
              >
                Status{renderSortIndicator("status")}
              </th>
              <th className="px-4 py-3 text-right text-xs uppercase tracking-[0.12em]">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="text-sm text-[#1A2930] bg-white">
            {pageRows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-xs text-slate-500"
                >
                  No shipments match the current search and filter.
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition"
                >
                  <td className="px-4 py-3">{row.reference}</td>
                  <td className="px-4 py-3">{row.consignee}</td>
                  <td className="px-4 py-3">{row.from}</td>
                  <td className="px-4 py-3">{row.destination}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2 py-1 rounded-full text-xs font-semibold bg-[#FFA500]/10 border border-[#FFA500]/40">
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/shipmentdetails/${row.id}`}>
                      <button className="px-3 py-1 rounded-full text-xs font-semibold bg-[#1A2930] text-white hover:bg-[#FFA500] hover:text-[#1A2930] transition">
                        View
                      </button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
        <div>
          Page <span className="font-semibold">{safePage}</span> of{" "}
          <span className="font-semibold">{totalPages}</span>
        </div>

        <div className="flex items-center gap-2">
          {Array.from({ length: totalPages }, (_, idx) => {
            const page = idx + 1;
            const active = page === safePage;
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded-full border text-[11px] ${
                  active
                    ? "bg-[#1A2930] text-white border-[#1A2930]"
                    : "border-[#9A9EAB] text-[#1A2930] hover:border-[#FFA500] hover:text-[#FFA500]"
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------
   PAGE CONTAINER: /allshipments
   (kept for compatibility; internally gated)
------------------------------------------- */
const AllShipments = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Gate early to prevent any internal data exposure
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const auth = readCustomerAuth();

    // Not logged in at all -> send to login
    if (!auth.token) {
      navigate("/login", { replace: true, state: { from: location.pathname } });
      return;
    }

    /**
     * ✅ Corporate rule:
     * Customers cannot access internal operational shipment lists.
     * Even if they are logged in, redirect them back to their portal list.
     */
    navigate("/myshipments", { replace: true });
  }, [navigate, location.pathname]);

  // While redirecting, render nothing (prevents any flicker)
  if (!allowed) return null;

  // (This block will effectively never run, but we keep it intact to avoid breaking future admin reuse)
  const rows = useMemo(
    () =>
      shipments.map((s) => ({
        id: s.id,
        reference: s.reference,
        consignee: s.consignee,
        from: s.from,
        destination: s.destination,
        status: s.status,
        mode: s.mode,
        modeLabel:
          s.mode === "roro"
            ? "RoRo"
            : s.mode === "container"
            ? "Container"
            : s.mode === "documents"
            ? "Docs"
            : s.mode === "air"
            ? "Air"
            : "Cargo",
      })),
    []
  );

  const total = rows.length;
  const booked = rows.filter((r) => r.status === "Booked").length;
  const loaded = rows.filter((r) => r.status === "Loaded").length;
  const arrived = rows.filter((r) => r.status === "Arrived").length;

  return (
    <div className="bg-[#1A2930] min-h-[60vh] py-8">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/myshipments">
            <button className="inline-flex items-center gap-2 text-xs md:text-sm text-slate-200 hover:text-[#FFA500] transition">
              <FaArrowLeft />
              Back to My Shipments
            </button>
          </Link>

          <span className="text-xs md:text-sm text-slate-300">
            Ellcworth Internal Operations
          </span>
        </div>

        {/* Heading */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-white tracking-wide">
            All Shipments
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Operational view of all shipments handled by Ellcworth Express
            across customers, service types and routes.
          </p>
        </div>

        {/* SUMMARY TILES */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-[#111827] border border-[#9A9EAB]/40 rounded-lg p-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#9A9EAB]">
              Total
            </p>
            <p className="text-xl font-semibold text-white mt-1">{total}</p>
          </div>
          <div className="bg-[#111827] border border-[#FFA500]/40 rounded-lg p-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#FFA500]">
              Booked
            </p>
            <p className="text-xl font-semibold text-white mt-1">{booked}</p>
          </div>
          <div className="bg-[#111827] border border-[#9A9EAB]/40 rounded-lg p-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#9A9EAB]">
              Loaded
            </p>
            <p className="text-xl font-semibold text-white mt-1">{loaded}</p>
          </div>
          <div className="bg-[#111827] border border-emerald-500/40 rounded-lg p-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-300">
              Arrived
            </p>
            <p className="text-xl font-semibold text-white mt-1">{arrived}</p>
          </div>
        </div>

        <ShipmentsTable rows={rows} />
      </div>
    </div>
  );
};

export default AllShipments;
