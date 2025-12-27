import { useEffect, useMemo, useState } from "react";
import { FaUser, FaFileAlt, FaSignOutAlt } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { shipments } from "@/assets/shipments";

// ✅ Customer-only keys (must match CustomerLogin.jsx)
const CUSTOMER_SESSION_KEY = "elx_customer_session_v1";
const CUSTOMER_TOKEN_KEY = "elx_customer_token";
const CUSTOMER_USER_KEY = "elx_customer_user";

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
    sessionStorage.getItem(CUSTOMER_TOKEN_KEY);

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
    sessionStorage.getItem(CUSTOMER_USER_KEY);

  const user = safeJsonParse(userRaw) || session?.user || null;

  // Extra safety: customer portal must never treat admin as authenticated
  const role = String(user?.role || "").toLowerCase();
  if (role === "admin") {
    clearCustomerAuth();
    return { token: null, user: null };
  }

  return { token: token || null, user };
}

const MyShipments = () => {
  const [open, setOpen] = useState(false);
  const [auth, setAuth] = useState(() => readCustomerAuth());

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const current = readCustomerAuth();
    setAuth(current);

    if (!current.token) {
      navigate("/login", {
        replace: true,
        state: { from: location.pathname },
      });
    }
  }, [navigate, location.pathname]);

  const handleOpen = () => setOpen((prev) => !prev);

  const accountHolderName =
    auth.user?.accountHolderName ||
    auth.user?.fullname ||
    auth.user?.email ||
    "My Account";

  // BUSINESS: only show shipments that belong to this account holder
  const myShipments = useMemo(
    () => shipments.filter((s) => s.accountHolder === accountHolderName),
    [accountHolderName]
  );

  const getStatusClasses = (status) => {
    switch (status) {
      case "Arrived":
        return `
          bg-emerald-500/20
          text-emerald-300
          border border-emerald-500/60
        `;
      case "Loaded":
        return `
          bg-[#9A9EAB]/20
          text-[#9A9EAB]
          border border-[#9A9EAB]/60
        `;
      case "Booked":
      default:
        return `
          bg-[#FFA500]/20
          text-[#FFA500]
          border border-[#FFA500]/60
        `;
    }
  };

  const handleLogout = () => {
    clearCustomerAuth();
    setOpen(false);
    setAuth({ token: null, user: null });
    navigate("/login", { replace: true });
  };

  return (
    <div className="bg-[#1A2930] text-slate-100 min-h-[60vh]">
      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-10 py-8 md:py-10">
        {/* Top bar: title + user menu */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold tracking-wide">
              My Shipments
            </h1>
            <p className="text-xs md:text-sm text-slate-200 mt-1">
              A personalised overview of your active and completed shipments
              handled by Ellcworth Express.
            </p>
          </div>

          <div className="relative">
            <button
              onClick={handleOpen}
              className="
                flex items-center gap-2
                rounded-full
                bg-[#1A2930]
                border border-[#9A9EAB]
                px-3 py-1.5
                text-xs md:text-sm
                font-medium
                hover:border-[#FFA500]
                hover:text-[#FFA500]
                transition
              "
            >
              <span
                className="
                  flex h-8 w-8 items-center justify-center
                  rounded-full
                  bg-[#FFA500]/10
                  text-[#FFA500]
                  text-sm
                "
              >
                <FaUser />
              </span>
              <span className="hidden sm:inline">{accountHolderName}</span>
            </button>

            {open && (
              <div
                className="
                  absolute right-0 mt-2
                  w-52 rounded-md
                  bg-white
                  text-[#1A2930]
                  shadow-xl
                  text-sm
                  z-20
                "
              >
                <ul className="py-2">
                  <li className="px-4 py-2 text-[12px] text-slate-500">
                    Customer menu
                  </li>

                  <li className="px-4 py-2 hover:bg-[#9A9EAB]/10 cursor-pointer flex items-center gap-2">
                    <FaFileAlt className="text-xs" />
                    <span>Statements (coming soon)</span>
                  </li>

                  <li
                    onClick={handleLogout}
                    className="px-4 py-2 hover:bg-[#FFA500]/10 cursor-pointer flex items-center gap-2 text-[#BF2918]"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") handleLogout();
                    }}
                  >
                    <FaSignOutAlt className="text-xs" />
                    <span>Logout</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Shipments list */}
        <div className="space-y-4">
          {myShipments.map((shipment) => (
            <div
              key={shipment.id}
              className="
                rounded-lg
                bg-[#111827]
                border border-[#9A9EAB]/40
                p-4 md:p-5
                flex flex-col md:flex-row
                justify-between
                gap-4
                hover:border-[#FFA500]/70
                hover:shadow-md
                transition
              "
            >
              {/* Left block */}
              <div className="space-y-2">
                <p className="text-[11px] md:text-xs font-semibold tracking-[0.16em] uppercase text-[#9A9EAB]">
                  Shipment ID:{" "}
                  <span className="text-slate-200">{shipment.reference}</span>
                </p>
                <div className="text-sm md:text-base">
                  <p>
                    <span className="text-slate-400">Origin:&nbsp;</span>
                    {shipment.from}
                  </p>
                  <p>
                    <span className="text-slate-400">Destination:&nbsp;</span>
                    {shipment.destination}
                  </p>
                  <p>
                    <span className="text-slate-400">Weight:&nbsp;</span>
                    {shipment.weight} kg
                  </p>
                  <p>
                    <span className="text-slate-400">Booked by:&nbsp;</span>
                    {shipment.accountHolder}
                  </p>
                </div>
              </div>

              {/* Right block */}
              <div className="flex flex-col items-start md:items-end justify-between gap-3">
                <div className="text-sm text-slate-200">
                  <span className="text-slate-400">Booking date:&nbsp;</span>
                  {shipment.date}
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`
                      inline-flex items-center justify-center
                      rounded-full px-3 py-1
                      text-xs md:text-sm font-semibold
                      ${getStatusClasses(shipment.status)}
                    `}
                  >
                    {shipment.status}
                  </span>

                  <Link to={`/shipmentdetails/${shipment.id}`}>
                    <button
                      className="
                        text-xs md:text-sm
                        px-3 py-1.5
                        rounded-full
                        border border-[#9A9EAB]
                        text-slate-100
                        hover:border-[#FFA500]
                        hover:text-[#FFA500]
                        hover:bg-[#FFA500]/10
                        transition
                      "
                    >
                      View details
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {myShipments.length === 0 && (
            <div className="rounded-lg border border-dashed border-[#9A9EAB]/60 bg-[#111827] p-6 text-sm text-slate-200">
              You don’t have any shipments yet. Once you book with Ellcworth
              Express, your active and completed shipments will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyShipments;
