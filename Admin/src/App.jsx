import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { useState } from "react";

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

// NEW: elements / master-data pages
import Elements from "./pages/Elements";
import Ports from "./pages/Ports";
import ServiceTypes from "./pages/ServiceTypes";
import CargoCategories from "./pages/CargoCategories";
import Settings from "./pages/Settings";
import Backups from "./pages/Backups";
import Charts from "./pages/Charts";
import Logs from "./pages/Logs";
import Calendar from "./pages/Calendar";

// Layout wrapper for all authenticated/admin pages
function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const openMenu = () => setIsMenuOpen(true);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div
      className="
        min-h-screen flex flex-col
        text-white font-montserrat
        bg-[#071013]
        bg-[radial-gradient(900px_450px_at_20%_0%,rgba(255,165,0,0.14),transparent_55%),radial-gradient(700px_420px_at_90%_10%,rgba(56,189,248,0.12),transparent_55%),radial-gradient(800px_520px_at_55%_100%,rgba(16,185,129,0.10),transparent_60%)]
      "
    >
      {/* Navbar now needs a burger button on mobile */}
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
              className="absolute inset-0 bg-black/50"
            />

            {/* drawer */}
            <div
              className="
                relative h-full w-[85%] max-w-[320px]
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
                    rounded-lg px-3 py-2 text-sm font-semibold
                    text-white/80 hover:text-white
                    hover:bg-white/10 transition
                  "
                >
                  Close
                </button>
              </div>

              {/* Make menu links close the drawer */}
              <div className="p-2">
                <Menu onNavigate={closeMenu} />
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* consistent mobile padding + max width for “corporate” feel */}
          <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8 py-4">
            <Outlet />
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },

      { path: "shipments", element: <Shipments /> },
      { path: "newshipment", element: <NewShipment /> },
      { path: "shipments/:shipmentId", element: <Shipment /> },

      { path: "users", element: <Users /> },
      { path: "newuser", element: <NewUser /> },
      { path: "users/:id", element: <UserDetails /> },
      { path: "users/:id/edit", element: <EditUser /> },

      { path: "profile", element: <Profile /> },
      { path: "orders", element: <Orders /> },

      { path: "elements", element: <Elements /> },
      { path: "elements/ports", element: <Ports /> },
      { path: "elements/service-types", element: <ServiceTypes /> },
      { path: "elements/cargo-categories", element: <CargoCategories /> },

      { path: "settings", element: <Settings /> },
      { path: "backups", element: <Backups /> },
      { path: "charts", element: <Charts /> },
      { path: "logs", element: <Logs /> },
      { path: "calendar", element: <Calendar /> },
    ],
  },
  { path: "/login", element: <Login /> },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
