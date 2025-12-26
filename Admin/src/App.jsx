import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  Navigate,
  useLocation,
  Link,
} from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import Home from "./pages/Home";
import Shipments from "./pages/Shipments";
import Shipment from "./pages/Shipment";
import Navbar from "./components/Navbar";
import Menu from "./components/Menu";
import Footer from "./components/Footer";
import Users from "./pages/Users";
import NewUser from "./pages/NewUser";
import Login from "./pages/Login";
import NewShipment from "./pages/NewShipment";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import UserDetails from "./pages/UserDetails";
import EditUser from "./pages/EditUser";

// elements / master-data pages
import Elements from "./pages/Elements";
import Ports from "./pages/Ports";
import ServiceTypes from "./pages/ServiceTypes";
import CargoCategories from "./pages/CargoCategories";
import Settings from "./pages/Settings";
import Backups from "./pages/Backups";
import Charts from "./pages/Charts";
import Logs from "./pages/Logs";
import Calendar from "./pages/Calendar";

// -------------------- route guards --------------------
function RequireAuth({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("token");

  if (!token) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  return children;
}

/**
 * If already authenticated, keep users out of /login.
 * Honors an incoming redirect query if present (useful for manual /login navigation).
 */
function RequireNoAuth({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("token");

  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const redirect = params.get("redirect") || "/";

  if (token) return <Navigate to={redirect} replace />;
  return children;
}

// -------------------- ui: not found --------------------
function NotFound() {
  return (
    <div className="w-full">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-[0_18px_60px_-28px_rgba(0,0,0,0.8)]">
        <div className="text-xs font-semibold tracking-[0.18em] text-white/60 uppercase">
          Admin
        </div>

        <h1 className="mt-2 text-xl sm:text-2xl font-semibold text-white">
          Page not found
        </h1>

        <p className="mt-2 text-sm text-white/70 max-w-prose">
          The page you’re trying to reach doesn’t exist (or the route hasn’t
          been wired yet).
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to="/"
            className="
              inline-flex items-center justify-center
              rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em]
              bg-[#FFA500] text-[#071013]
              hover:brightness-105 active:brightness-95 transition
            "
          >
            Back to dashboard
          </Link>

          <Link
            to="/shipments"
            className="
              inline-flex items-center justify-center
              rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em]
              border border-white/15 text-white/85
              hover:bg-white/10 hover:text-white transition
            "
          >
            Go to shipments
          </Link>
        </div>
      </div>
    </div>
  );
}

// -------------------- layout: authenticated/admin shell --------------------
function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const openMenu = () => setIsMenuOpen(true);
  const closeMenu = () => setIsMenuOpen(false);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (!isMenuOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMenuOpen]);

  // ESC key closes the drawer
  useEffect(() => {
    if (!isMenuOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") closeMenu();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMenuOpen]);

  return (
    <div
      className="
        min-h-screen flex flex-col
        text-white font-montserrat
        bg-[#071013]
        bg-[radial-gradient(900px_450px_at_20%_0%,rgba(255,165,0,0.14),transparent_55%),radial-gradient(700px_420px_at_90%_10%,rgba(56,189,248,0.12),transparent_55%),radial-gradient(800px_520px_at_55%_100%,rgba(16,185,129,0.10),transparent_60%)]
      "
    >
      <Navbar onMenuClick={openMenu} />

      <div className="flex flex-1 w-full">
        {/* Desktop sidebar (lg+) */}
        <aside
          className="
            hidden lg:block lg:w-[280px] xl:w-[320px]
            border-r border-white/10
            bg-gradient-to-b from-[#0E1B20] to-[#0A1418]
            shadow-[0_18px_60px_-28px_rgba(0,0,0,0.8)]
          "
        >
          <div className="h-full">
            <Menu />
          </div>
        </aside>

        {/* Mobile drawer */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* overlay */}
            <button
              aria-label="Close menu overlay"
              onClick={closeMenu}
              className="absolute inset-0 bg-black/55 backdrop-blur-[1px]"
            />

            {/* drawer */}
            <div
              id="mobile-drawer"
              role="dialog"
              aria-modal="true"
              className="
                relative h-full w-[86%] max-w-[340px]
                border-r border-white/10
                bg-gradient-to-b from-[#0E1B20] to-[#0A1418]
                shadow-[0_24px_70px_rgba(0,0,0,0.75)]
              "
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
                <div className="text-sm font-semibold tracking-[0.16em] text-white">
                  Ellcworth <span className="text-[#FFA500]">ADMIN</span>
                </div>

                <button
                  onClick={closeMenu}
                  className="
                    rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em]
                    text-white/85 hover:text-white
                    hover:bg-white/10 transition
                    border border-white/10
                  "
                >
                  Close
                </button>
              </div>

              {/* Menu links close the drawer */}
              <div className="p-2">
                <Menu onNavigate={closeMenu} />
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8 py-4">
            <Outlet />
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

// -------------------- router map --------------------
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <RequireAuth>
        <Layout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Home /> },

      // Shipments
      { path: "shipments", element: <Shipments /> },
      { path: "newshipment", element: <NewShipment /> },
      { path: "shipments/:shipmentId", element: <Shipment /> },

      // Users
      { path: "users", element: <Users /> },
      { path: "newuser", element: <NewUser /> },
      { path: "users/:id", element: <UserDetails /> },
      { path: "users/:id/edit", element: <EditUser /> },

      // Other admin pages
      { path: "profile", element: <Profile /> },
      { path: "orders", element: <Orders /> },

      // Elements / master data
      { path: "elements", element: <Elements /> },
      { path: "elements/ports", element: <Ports /> },
      { path: "elements/service-types", element: <ServiceTypes /> },
      { path: "elements/cargo-categories", element: <CargoCategories /> },

      // System pages
      { path: "settings", element: <Settings /> },
      { path: "backups", element: <Backups /> },
      { path: "charts", element: <Charts /> },
      { path: "logs", element: <Logs /> },
      { path: "calendar", element: <Calendar /> },

      // 404 inside the authenticated shell
      { path: "*", element: <NotFound /> },
    ],
  },

  // Auth
  {
    path: "/login",
    element: (
      <RequireNoAuth>
        <Login />
      </RequireNoAuth>
    ),
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
